
# Deployment Guide - News Agent

This guide explains how to deploy News Agent on Vercel.

## Prerequisites

1. **GitHub Account**: Your code repository
2. **Vercel Account**: Create a free Vercel account
3. **API Keys**: Have all required API keys ready:
   - OpenAI API Key
   - SerpAPI Key (Google Search)
   - ElevenLabs API Key
   - Supabase credentials

## Environment Variables

Set up the following environment variables in Vercel:

```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_NEWS_API_KEY=your_serpapi_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SECRET_KEY=your_secure_secret_key_here
```

## Deploy to Vercel

### Method 1: GitHub Integration
1. Visit [Vercel](https://vercel.com/)
2. Sign up or log in
3. Click "New Project"
4. Import from GitHub: `https://github.com/dhruvldrp9/NewsAgent`
5. Configure environment variables
6. Deploy

### Method 2: Vercel CLI
1. Install Vercel CLI: `npm i -g vercel`
2. Clone repository locally
3. Run `vercel` in project directory
4. Follow the deployment prompts
5. Set environment variables via dashboard

## Vercel Environment Variables Setup

1. Go to your Vercel dashboard
2. Select your project
3. Navigate to "Settings" → "Environment Variables"
4. Add each environment variable:
   - Name: Variable name (e.g., `OPENAI_API_KEY`)
   - Value: Your actual API key
   - Environment: Production, Preview, Development
5. Save each variable

## Supabase Database Setup

1. Create a new Supabase project
2. Run the following SQL to create required tables:

```sql
-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usage_count INTEGER DEFAULT 0
);

-- Chat sessions table
CREATE TABLE chat_sessions (
    session_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(session_id),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage bucket for audio files
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-files', 'audio-files', true);
```

## Production Checklist

- [ ] All API keys configured in Vercel environment variables
- [ ] Supabase database tables created
- [ ] Storage bucket configured
- [ ] Application deployed and running
- [ ] Chat functionality working
- [ ] Voice assistant working
- [ ] User authentication working
- [ ] Custom domain configured (if applicable)

## Monitoring

Monitor your deployment:
- Check Vercel dashboard for build logs and runtime errors
- Monitor API usage for all services
- Check Supabase dashboard for database activity
- Set up Vercel analytics for performance monitoring

## Troubleshooting

Common issues:
- **Build Errors**: Check Vercel build logs for Python or dependency issues
- **API Key Errors**: Verify environment variables in Vercel dashboard
- **Database Errors**: Verify Supabase connection and table setup
- **Audio Issues**: Ensure ElevenLabs API key is valid and service role key is set
- **Cold Start Issues**: First request after inactivity may be slower

## Custom Domain

To use a custom domain:
1. Go to Vercel dashboard
2. Select your project
3. Navigate to "Settings" → "Domains"
4. Add your domain and configure DNS

## Support

For deployment issues, contact: dhruv.ldrp9@gmail.com

## Links

- **Live Application**: [newsagent.dhruv.at](https://newsagent.dhruv.at)
- **GitHub Repository**: [github.com/dhruvldrp9/NewsAgent](https://github.com/dhruvldrp9/NewsAgent)
- **Developer LinkedIn**: [linkedin.com/in/dhruvp9](https://linkedin.com/in/dhruvp9)
