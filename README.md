
# Nova AI News Assistant

![News Agent](https://github.com/user-attachments/assets/59877a36-1c0d-4deb-b49b-2d968e5c663c)

## Overview
Nova is an intelligent AI-powered news assistant that delivers real-time news updates through natural conversation. It uses Groq LLM for processing, Google SERP API for news searching, and web scraping with Selenium to provide comprehensive news coverage.

## Features
- **AI-Powered News Delivery**: Get the latest news through natural conversation
- **Voice Interaction**: Speak to Nova and listen to news summaries via ElevenLabs TTS
- **Multi-Source News Aggregation**: News collected from reliable sources
- **Real-Time Updates**: Stay informed about breaking news
- **Responsive UI**: Works seamlessly on both desktop and mobile
- **Light Theme**: Clean, modern interface for easy reading

## Technologies
- **Backend**: Flask, Python
- **AI/ML**: Groq LLM (with OpenAI fallback)
- **Text-to-Speech**: ElevenLabs
- **News Sources**: Google SERP API, Web Scraping
- **Frontend**: HTML, CSS, JavaScript

## Environment Variables Required
- `GROQ_API_KEY`: Your Groq API key
- `OPENAI_API_KEY`: Your OpenAI API key (for fallback)
- `ELEVENLABS_API_KEY`: Your ElevenLabs API key
- `GOOGLE_NEWS_API_KEY`: Your Google SERP API key

## Setup Instructions

### On Replit
1. Fork this project on Replit
2. Set up environment variables in the Secrets tool:
   - Add `GROQ_API_KEY`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, and `GOOGLE_NEWS_API_KEY`
3. Click Run to start the application locally

### Deployment on Replit
1. Click the Deploy button in the top right corner
2. Select "Deploy to Replit"
3. Configure your deployment:
   - **Machine configuration**: Choose based on your needs (1vCPU/2GB recommended)
   - **Run command**: `python app.py`
   - **Environment variables**: Make sure they're copied from your Secrets
4. Click Deploy

## Usage
1. Type your news query in the input box or click the microphone button to speak
2. Nova will search for and summarize the latest news on that topic
3. You can listen to the response by clicking the play button
4. Start a new chat using the "+" button in the header

## Customization
- Modify the UI theme by editing `static/css/styles.css`
- Adjust model parameters in `models/Communication_OpenAI.py`
- Change language settings through the settings menu

## License
This project is licensed under the MIT License.

## Contributors
- [Your Name/Username]
