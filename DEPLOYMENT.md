
# Deployment Guide - News Agent

This guide explains how to deploy News Agent to production using Vercel or Replit.

## Prerequisites

1. **GitHub Account**: Ensure you have a GitHub account
2. **Vercel Account**: Create a free Vercel account
3. **API Keys**: Have all required API keys ready:
   - OpenAI API Key
   - SerpAPI Key (Google Search)
   - ElevenLabs API Key

## Environment Variables

Set up the following environment variables:

```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_NEWS_API_KEY=your_serpapi_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
SECRET_KEY=your_secure_secret_key_here
```

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

#### Quick Deploy
1. Click the "Deploy with Vercel" button in README
2. Connect your GitHub account
3. Set up environment variables in Vercel dashboard
4. Deploy!

#### Manual Deploy
1. Fork/Clone this repository to your GitHub
2. Push your changes to the main branch
3. Connect repository to Vercel
4. Configure environment variables
5. Deploy

#### Vercel Environment Variables Setup
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables:
   - `OPENAI_API_KEY`
   - `GOOGLE_NEWS_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `SECRET_KEY`

### Option 2: Deploy to Replit

1. Import the project from GitHub to Replit
2. Configure environment variables in Replit Secrets
3. Run the application using the Run button
4. Set up custom domain (optional)

## GitHub Setup

### 1. Create Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add remote origin
git remote add origin https://github.com/yourusername/News_Agent.git

# Push to GitHub
git push -u origin main
```

### 2. GitHub Secrets (for Actions)
If using GitHub Actions for deployment, add these secrets in GitHub:
- `VERCEL_TOKEN`
- `ORG_ID`
- `PROJECT_ID`

## Custom Domain Setup (Optional)

### For Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

### For Replit
1. Go to Deployments in Replit
2. Click "Link a domain"
3. Enter your domain
4. Add DNS records to your domain registrar

## Production Checklist

- [ ] All API keys configured
- [ ] Environment variables set
- [ ] Repository pushed to GitHub
- [ ] Application deployed successfully
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Application running without errors
- [ ] Chat functionality working
- [ ] Voice assistant working
- [ ] User authentication working

## Monitoring

Monitor your deployment:
- Check deployment logs for errors
- Monitor API usage for all services
- Track user analytics
- Monitor domain uptime

## Security Notes

- Never commit API keys to GitHub
- Use environment variables for all secrets
- Enable HTTPS-only access
- Monitor for suspicious activities
- Regularly rotate API keys

## Support

For deployment issues:
- Check platform documentation (Vercel/Replit)
- Review application logs
- Contact support: dhruv.ldrp9@gmail.com

---

**Live URL**: https://newsagent.dhruv.at
