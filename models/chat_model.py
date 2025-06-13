import random
from models.Communication_OpenAI import GPTConversationSystem
import os
from dotenv import load_dotenv

load_dotenv()  # <-- This line loads .env variables into the environment

communication_agent = GPTConversationSystem(os.getenv('OPENAI_API_KEY'))

def generate_response(conversation_history):
    """
    Generate a simple conversational response.
    In a real application, this would be replaced with an AI model.
    """
    last_user_message = conversation_history[-1]['content'] if conversation_history else ''
    
    response = communication_agent.get_gpt_response(last_user_message)

    return response

def text_to_speech_stream(text):
    return communication_agent.text_to_speech_stream(text)

def prepare_context(conversation_history):
    """
    Prepare conversation context for more advanced AI models.
    """
    return conversation_history