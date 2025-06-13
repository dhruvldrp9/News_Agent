
import random
from models.Communication_OpenAI import GPTConversationSystem
import os
from dotenv import load_dotenv

load_dotenv()

communication_agent = GPTConversationSystem(os.getenv('OPENAI_API_KEY'))

def generate_response(conversation_history, news_region):
    """
    Generate a conversational response using the conversation history and news region.
    """
    last_user_message = conversation_history[-1]['content'] if conversation_history else ''

    try:
        # Generate response using the conversation system with news region
        response = communication_agent.get_gpt_response(last_user_message, news_region)
        return response
    except Exception as e:
        print(f"Error in generate_response: {str(e)}")
        return "I apologize, but I encountered an error processing your request."

def text_to_speech_stream(text):
    return communication_agent.text_to_speech_stream(text)

def prepare_context(conversation_history):
    """
    Prepare conversation context for more advanced AI models.
    """
    return conversation_history
