
# Security Policy

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of News Agent seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **Email**: Send details to dhruv.ldrp9@gmail.com
2. **Subject**: Use "Security Vulnerability Report" as the subject line
3. **Include**: 
   - Detailed description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact assessment
   - Any suggested fixes (if available)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt within 48 hours
- **Initial Assessment**: We will provide an initial assessment within 5 business days
- **Updates**: We will keep you informed of our progress
- **Resolution**: We aim to resolve critical issues within 30 days

### Security Best Practices

When using News Agent:

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Always use `.env` files for sensitive data
3. **Updates**: Keep dependencies updated regularly
4. **Access Control**: Implement proper user authentication
5. **HTTPS**: Use HTTPS in production environments

### Responsible Disclosure

Please do not publicly disclose vulnerabilities until we have had a chance to address them. We appreciate your responsible disclosure and will acknowledge your contribution in our security advisories.

## Security Features

- User authentication and session management
- Input validation and sanitization
- Secure API key management
- Rate limiting (recommended for production)
- CSRF protection (recommended for production)

Thank you for helping keep News Agent secure!
# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.1.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of News Agent seriously. If you discover a security vulnerability, please follow these steps:

### How to Report

1. **Email**: Send details to dhruv.ldrp9@gmail.com
2. **Subject**: Include "SECURITY" in the subject line
3. **Details**: Provide as much information as possible about the vulnerability

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes (if available)

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Varies based on severity (1-30 days)

### Security Measures

News Agent implements several security measures:

- Input validation and sanitization
- Secure session management
- API key protection
- Rate limiting for API calls
- HTTPS enforcement in production
- Secure cookie configuration

### Scope

This security policy applies to:
- The main News Agent application
- All API endpoints
- User authentication system
- Data storage and handling

### Out of Scope

- Third-party services (OpenAI, SerpAPI, ElevenLabs)
- Infrastructure security (handled by Replit)
- Social engineering attacks

## Security Best Practices

When deploying or contributing to News Agent:

1. Keep all dependencies updated
2. Use strong API keys and rotate them regularly
3. Enable HTTPS in production
4. Regularly review access logs
5. Follow the principle of least privilege

Thank you for helping keep News Agent secure!
