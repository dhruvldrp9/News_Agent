import os
import time
from openai import OpenAI
from serpapi import GoogleSearch
from models.WebScrapper1 import WebScraper


class GPTConversationSystem:
    def __init__(self, openai_api_key: str):
        """Initialize the conversation system with required models and settings."""
        # Initialize OpenAI client
        self.client = OpenAI(api_key=openai_api_key)
        self.scrapper = WebScraper()
        
        # Audio recording settings
        self.samplerate = 44100
        self.channels = 1

        self.agent = "General"
        
        # Conversation history with carefully crafted system prompt
        self.conversation_history = [
            {
                "role": "system",
                "content": """You are an advanced AI assistant engaging in a natural spoken conversation. Your key characteristics are:

                    1. Conversational Style:
                    - Speak naturally and warmly, as if in a face-to-face conversation
                    - Use a friendly, engaging tone while maintaining professionalism
                    - Keep responses concise (2-3 sentences) as they will be spoken aloud
                    - Include appropriate conversational fillers and acknowledgments

                    2. Response Structure:
                    - Directly address the user's input
                    - Stay focused on the current topic
                    - Use natural transitions between topics
                    - Include occasional thoughtful questions to maintain engagement

                    3. Personality Traits:
                    - Show genuine interest in the conversation
                    - Express empathy and understanding
                    - Be knowledgeable but humble
                    - Maintain consistency in personality

                    4. Guidelines:
                    - Avoid overly formal language or technical jargon
                    - Don't repeat the user's words verbatim
                    - Keep responses informative but brief
                    - Express opinions when appropriate while respecting different viewpoints"""
            }
        ]

        self.news_agent = [
            {
                "role": "system", 
                "content": """You are an AI News Companion designed to discuss current events in a natural conversational manner. Your communication must be TTS friendly.

                Core Communication Guidelines:
                1 Speak in clear natural language
                2 Avoid special characters like asterisks or symbols
                3 Use straightforward sentence structures
                4 Prioritize clarity and readability

                News Interaction Approach:
                • Transform news data into engaging narratives
                • Provide context with simple explanations
                • Maintain warm approachable tone
                • Adapt to user's interest level

                Conversation Principles:
                • Treat news as interactive dialogue
                • Ask thoughtful follow up questions
                • Show genuine interest in user perspectives
                • Use conversational yet professional language

                Content Processing:
                • Extract key story details
                • Highlight most significant information
                • Offer balanced perspectives
                • Avoid sensationalism

                Ethical Commitments:
                • Prioritize factual accurate reporting
                • Maintain neutral stance on complex topics
                • Protect user privacy
                • Prevent misinformation spread

                Communication Style:
                • Be informative and engaging
                • Keep responses concise
                • Sound like a knowledgeable friend
                • Invite user participation

                Special TTS Considerations:
                • Speak in smooth linear sentences
                • Eliminate complex punctuation
                • Use clear direct language
                • Ensure smooth audio readability
                        
                
                Here below are the news as per user asked now answer user question with below data."""
            }
        ]
        
        # Track conversation duration for context management
        self.conversation_start = time.time()
        self.last_context_refresh = time.time()
        self.context_refresh_interval = 600  # Refresh context every 10 minutes
        
        # Create audio directory if it doesn't exist
        self.audio_dir = "audio_recordings"
        os.makedirs(self.audio_dir, exist_ok=True)

    def get_global_news(self,user_input):
        params = {
        "engine": "google_news",
        "q": user_input,
        "gl": "in",
        "hl": "en",
        "api_key": os.getenv("GOOGLE_NEWS_API_KEY")
        }

        search = GoogleSearch(params)
        results = search.get_dict()
        result_list = []
        count = 0
        for i in results["news_results"]:
            text = self.scrapper.scrape(i['link'])
            result_list.append(text)
            count += 1
            if count == 4:
                break
        return result_list

    def get_gpt_response(self, user_input: str) -> str:
        """Get response from GPT model"""
        try:
            # Check if we need to refresh context
            current_time = time.time()
            if current_time - self.last_context_refresh > self.context_refresh_interval:
                # Keep system prompt and last 2 exchanges for continuity
                self.conversation_history = [
                    self.conversation_history[0],  # System prompt
                    *self.conversation_history[-4:]  # Last 2 exchanges
                ]
                self.last_context_refresh = current_time

            conversation_history = []

            if self.agent == "General":
                conversation_history = self.conversation_history
            elif self.agent == "news":
                conversation_history = self.news_agent

                conversation_history[0]['content'] += f"""{self.get_global_news(user_input)}
                """
            
            # Add user message to conversation
            conversation_history.append({
                "role": "user",
                "content": user_input
            })

            # print(conversation_history)
            
            # Get response from GPT
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=conversation_history,
                temperature=0.7,
                max_tokens=100,
                top_p=0.9,
                frequency_penalty=0.5,
                presence_penalty=0.5
            )
            
            # Extract the response text correctly
            assistant_response = response.choices[0].message.content.strip()
            
            # Add assistant's response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_response
            })
            
            return assistant_response
            
        except Exception as e:
            print(f"Error getting GPT response: {str(e)}")
            return "I apologize, but I encountered an error. Could you please repeat that?"
