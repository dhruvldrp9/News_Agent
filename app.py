
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import os
import json
import uuid
from functools import wraps
from datetime import datetime, timedelta
import time
from elevenlabs import ElevenLabs
from models.chat_model import generate_response
from models.database import SupabaseDB
import logging
import hashlib
import secrets
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))
app.config['SESSION_COOKIE_SECURE'] = os.environ.get('FLASK_ENV') == 'production'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Strict'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
app.config['SERVER_NAME'] = os.environ.get('DOMAIN', None)

# Initialize API clients
from openai import OpenAI
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
eleven_client = ElevenLabs(api_key=os.getenv('ELEVENLABS_API_KEY'))

# Initialize Supabase database
try:
    db = SupabaseDB()
    app.logger.info("Supabase database initialized successfully")
except Exception as e:
    app.logger.error(f"Failed to initialize Supabase database: {e}")
    db = None

# Store conversation sessions
conversation_sessions = {}

# Set up logging
logging.basicConfig(level=logging.INFO)

CHAT_HISTORIES_FILE = 'data/chat_histories.json'
USER_USAGE_FILE = 'data/user_usage.json'
MAX_QUERIES_PER_USER = 10

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def get_user_by_email(email):
    if db:
        return db.get_user_by_email(email)
    return None

def get_user_by_id(user_id):
    if db:
        return db.get_user_by_id(user_id)
    return None

def create_user(name, email, password_hash):
    if db:
        return db.create_user(name, email, password_hash)
    return None

def get_user_chat_sessions(user_id):
    if db:
        sessions = db.get_user_chat_sessions(user_id)
        # Convert to format expected by frontend
        formatted_sessions = []
        for session in sessions:
            messages = db.get_chat_messages(session['session_id'])
            # Convert message format for frontend compatibility
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    'role': msg['role'],
                    'content': msg['content'],
                    'timestamp': msg['timestamp']
                })
            
            formatted_sessions.append({
                'session_id': session['session_id'],
                'messages': formatted_messages,
                'created_at': session['created_at'],
                'last_updated': session['last_updated']
            })
        return formatted_sessions
    return []

def create_chat_session(session_id, user_id):
    if db:
        return db.create_chat_session(session_id, user_id)
    return None

def add_chat_message(session_id, role, content, timestamp):
    if db:
        return db.add_chat_message(session_id, role, content, timestamp)
    return None

def update_chat_session(session_id):
    if db:
        return db.update_chat_session(session_id)
    return None

def check_user_query_limit(user_id):
    if db:
        user = db.get_user_by_id(user_id)
        if user:
            return user.get('queries_used', 0) < MAX_QUERIES_PER_USER
    return False

def increment_user_queries(user_id):
    if db:
        user = db.get_user_by_id(user_id)
        if user:
            new_count = user.get('queries_used', 0) + 1
            db.update_user_queries(user_id, new_count)
            return new_count
    return 0

@app.route('/')
def index():
    return redirect(url_for('login'))

@app.route('/sitemap.xml')
def sitemap():
    return app.send_static_file('sitemap.xml')

@app.route('/robots.txt')
def robots():
    return app.send_static_file('robots.txt')

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        try:
            data = request.get_json()
            name = data.get('name', '').strip()
            email = data.get('email', '').strip()
            password = data.get('password', '')

            if not all([name, email, password]):
                return jsonify({'error': 'All fields are required'}), 400

            existing_user = get_user_by_email(email)
            if existing_user:
                return jsonify({'error': 'Email already registered'}), 400

            password_hash = generate_password_hash(password)
            new_user = create_user(name, email, password_hash)
            
            if not new_user:
                return jsonify({'error': 'Failed to create user'}), 500

            return jsonify({'success': True}), 200

        except Exception as e:
            app.logger.error(f"Signup error: {str(e)}")
            return jsonify({'error': 'An error occurred during signup'}), 500

    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            data = request.get_json()
            email = data.get('email', '').strip()
            password = data.get('password', '')
            remember = data.get('remember', False)

            if not email or not password:
                return jsonify({'error': 'Please fill in all fields'}), 400

            user = get_user_by_email(email)
            
            if not user or not check_password_hash(user.get('password', ''), password):
                return jsonify({'error': 'Invalid email or password'}), 401

            # Set session data
            session.clear()  # Clear any existing session data
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            session['user_email'] = user['email']

            # Debug logging
            app.logger.info(f"Login successful for user: {user['id']}, name: {user['name']}")

            # Set session expiry based on remember me
            if remember:
                session.permanent = True
                app.permanent_session_lifetime = timedelta(days=30)
            else:
                session.permanent = False

            return jsonify({
                'success': True,
                'redirect': url_for('chat')
            })

        except Exception as e:
            app.logger.error(f"Login error: {str(e)}")
            return jsonify({'error': 'An error occurred during login'}), 500

    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/voice', methods=['GET'])
@login_required
def voice_assistance():
    return render_template('voice.html')

@app.route('/chat', methods=['GET', 'POST'])
@login_required
def chat():
    if request.method == 'POST':
        data = request.json
        message = data.get('message', '')
        session_id = data.get('session_id', '')
        user_id = session.get('user_id')

        # Debug logging
        app.logger.info(f"Session data: {session}")
        app.logger.info(f"User ID from session: {user_id}")
        app.logger.info(f"Request data: {data}")

        if not user_id:
            app.logger.error("No user_id found in session")
            return jsonify({'error': 'User not authenticated'}), 401

        # Check query limit
        if not check_user_query_limit(user_id):
            return jsonify({
                'error': 'Query limit exceeded. You have reached the maximum of 10 queries. Please contact dhruv.ldrp9@gmail.com to continue using the service.',
                'limit_exceeded': True
            }), 429

        # Initialize session if it doesn't exist or if it doesn't exist in database
        if not session_id:
            session_id = str(uuid.uuid4())
            
        # Check if session exists in database, if not create it
        if db:
            existing_messages = db.get_chat_messages(session_id)
            if not existing_messages:
                # Session doesn't exist in database, create it
                create_chat_session(session_id, user_id)
                existing_messages = []
        else:
            existing_messages = []

        # Load conversation session
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = existing_messages

        # Add user message to conversation history
        conversation_sessions[session_id].append({
            'role': 'user',
            'content': message,
            'timestamp': datetime.now().isoformat()
        })

        # Get news region from request (default to global)
        news_region = data.get('news_region', 'global')

        # Generate AI response
        try:
            ai_response = generate_response(conversation_sessions[session_id], news_region)

            # Add AI response to conversation history
            ai_timestamp = datetime.now().isoformat()
            conversation_sessions[session_id].append({
                'role': 'assistant',
                'content': ai_response,
                'timestamp': ai_timestamp
            })

            # Save both messages to database
            user_message_time = conversation_sessions[session_id][-2]['timestamp']  # User message timestamp
            add_chat_message(session_id, 'user', message, user_message_time)
            add_chat_message(session_id, 'assistant', ai_response, ai_timestamp)
            
            # Update session timestamp
            update_chat_session(session_id)

            # Increment user query count
            queries_used = increment_user_queries(user_id)
            remaining_queries = MAX_QUERIES_PER_USER - queries_used

            return jsonify({
                'response': ai_response,
                'session_id': session_id,
                'queries_remaining': remaining_queries
            })
        except Exception as e:
            app.logger.error(f"Error generating response: {str(e)}")
            return jsonify({
                'response': 'Sorry, I encountered an error processing your message.',
                'error': str(e)
            }), 500

    return render_template('index.html')

@app.route('/chat/history', methods=['GET'])
@login_required
def get_chat_history():
    try:
        user_id = session.get('user_id')
        if not user_id:
            app.logger.error(f"No user_id in session: {session}")
            return jsonify({'error': 'User not authenticated'}), 401

        user_history = get_user_chat_sessions(user_id)

        # Also restore conversation sessions from history
        for chat in user_history:
            session_id = chat.get('session_id')
            if session_id and session_id not in conversation_sessions:
                conversation_sessions[session_id] = chat.get('messages', [])

        app.logger.info(f"Retrieved {len(user_history)} chat sessions for user {user_id}")

        return jsonify({
            'history': user_history
        })
    except Exception as e:
        app.logger.error(f"Error getting chat history: {str(e)}")
        return jsonify({'error': 'Failed to load chat history'}), 500

@app.route('/chat/new', methods=['POST'])
@login_required
def new_chat():
    try:
        user_id = session.get('user_id')
        if not user_id:
            app.logger.error(f"No user_id in session: {session}")
            return jsonify({'error': 'User not authenticated'}), 401

        session_id = str(uuid.uuid4())
        conversation_sessions[session_id] = []

        app.logger.info(f"Created new chat session {session_id} for user {user_id}")

        return jsonify({
            'session_id': session_id
        })
    except Exception as e:
        app.logger.error(f"Error creating new chat: {str(e)}")
        return jsonify({'error': 'Failed to create new chat'}), 500

@app.route('/chat/clear-all', methods=['DELETE'])
@login_required
def clear_all_chats():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'User not authenticated'}), 401

        # Clear all chats for this user from database
        if db:
            user_sessions = db.get_user_chat_sessions(user_id)
            
            # Clear from conversation_sessions
            for session in user_sessions:
                session_id = session['session_id']
                if session_id in conversation_sessions:
                    del conversation_sessions[session_id]
            
            # Delete all user chats from database
            db.delete_all_user_chats(user_id)

        app.logger.info(f"Cleared all chat history for user {user_id}")

        return jsonify({
            'success': True,
            'message': 'All chat history cleared successfully'
        })
    except Exception as e:
        app.logger.error(f"Error clearing all chats: {str(e)}")
        return jsonify({'error': 'Failed to clear chat history'}), 500

@app.route('/chat/delete', methods=['DELETE'])
@login_required
def delete_specific_chat():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'error': 'User not authenticated'}), 401

        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'Session ID is required'}), 400

        # Delete specific chat session from database
        if db:
            success = db.delete_chat_session(session_id, user_id)
            
            if success:
                # Also remove from conversation_sessions
                if session_id in conversation_sessions:
                    del conversation_sessions[session_id]
                
                app.logger.info(f"Deleted chat session {session_id} for user {user_id}")
                
                return jsonify({
                    'success': True,
                    'message': 'Chat deleted successfully'
                })
            else:
                return jsonify({'error': 'Chat not found or failed to delete'}), 404
        else:
            return jsonify({'error': 'Database not available'}), 500

    except Exception as e:
        app.logger.error(f"Error deleting specific chat: {str(e)}")
        return jsonify({'error': 'Failed to delete chat'}), 500

@app.route('/speak', methods=['POST'])
@login_required
def speak():
    try:
        data = request.get_json()
        text = data.get('text', '')
        session_id = data.get('session_id', '')
        user_id = session.get('user_id')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        if not user_id:
            return jsonify({'error': 'User not authenticated'}), 401

        # Get or create conversation session for TTS
        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = []

        # Use the Communication_OpenAI class for TTS
        from models.Communication_OpenAI import GPTConversationSystem
        
        openai_api_key = os.getenv('OPENAI_API_KEY')
        if not openai_api_key:
            return jsonify({'error': 'OpenAI API key not configured'}), 500

        gpt_system = GPTConversationSystem(openai_api_key)
        
        # Get audio stream from ElevenLabs
        audio_stream = gpt_system.text_to_speech_stream(text)
        
        if not audio_stream:
            return jsonify({'error': 'Failed to generate audio'}), 500

        # Collect audio data from stream
        audio_data = b''
        for chunk in audio_stream:
            audio_data += chunk

        if not audio_data:
            return jsonify({'error': 'No audio data generated'}), 500

        # Generate unique filename
        timestamp = int(time.time())
        file_name = f"user_{user_id}/response_{timestamp}_{session_id[:8]}.mp3"

        # Upload to Supabase Storage
        if db and db.supabase_admin:
            upload_result = db.upload_audio_file(file_name, audio_data)
            
            if upload_result:
                # Get public URL for the uploaded file
                audio_url = db.get_audio_file_url(file_name)
                
                if audio_url:
                    return jsonify({
                        'success': True,
                        'audio_url': audio_url
                    })
                else:
                    return jsonify({'error': 'Failed to get audio URL'}), 500
            else:
                return jsonify({'error': 'Failed to upload audio to storage'}), 500
        else:
            # Fallback: Return base64 encoded audio if storage is not available
            import base64
            audio_base64 = base64.b64encode(audio_data).decode('utf-8')
            return jsonify({
                'success': True,
                'audio_data': f"data:audio/mpeg;base64,{audio_base64}"
            })

    except Exception as e:
        app.logger.error(f"Text-to-speech error: {str(e)}")
        return jsonify({'error': 'Error generating audio'}), 500

if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
