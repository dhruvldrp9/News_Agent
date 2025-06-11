# News Agent - AI-Powered News Assistant

![News_Agent](https://github.com/user-attachments/assets/59877a36-1c0d-4deb-b49b-2d968e5c663c)

## Overview
News Agent is an intelligent AI-powered news assistant that provides real-time news updates and summaries. It combines the power of Google Search API, OpenAI's GPT model, and advanced text processing to deliver accurate and concise news information to users.

## Features
- **Real-Time News Updates**: Fetches latest news using Google Search API
- **AI-Powered Summarization**: Generates concise summaries of news articles
- **Natural Language Processing**: Uses SpaCy for advanced text processing
- **Interactive Chat Interface**: User-friendly web interface for news interaction
- **Text-to-Speech**: Converts news summaries to speech using ElevenLabs
- **Multi-Source News**: Aggregates news from various reliable sources
- **Contextual Understanding**: Maintains conversation context for better interaction

## Technologies Used
- **Backend**: Python, Flask
- **AI/ML**: OpenAI GPT, SpaCy, NLTK
- **APIs**: Google Search API, ElevenLabs
- **Frontend**: HTML, CSS, JavaScript
- **Web Scraping**: BeautifulSoup4

## Installation

### Prerequisites
- Python 3.8 or higher
- API keys for:
  - OpenAI
  - Google Search API
  - ElevenLabs

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/dhruvldrp9/News_Agent.git
   cd News_Agent
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   # Copy the example environment file
   cp env.example .env
   
   # Edit the .env file with your API keys
   nano .env  # or use any text editor
   ```

4. Run the application:
   ```bash
   python app.py
   ```

5. Open your browser and navigate to `http://localhost:5000`

## Usage
1. Type your news query in the chat interface
2. The AI will fetch relevant news and provide a summary
3. Use the microphone button for voice interaction
4. Click the settings button to customize voice settings

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact
For inquiries, reach out at dhruv.ldrp9@gmail.com

