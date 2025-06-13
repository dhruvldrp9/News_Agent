# Updated chat endpoint to handle news region parameter
from flask import Flask, render_template, request, jsonify, redirect, url_for, session
import os
import json
import uuid
from functools import wraps
from datetime import datetime, timedelta
from openai import OpenAI
import time
from elevenlabs import ElevenLabs
from models.chat_model import generate_response
import logging

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['SESSION_COOKIE_SECURE'] = False  # Allow over HTTP for development
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Initialize API clients
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
eleven_client = ElevenLabs(api_key=os.getenv('ELEVEN_LABS_API_KEY'))

# Store conversation sessions
conversation_sessions = {}

# Set up logging
logging.basicConfig(level=logging.INFO)

CHAT_HISTORIES_FILE = 'data/chat_histories.json'

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def load_users():
    try:
        if os.path.exists('data/users.json'):
            with open('data/users.json', 'r') as f:
                data = json.load(f)
                if isinstance(data, dict) and 'users' in data:
                    return data['users']
                return data if isinstance(data, list) else []
        return []
    except Exception as e:
        app.logger.error(f"Error loading users: {str(e)}")
        return []

def save_users(users):
    try:
        os.makedirs('data', exist_ok=True)
        with open('data/users.json', 'w') as f:
            json.dump({'users': users}, f, indent=4)
    except Exception as e:
        app.logger.error(f"Error saving users: {str(e)}")

def load_chat_histories():
    try:
        with open(CHAT_HISTORIES_FILE, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.warning('chat_histories.json not found. Creating a new one.')
        with open(CHAT_HISTORIES_FILE, 'w') as f:
            json.dump({}, f)
        return {}
    except json.JSONDecodeError:
        logging.error('chat_histories.json is invalid. Resetting file.')
        with open(CHAT_HISTORIES_FILE, 'w') as f:
            json.dump({}, f)
        return {}
    except Exception as e:
        logging.error(f'Unexpected error loading chat histories: {e}')
        return {}

def save_chat_histories(histories):
    try:
        os.makedirs('data', exist_ok=True)
        with open(CHAT_HISTORIES_FILE, 'w') as f:
            json.dump(histories, f, indent=2)
        logging.info(f'Chat histories saved successfully. Total users: {len(histories)}')
    except Exception as e:
        logging.error(f'Error saving chat histories: {e}')

@app.route('/')
def index():
    return redirect(url_for('login'))

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

            users = load_users()
            if any(user.get('email') == email for user in users):
                return jsonify({'error': 'Email already registered'}), 400

            new_user = {
                'id': str(uuid.uuid4()),
                'name': name,
                'email': email,
                'password': password
            }

            users.append(new_user)
            save_users(users)

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

            users = load_users()
            user = None
            for u in users:
                if isinstance(u, dict) and u.get('email') == email and u.get('password') == password:
                    user = u
                    break

            if not user:
                return jsonify({'error': 'Invalid email or password'}), 401

            # Ensure user has an ID, create one if missing
            if 'id' not in user:
                user['id'] = str(uuid.uuid4())
                save_users(users)  # Save the updated user data

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

        # Load chat histories
        chat_histories = load_chat_histories()

        # Initialize user's chat history if it doesn't exist
        if user_id not in chat_histories:
            chat_histories[user_id] = []

        # Initialize session if it doesn't exist
        if not session_id:
            session_id = str(uuid.uuid4())

        if session_id not in conversation_sessions:
            conversation_sessions[session_id] = []

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
            conversation_sessions[session_id].append({
                'role': 'assistant',
                'content': ai_response,
                'timestamp': datetime.now().isoformat()
            })

            # Find existing session or create new one
            existing_session = None
            for i, chat in enumerate(chat_histories[user_id]):
                if chat['session_id'] == session_id:
                    existing_session = i
                    break

            current_time = datetime.now().isoformat()

            if existing_session is not None:
                # Update existing session
                chat_histories[user_id][existing_session]['messages'] = conversation_sessions[session_id].copy()
                chat_histories[user_id][existing_session]['last_updated'] = current_time
            else:
                # Create new session
                chat_histories[user_id].append({
                    'session_id': session_id,
                    'messages': conversation_sessions[session_id].copy(),
                    'created_at': current_time,
                    'last_updated': current_time
                })

            save_chat_histories(chat_histories)

            return jsonify({
                'response': ai_response,
                'session_id': session_id
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

        chat_histories = load_chat_histories()
        user_history = chat_histories.get(user_id, [])

        # Sort history by last_updated in descending order
        if user_history:
            user_history.sort(key=lambda x: x.get('last_updated', ''), reverse=True)

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

@app.route('/speak', methods=['POST'])
@login_required
def speak():
    try:
        data = request.get_json()
        text = data.get('text', '')
        session_id = data.get('session_id', '')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

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

        # Save audio file
        audio_path = f"static/audio/response_{int(time.time())}.mp3"
        os.makedirs(os.path.dirname(audio_path), exist_ok=True)
        
        # Write the audio stream to file
        with open(audio_path, 'wb') as f:
            for chunk in audio_stream:
                f.write(chunk)

        return jsonify({
            'success': True,
            'audio_url': f"/{audio_path}"
        })

    except Exception as e:
        app.logger.error(f"Text-to-speech error: {str(e)}")
        return jsonify({'error': 'Error generating audio'}), 500

if __name__ == '__main__':
    app.run(debug=True)