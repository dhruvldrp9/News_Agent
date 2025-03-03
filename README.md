# News Agent - Real-Time News Communicator

![News_Agent](https://github.com/user-attachments/assets/4a7199ce-a49c-494c-8f1f-f7c0887c3089)


## Overview
News Agent is an intelligent bot that delivers **real-time news updates** to users. It fetches and analyzes the latest headlines using **Google SERP API**, **OpenAI LLM**, and **web scraping with Selenium**, ensuring users stay informed about breaking news, trending topics, and personalized news categories.

## Features
- **Real-Time News Fetching**: Retrieves the latest headlines using Google SERP API.
- **AI-Powered Summarization**: Uses OpenAI LLM to generate concise summaries of news articles.
- **Web Scraping with Selenium**: Extracts detailed information from news websites.
- **User Interaction**: Communicates with users via chat, notifications, or voice updates.
- **Personalized News Feed**: Filters news based on user preferences (e.g., technology, politics, sports).
- **Multi-Source Aggregation**: Gathers news from multiple sources for a comprehensive view.
- **Alert System**: Sends push notifications for critical news events.

## Technologies Used
- **Python**
- **Google SERP API** (for fetching news results)
- **OpenAI LLM** (for generating summaries and insights)
- **Selenium** (for web scraping)
- **Flask / FastAPI** (for API development)
- **WebSockets / Telegram Bot API** (for real-time communication)

## Installation
### Prerequisites
Ensure you have Python installed. You can download it from [python.org](https://www.python.org/downloads/).

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/dhruvldrp9/News_Agent.git
   cd news-agent
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Set up API keys in `.env` file:
   ```
   GOOGLE_SERP_API_KEY=your_api_key_here
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the News Agent:
   ```bash
   python news_agent.py
   ```

## Usage
- Start the News Agent, and it will begin fetching and summarizing the latest news.
- Users can interact with the bot to get personalized news updates.
- Alerts and summaries will be provided based on user preferences.

## Contribution
Contributions are welcome! Feel free to submit issues, feature requests, or pull requests.

## License
This project is licensed under the MIT License.

## Contact
For inquiries, reach out at [your email or GitHub profile].

