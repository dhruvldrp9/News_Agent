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
            """You are delivering live news broadcasts. Follow these strict guidelines:

                DELIVERY STYLE:
                • Sound like a professional TV news broadcast
                • Use proper news broadcasting rhythm and pacing
                • Speak with authority and gravitas
                • Never sound conversational or casual

                OPENING FORMATS:
                • "Breaking news this hour..."
                • "Here are tonight's top headlines..."
                • "Good evening. Tonight's top stories..."

                NEWS STRUCTURE:
                • Lead with the most important story
                • Use news-style transitions: "Turning to..." "Meanwhile..." "In related news..."
                • Include specific details: dates, locations, key figures
                • Keep each story brief but informative

                PROFESSIONAL LANGUAGE:
                • "Reports indicate..." "Officials confirm..." "Sources say..."
                • Use present tense for current events
                • Avoid first person references completely
                • No questions to audience
                • No suggestions or advice

                CLOSING:
                • End with: "That concludes tonight's news update."
                • Or: "We'll continue following these developing stories."

                CRITICAL RULES:
                • NEVER identify yourself as a news anchor or reporter
                • NEVER mention specific news channels, sources, or media outlets by name
                • NEVER be conversational or chatty
                • NEVER ask questions to the audience
                • NEVER give opinions or suggestions
                • NEVER promote apps, websites, or news platforms
                • ONLY deliver factual news content without source attribution
                • Sound professional and authoritative at all times
                • Focus purely on the news facts, not where they came from
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
        # Enhanced search queries for better news results
        if news_region == 'india':
            # For India region, prioritize Indian news sources and topics
            if any(keyword in user_input.lower() for keyword in ['today', 'latest', 'current', 'news', 'what']):
                search_query = "India today latest news headlines"
            else:
                search_query = f"{user_input} India news today"
            params = {
                "engine": "google_news",
                "q": search_query,
                "hl": "en",
                "gl": "in",
                "num": 8,
                "api_key": os.getenv("GOOGLE_NEWS_API_KEY")
            }
        else:
            # For global news, get diverse international coverage
            if any(keyword in user_input.lower() for keyword in ['today', 'latest', 'current', 'news', 'what']):
                search_query = "world news today headlines breaking"
            else:
                search_query = f"{user_input} latest news worldwide"
            params = {
                "engine": "google_news",
                "q": search_query,
                "hl": "en",
                "num": 8,
                "api_key": os.getenv("GOOGLE_NEWS_API_KEY")
            }

        try:
            search = GoogleSearch(params)
            results = search.get_dict()
            result_list = ''
            
            if 'news_results' in results:
                for i, article in enumerate(results['news_results'][:5]):
                    try:
                        # Get article content
                        if 'link' in article:
                            text = self.scrapper.scrape(article['link'])
                            if text:
                                title = article.get('title', 'No title')
                                snippet = article.get('snippet', '')
                                source = article.get('source', 'Unknown source')
                                date = article.get('date', 'No date')
                                
                                article_content = f"\n\nArticle {i+1}:\nTitle: {title}\nSource: {source}\nDate: {date}\nSnippet: {snippet}\nContent: {text[:1000]}..."
                                result_list += article_content
                    except Exception as e:
                        print(f"Error scraping article: {str(e)}")
                        continue
            
            # If no news results, try organic results
            if not result_list and 'organic_results' in results:
                for i, article in enumerate(results['organic_results'][:3]):
                    try:
                        if 'link' in article:
                            text = self.scrapper.scrape(article['link'])
                            if text:
                                title = article.get('title', 'No title')
                                snippet = article.get('snippet', '')
                                
                                article_content = f"\n\nArticle {i+1}:\nTitle: {title}\nSnippet: {snippet}\nContent: {text[:1000]}..."
                                result_list += article_content
                    except Exception as e:
                        print(f"Error scraping organic result: {str(e)}")
                        continue
            
            return result_list if result_list else "No recent news articles found for your query."
            
        except Exception as e:
            print(f"Error fetching news: {str(e)}")
            return "Unable to fetch news at this time. Please try again later."

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
                news_data = self.get_global_news(user_input, news_region)
                
                if "No recent news articles found" in news_data or "Unable to fetch news" in news_data:
                    user_input = f"""User asked: {user_input}

No current news data was found for this query. Please respond as a professional news anchor that you are currently unable to access the latest news updates for this specific query. Suggest they try asking about general news topics like world news, politics, technology, business, or sports."""
                else:
                    user_input = f"""Here is the current news data for the user's query:

{news_data}

User originally asked: {user_input}

Present this as a professional news anchor delivering today's top headlines. Focus on the 3-4 most important stories from the data, providing clear headlines and factual reporting."""

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
