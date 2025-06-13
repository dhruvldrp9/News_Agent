import os
import time
from openai import OpenAI
from serpapi import GoogleSearch
from models.WebScrapper1 import WebScraper
from models.summarizer import TextSummarizer
from elevenlabs import ElevenLabs

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


class GPTConversationSystem:

    def __init__(self, openai_api_key: str):
        """Initialize the conversation system with required models and settings."""
        # Initialize OpenAI client
        self.client = OpenAI(api_key=openai_api_key)
        self.scrapper = WebScraper()
        self.summarizer = TextSummarizer(10)

        self.eleven_client = ElevenLabs(
            api_key=os.getenv("ELEVENLABS_API_KEY"))

        self.agent = "News"
        self.conversation_history = None

        # Conversation history with carefully crafted system prompt
        self.general_agent = [{
            "role":
            "system",
            "content":
            """You are an advanced AI assistant engaging in a natural spoken conversation. Your key characteristics are:

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
        }]

        self.news_agent = [{
            "role":
            "system",
            "content":
            """You are an AI News Companion designed to discuss current events in a natural conversational manner. Your communication must be TTS friendly.

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

                Strict Rules:
                • Check user query that is related to news.
                • Inform user to only ask about news.
                """
        }]
        if self.agent == "News":
            self.conversation_history = self.news_agent
        else:
            self.conversation_history = self.general_agent

        # Track conversation duration for context management
        self.conversation_start = time.time()
        self.last_context_refresh = time.time()
        self.context_refresh_interval = 600  # Refresh context every 10 minutes

        # Create audio directory if it doesn't exist
        self.audio_dir = "audio_recordings"
        os.makedirs(self.audio_dir, exist_ok=True)

    def get_global_news(self, user_input, news_region='global'):
        # Set up base parameters
        params = {
            "engine": "google",
            "q": user_input,
            "hl": "en",
            "api_key": os.getenv("GOOGLE_NEWS_API_KEY")
        }

        # Add country parameter based on news region selection
        if news_region == 'india':
            params['gl'] = 'in'
        # For global news, we don't set 'gl' parameter to get worldwide results

        search = GoogleSearch(params)
        results = search.get_dict()
        result_list = ''
        for i in results['organic_results'][:5]:
            try:
                text = self.scrapper.scrape(i['link'])
                result_list += text
            except Exception as e:
                continue

    def get_gpt_response(self,
                         user_input: str,
                         news_region: str = 'global') -> str:
        """Get response from Groq model"""
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

            if self.agent == "News":
                user_input = f"""Here is what found on google search news: {self.get_global_news(user_input, news_region)}.
                You need to answer users query with your defined role and this available data only.

                here is a user query: {user_input}.

                answer user query.
                """

            # Add user message to conversation
            self.conversation_history.append({
                "role": "user",
                "content": user_input
            })

            # Get response from OpenAI
            completion = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=self.conversation_history,
                temperature=0.7,
                max_tokens=1000,
                top_p=1,
                stream=False,
            )

            # Extract the response text
            assistant_response = completion.choices[0].message.content.strip()

            # Add assistant's response to history
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_response
            })

            return assistant_response

        except Exception as e:
            print(f"Error getting OpenAI response: {str(e)}")
            return "I apologize, but I encountered an error. Could you please repeat that?"

    def text_to_speech_stream(self, text: str):
        """Convert text to speech and return audio stream"""
        try:
            audio_stream = self.eleven_client.text_to_speech.convert_as_stream(
                voice_id="mfMM3ijQgz8QtMeKifko",
                output_format="mp3_44100_128",
                text=text,
                model_id="eleven_flash_v2_5")
            return audio_stream
        except Exception as e:
            print(f"Error in text to speech conversion: {str(e)}")
            return None
