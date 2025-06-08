# Social Media Cross-Posting Tool

A comprehensive social media automation tool that allows you to upload content to YouTube and automatically cross-post to multiple social media platforms.

## Features

- **Multi-Platform Publishing**: Upload to YouTube and cross-post to Twitter, LinkedIn, Facebook, and Instagram
- **OAuth Authentication**: Secure authentication with all major social media platforms
- **Content Optimization**: Platform-specific content formatting and optimization
- **Scheduling**: Schedule posts for optimal engagement times
- **Analytics**: Track performance across all platforms
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and fill in your API credentials:

```bash
cp .env.example .env
```

### 2. Platform API Setup

#### YouTube (Google Cloud Console)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Add redirect URI: `http://localhost:5173/auth/youtube/callback`

#### Twitter (Twitter Developer Portal)
1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Enable OAuth 2.0 with PKCE
4. Add redirect URI: `http://localhost:5173/auth/twitter/callback`
5. Request elevated access for posting

#### LinkedIn (LinkedIn Developer Portal)
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Request access to Share on LinkedIn and Sign In with LinkedIn
4. Add redirect URI: `http://localhost:5173/auth/linkedin/callback`

#### Facebook/Instagram (Facebook Developers)
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login and Instagram products
4. Configure OAuth redirect URI: `http://localhost:5173/auth/facebook/callback`
5. Request permissions for pages_manage_posts, instagram_content_publish

### 3. Backend Server

You'll need a backend server to handle OAuth callbacks and API requests. Here's a basic Express.js setup:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// OAuth callback endpoints
app.post('/auth/:platform/callback', async (req, res) => {
  // Handle OAuth callback and exchange code for tokens
});

// API endpoints
app.post('/api/youtube/upload', upload.single('video'), async (req, res) => {
  // Handle YouTube video upload
});

app.post('/api/twitter/tweet', async (req, res) => {
  // Handle Twitter posting
});

// ... other platform endpoints

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
```

### 4. Required Scopes and Permissions

#### YouTube
- `https://www.googleapis.com/auth/youtube.upload`
- `https://www.googleapis.com/auth/youtube.readonly`

#### Twitter
- `tweet.read`
- `tweet.write`
- `users.read`
- `offline.access`

#### LinkedIn
- `w_member_social`
- `r_liteprofile`

#### Facebook
- `pages_manage_posts`
- `pages_read_engagement`
- `publish_video`

#### Instagram
- `instagram_basic`
- `instagram_content_publish`

## Usage

1. **Connect Platforms**: Go to Platform Manager and connect your social media accounts
2. **Create Content**: Use the Content Creator to upload videos and write descriptions
3. **Select Platforms**: Choose which platforms to post to
4. **Schedule or Publish**: Either publish immediately or schedule for later
5. **Monitor Performance**: Check analytics to see how your content is performing

## Security Considerations

- All tokens are stored securely with httpOnly cookies
- OAuth state parameters prevent CSRF attacks
- API calls are made server-side to protect credentials
- Refresh tokens are used to maintain long-term access

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details