
# News Agent - AI-Powered News Assistant

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://newsagent.dhruv.at)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/dhruvldrp9/News_Agent)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dhruvldrp9/News_Agent)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

## 🌟 Overview
News Agent is an intelligent AI-powered news assistant that provides real-time news updates and summaries. It combines the power of Google Search API, OpenAI's GPT models, and advanced text processing to deliver accurate and concise news information through both text and voice interfaces.

🌐 **Live Demo**: [https://newsagent.dhruv.at](https://newsagent.dhruv.at)

## ✨ Features
- **🔄 Real-Time News Updates**: Fetches latest news using Google Search API
- **🧠 AI-Powered Summarization**: Generates concise summaries using OpenAI GPT-3.5
- **🌍 Regional News Support**: Switch between Global and India-specific news
- **💬 Interactive Chat Interface**: User-friendly web interface for news interaction
- **🎤 Voice Assistant**: Complete voice interaction with speech recognition and synthesis
- **🔊 Text-to-Speech**: Converts news summaries to speech using ElevenLabs
- **📚 Multi-Source Aggregation**: Aggregates news from various reliable sources
- **💾 Chat History**: Persistent conversation history for each user
- **🔐 User Authentication**: Secure login and signup system
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technologies Used
- **Backend**: Python 3.12, Flask
- **AI/ML**: OpenAI GPT-3.5 Turbo, NLTK
- **APIs**: Google Search API (SerpAPI), ElevenLabs Text-to-Speech
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Web Scraping**: BeautifulSoup4, Requests
- **Deployment**: Vercel (Production), Replit (Development)

## 🚀 Quick Deploy

### Deploy to Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dhruvldrp9/News_Agent)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account
3. Set up environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `GOOGLE_NEWS_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `SECRET_KEY`
4. Deploy!

### Deploy to Replit
1. Fork this repository
2. Import to Replit from GitHub
3. Set up environment variables in Replit Secrets
4. Click Run!

## 📋 Prerequisites
- Python 3.8 or higher
- API keys for:
  - OpenAI (GPT API)
  - SerpAPI (Google Search)
  - ElevenLabs (Text-to-Speech)

## 🚀 Local Installation

### 1. Clone the Repository
```bash
git clone https://github.com/dhruvldrp9/News_Agent.git
cd News_Agent
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```bash
cp env.example .env
```

Edit the `.env` file with your API keys:
```env
SECRET_KEY=your_secret_key_here
FLASK_ENV=production
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_NEWS_API_KEY=your_serpapi_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
DOMAIN=localhost:5000
PORT=5000
```

### 4. Create Required Directories
```bash
mkdir -p data static/audio
```

### 5. Run the Application
```bash
python app.py
```

## 🔑 API Keys Setup

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key to your `.env` file

### SerpAPI Key (Google Search)
1. Visit [SerpAPI](https://serpapi.com/)
2. Sign up for a free account (100 searches/month)
3. Get your API key from the dashboard
4. Copy the key to your `.env` file

### ElevenLabs API Key
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Sign up for an account
3. Navigate to your profile settings
4. Copy your API key to your `.env` file

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
News_Agent/
├── app.py                 # Main Flask application
├── models/
│   ├── Communication_OpenAI.py  # Core AI communication logic
│   ├── chat_model.py           # Chat model interface
│   ├── WebScrapper1.py         # Web scraping utilities
│   └── summarizer.py           # Text summarization
├── templates/
│   ├── index.html             # Main chat interface
│   ├── voice.html             # Voice assistant interface
│   ├── login.html             # User login page
│   └── signup.html            # User registration page
├── static/
│   ├── css/                   # Stylesheets
│   ├── js/                    # JavaScript files
│   └── audio/                 # Generated audio files
├── data/                      # User data and chat histories
├── requirements.txt           # Python dependencies
├── vercel.json               # Vercel deployment config
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## 🤝 Contributing
We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues
1. **API Key Errors**: Ensure all API keys are correctly set in your `.env` file
2. **Dependencies Issues**: Try reinstalling with `pip install -r requirements.txt --force-reinstall`
3. **Audio Not Playing**: Check browser permissions for audio playback

### Debug Mode
To run in debug mode for development:
```bash
export FLASK_DEBUG=1
python app.py
```

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments
- OpenAI for providing powerful AI models
- ElevenLabs for text-to-speech capabilities
- SerpAPI for Google Search integration
- The open-source community for various libraries used

## 📞 Contact
- **Developer**: Dhruv Patel
- **Email**: dhruv.ldrp9@gmail.com
- **GitHub**: [@dhruvldrp9](https://github.com/dhruvldrp9)
- **LinkedIn**: [Dhruv Patel](https://linkedin.com/in/dhruvp9)

## 🌟 Star this Repository
If you find this project helpful, please give it a star! ⭐

---

**Live Demo**: [https://newsagent.dhruv.at](https://newsagent.dhruv.at)
