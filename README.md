
# News Agent - AI-Powered News Assistant

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://newsagent.dhruv.at)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/dhruvldrp9/NewsAgent)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

## 🌟 Overview
News Agent is an intelligent AI-powered news assistant that provides real-time news updates and summaries. It combines the power of Google Search API, OpenAI's GPT models, and advanced text processing to deliver accurate and concise news information through both text and voice interfaces.

## ✨ Features
- **🔄 Real-Time News Updates**: Fetches latest news using Google Search API
- **🧠 AI-Powered Summarization**: Generates concise summaries using OpenAI GPT-3.5
- **🌍 Regional News Support**: Switch between Global and India-specific news
- **💬 Interactive Chat Interface**: User-friendly web interface for news interaction
- **🎤 Voice Assistant**: Complete voice interaction with speech recognition and synthesis
- **🔊 Text-to-Speech**: Converts news summaries to speech using ElevenLabs
- **📚 Multi-Source Aggregation**: Aggregates news from various reliable sources
- **💾 Chat History**: Persistent conversation history using Supabase
- **🔐 User Authentication**: Secure login and signup system
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technologies Used
- **Backend**: Python 3.12, Flask
- **AI/ML**: OpenAI GPT-3.5 Turbo, NLTK
- **APIs**: Google Search API (SerpAPI), ElevenLabs Text-to-Speech
- **Database**: Supabase (PostgreSQL)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Web Scraping**: BeautifulSoup4, Requests
- **Deployment**: Vercel

## 🚀 Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dhruvldrp9/NewsAgent.git
   cd NewsAgent
   ```
2. **Set up environment variables**:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `GOOGLE_NEWS_API_KEY` - Your SerpAPI key
   - `ELEVENLABS_API_KEY` - Your ElevenLabs API key
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_ANON_KEY` - Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `SECRET_KEY` - A secure secret key for sessions
3. **Deploy to Vercel** or run locally with `python app.py`

## 📋 Prerequisites
- API keys for:
  - OpenAI (GPT API)
  - SerpAPI (Google Search)
  - ElevenLabs (Text-to-Speech)
  - Supabase (Database)

## 🔑 API Keys Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create account and get API key
3. Add to environment variables as `OPENAI_API_KEY`

### SerpAPI Key (Google Search)
1. Visit [SerpAPI](https://serpapi.com/)
2. Sign up for free account (100 searches/month)
3. Add to environment variables as `GOOGLE_NEWS_API_KEY`

### ElevenLabs API Key
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Sign up and get API key
3. Add to environment variables as `ELEVENLABS_API_KEY`

### Supabase Setup
1. Visit [Supabase](https://supabase.com/)
2. Create new project
3. Get URL, anon key, and service role key
4. Add to environment variables

## 🎯 Usage

### Text Chat
1. Navigate to the main chat interface
2. Select news region (Global/India)
3. Ask questions about current news
4. Get AI-powered summaries and insights

### Voice Assistant
1. Click on "Voice Assistant" in the header
2. Tap the microphone button to start
3. Speak your news query
4. Listen to AI-generated audio responses

## 📁 Project Structure
```
NewsAgent/
├── app.py                 # Main Flask application
├── models/
│   ├── Communication_OpenAI.py  # Core AI communication logic
│   ├── chat_model.py           # Chat model interface
│   ├── WebScrapper1.py         # Web scraping utilities
│   ├── database.py             # Supabase database interface
│   └── summarizer.py           # Text summarization
├── templates/              # HTML templates
├── static/                # CSS, JS, and static assets
├── requirements.txt       # Python dependencies
└── env.example           # Environment variables template
```

## 🚀 Deployment

This application is deployed on Vercel. To deploy your own instance:

1. Fork this repository
2. Connect your GitHub account to Vercel
3. Import the repository in Vercel
4. Set up environment variables in Vercel dashboard
5. Deploy automatically

## 🤝 Contributing
We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes and test thoroughly
4. Submit a pull request

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact
- **Developer**: Dhruv Patel
- **Email**: dhruv.ldrp9@gmail.com
- **LinkedIn**: [linkedin.com/in/dhruvp9](https://linkedin.com/in/dhruvp9)
- **GitHub**: [@dhruvldrp9](https://github.com/dhruvldrp9)

---

**Live Demo**: [newsagent.dhruv.at](https://newsagent.dhruv.at)
