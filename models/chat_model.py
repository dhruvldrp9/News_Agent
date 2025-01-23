import random

def generate_response(conversation_history):
    """
    Generate a simple conversational response.
    In a real application, this would be replaced with an AI model.
    """
    last_user_message = conversation_history[-1]['content'] if conversation_history else ''
    
    # Simple response generation logic
    responses = [
        f"I heard you say: {last_user_message}",
        "That's interesting! Tell me more.",
        "I'm processing your message.",
        "Can you elaborate on that?",
        "I'm listening carefully.",
    ]

    return random.choice(responses)

def prepare_context(conversation_history):
    """
    Prepare conversation context for more advanced AI models.
    """
    return conversation_history