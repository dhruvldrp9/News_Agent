from flask import Flask, render_template, request, jsonify, Response
from models.chat_model import generate_response, text_to_speech_stream
import uuid

app = Flask(__name__)

# Session management for conversation context
conversation_sessions = {}

@app.route('/')
def index():
    # Generate a unique session ID for each new conversation
    session_id = str(uuid.uuid4())
    return render_template('index.html', session_id=session_id)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    session_id = data.get('session_id', '')

    # Retrieve or create conversation session
    if session_id not in conversation_sessions:
        conversation_sessions[session_id] = []

    # Add user message to conversation history
    conversation_sessions[session_id].append({
        'role': 'user',
        'content': message
    })

    # Generate AI response
    try:
        ai_response = generate_response(conversation_sessions[session_id])
        
        # Add AI response to conversation history
        conversation_sessions[session_id].append({
            'role': 'assistant',
            'content': ai_response
        })

        return jsonify({
            'response': ai_response,
            'session_id': session_id
        })
    except Exception as e:
        return jsonify({
            'response': 'Sorry, I encountered an error processing your message.',
            'error': str(e)
        }), 500
    
@app.route('/speak', methods=['POST'])
def speak():
    data = request.json
    text = data['text']
    
    # Get audio stream
    audio_stream = text_to_speech_stream(text)
    
    if audio_stream:
        def generate():
            for chunk in audio_stream:
                yield chunk
                
        return Response(generate(), mimetype='audio/mpeg')
    else:
        return {'error': 'Text to speech conversion failed'}, 500

if __name__ == '__main__':
    app.run(debug=True)