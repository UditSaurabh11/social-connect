const express = require('express');
const { google } = require('googleapis');
const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Store for OAuth states and code verifiers (in production, use Redis)
const oauthStates = new Map();

// YouTube OAuth callback
router.post('/youtube/callback', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      redirect_uri
    );

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const channelResponse = await youtube.channels.list({
      part: 'snippet,statistics',
      mine: true
    });

    const channel = channelResponse.data.items[0];
    
    const authData = {
      platform: 'youtube',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + (tokens.expiry_date || 3600000),
      userId: channel.id,
      username: channel.snippet.title,
      profileImage: channel.snippet.thumbnails?.default?.url
    };

    res.json(authData);
  } catch (error) {
    console.error('YouTube auth error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Twitter OAuth callback
router.post('/twitter/callback', async (req, res) => {
  try {
    const { code, state, redirect_uri } = req.body;

    // Verify state parameter
    if (!oauthStates.has(state)) {
      return res.status(400).json({ error: 'Invalid state parameter' });
    }

    const codeVerifier = oauthStates.get(state);
    oauthStates.delete(state);

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: redirect_uri,
    });

    // Get user info
    const userClient = new TwitterApi(accessToken);
    const user = await userClient.v2.me({
      'user.fields': ['profile_image_url', 'public_metrics']
    });

    const authData = {
      platform: 'twitter',
      accessToken,
      refreshToken,
      expiresAt: Date.now() + (expiresIn * 1000),
      userId: user.data.id,
      username: user.data.username,
      profileImage: user.data.profile_image_url
    };

    res.json(authData);
  } catch (error) {
    console.error('Twitter auth error:', error);
    res.status(400).json({ error: error.message });
  }
});

// LinkedIn OAuth callback
router.post('/linkedin/callback', async (req, res) => {
  try {
    const { code, state, redirect_uri } = req.body;

    // Exchange code for access token
    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', {
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, expires_in } = tokenResponse.data;

    // Get user profile
    const profileResponse = await axios.get('https://api.linkedin.com/v2/people/~', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'cache-control': 'no-cache',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    const profile = profileResponse.data;

    const authData = {
      platform: 'linkedin',
      accessToken: access_token,
      expiresAt: Date.now() + (expires_in * 1000),
      userId: profile.id,
      username: `${profile.localizedFirstName} ${profile.localizedLastName}`,
      profileImage: profile.profilePicture?.displayImage || null
    };

    res.json(authData);
  } catch (error) {
    console.error('LinkedIn auth error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Facebook OAuth callback
router.post('/facebook/callback', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;

    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri,
        code
      }
    });

    const { access_token } = tokenResponse.data;

    // Get user info and pages
    const userResponse = await axios.get('https://graph.facebook.com/v18.0/me', {
      params: {
        fields: 'id,name,picture',
        access_token
      }
    });

    const user = userResponse.data;

    const authData = {
      platform: 'facebook',
      accessToken: access_token,
      expiresAt: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days
      userId: user.id,
      username: user.name,
      profileImage: user.picture?.data?.url
    };

    res.json(authData);
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Instagram OAuth callback (same as Facebook)
router.post('/instagram/callback', async (req, res) => {
  try {
    const { code, redirect_uri } = req.body;

    // Exchange code for access token
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri,
        code
      }
    });

    const { access_token } = tokenResponse.data;

    // Get Instagram business accounts
    const pagesResponse = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
      params: {
        access_token
      }
    });

    // For simplicity, use the first page with Instagram access
    const page = pagesResponse.data.data[0];

    const authData = {
      platform: 'instagram',
      accessToken: page.access_token,
      expiresAt: Date.now() + (60 * 24 * 60 * 60 * 1000), // 60 days
      userId: page.id,
      username: page.name,
      profileImage: null
    };

    res.json(authData);
  } catch (error) {
    console.error('Instagram auth error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Refresh token endpoints
router.post('/youtube/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    const oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({ refresh_token });
    const { credentials } = await oauth2Client.refreshAccessToken();

    const authData = {
      platform: 'youtube',
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token || refresh_token,
      expiresAt: Date.now() + (credentials.expiry_date || 3600000)
    };

    res.json(authData);
  } catch (error) {
    console.error('YouTube refresh error:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/twitter/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
    });

    const { accessToken, refreshToken, expiresIn } = await client.refreshOAuth2Token(refresh_token);

    const authData = {
      platform: 'twitter',
      accessToken,
      refreshToken,
      expiresAt: Date.now() + (expiresIn * 1000)
    };

    res.json(authData);
  } catch (error) {
    console.error('Twitter refresh error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Generate OAuth state for PKCE
router.post('/generate-state', (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  
  oauthStates.set(state, codeVerifier);
  
  res.json({ state, codeVerifier });
});

module.exports = router;