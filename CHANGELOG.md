
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-06-14

### Added
- Production deployment on newsagent.dhruv.at
- Enhanced SEO optimization with structured data
- Progressive Web App (PWA) support with web manifest
- Improved meta tags for social media sharing
- Multiple favicon formats for better browser support
- Updated sitemap with current domain
- Enhanced security configurations for production

### Changed
- Migrated from Groq to OpenAI GPT-3.5 Turbo for better reliability
- Updated all domain references to newsagent.dhruv.at
- Improved responsive design and accessibility
- Enhanced production configuration settings

## [1.0.0] - 2024-06-13

### Added
- Initial release of News Agent
- AI-powered news summarization using OpenAI GPT-3.5
- Real-time news fetching with Google Search API (SerpAPI)
- Interactive chat interface for news queries
- Voice assistant with speech recognition and text-to-speech
- User authentication system (signup/login)
- Chat history persistence
- Regional news support (Global/India)
- Responsive web design
- Text-to-speech using ElevenLabs API
- Web scraping for news content
- Advanced text summarization with NLTK
- Multi-user support with session management

### Features
- **Chat Interface**: Real-time conversation with AI news assistant
- **Voice Assistant**: Complete voice interaction experience
- **News Regions**: Switch between Global and India-specific news
- **User Accounts**: Secure user registration and authentication
- **Chat History**: Persistent conversation history for each user
- **Audio Playback**: High-quality text-to-speech synthesis
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live news fetching and processing

### Technical Implementation
- Flask web framework for backend
- OpenAI GPT-3.5-turbo for AI responses
- SerpAPI for Google Search integration
- ElevenLabs for text-to-speech synthesis
- SpaCy and NLTK for text processing
- BeautifulSoup4 for web scraping
- Modern JavaScript for frontend interactions
- CSS3 with custom design system

### Security
- Secure session management
- Environment variable protection for API keys
- Input validation and sanitization
- User authentication and authorization

## [Unreleased]

### Planned Features
- Mobile app version
- Additional news sources integration
- Advanced filtering options
- Push notifications
- Offline reading mode
- Social sharing features
- Analytics dashboard
- API rate limiting
- Enhanced security measures

---

For more details about each release, please check the [GitHub releases page](https://github.com/dhruvldrp9/News_Agent/releases).
