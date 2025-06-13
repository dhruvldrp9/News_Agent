
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
