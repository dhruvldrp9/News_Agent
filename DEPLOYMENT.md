
# Deployment Guide - News Agent

This guide explains how to deploy News Agent to production using Replit.

## Prerequisites

1. **Replit Account**: Ensure you have a Replit account
2. **Domain**: Your domain `newsagent.dhruv.at` should be ready
3. **API Keys**: Have all required API keys ready:
   - OpenAI API Key
   - SerpAPI Key (Google Search)
   - ElevenLabs API Key

## Environment Variables

Set up the following environment variables in Replit:

```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_NEWS_API_KEY=your_serpapi_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
SECRET_KEY=your_secure_secret_key_here
```

## Deployment Steps

### 1. Prepare the Repository
- Ensure all files are committed to GitHub
- Push to main branch
- Verify all dependencies are in `requirements.txt`

### 2. Deploy on Replit
1. Import the project from GitHub to Replit
2. Configure environment variables in Replit Secrets
3. Run the application using the Run button
4. Test all functionality

### 3. Custom Domain Setup
1. Go to Deployments in Replit
2. Click "Link a domain"
3. Enter `newsagent.dhruv.at`
4. Copy the A and TXT records provided
5. Add these records to your domain DNS settings

### 4. DNS Configuration
Add the following records to your domain registrar:

**A Record:**
- Name: `@` (or newsagent)
- Value: [IP from Replit]

**TXT Record:**
- Name: `@` (or newsagent)
- Value: [TXT value from Replit]

### 5. SSL Certificate
- Replit automatically provisions SSL certificates
- Wait for DNS propagation (5-60 minutes)
- Verify HTTPS access

## Production Checklist

- [ ] All API keys configured
- [ ] Domain DNS records added
- [ ] SSL certificate active
- [ ] Application running without errors
- [ ] Chat functionality working
- [ ] Voice assistant working
- [ ] User authentication working
- [ ] Database persistence working

## Monitoring

Monitor your deployment:
- Check Replit console for errors
- Monitor user usage limits
- Track API usage for all services
- Monitor domain uptime

## Security Notes

- Never commit API keys to GitHub
- Use Replit Secrets for environment variables
- Enable HTTPS-only access
- Monitor for suspicious activities

## Support

For deployment issues:
- Check Replit documentation
- Contact support: dhruv.ldrp9@gmail.com
- Review application logs

---

**Live URL**: https://newsagent.dhruv.at
