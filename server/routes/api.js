const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const { TwitterApi } = require('twitter-api-v2');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// YouTube upload endpoint
router.post('/youtube/upload', upload.single('video'), async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const videoFile = req.file;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    if (!videoFile) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    const videoMetadata = {
      snippet: {
        title,
        description,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        categoryId: '22', // People & Blogs
        defaultLanguage: 'en'
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false
      }
    };

    const media = {
      body: fs.createReadStream(videoFile.path)
    };

    const response = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: videoMetadata,
      media: media
    });

    // Clean up uploaded file
    fs.unlinkSync(videoFile.path);

    res.json({
      id: response.data.id,
      title: response.data.snippet.title,
      url: `https://youtube.com/watch?v=${response.data.id}`
    });

  } catch (error) {
    console.error('YouTube upload error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Twitter post endpoint
router.post('/twitter/tweet', async (req, res) => {
  try {
    const { text, media } = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    const client = new TwitterApi(accessToken);

    let mediaIds = [];
    if (media && media.length > 0) {
      // Upload media files first
      for (const mediaItem of media) {
        const mediaId = await client.v1.uploadMedia(Buffer.from(mediaItem.data, 'base64'), {
          mimeType: mediaItem.type
        });
        mediaIds.push(mediaId);
      }
    }

    const tweetData = {
      text: text.substring(0, 280) // Ensure tweet length limit
    };

    if (mediaIds.length > 0) {
      tweetData.media = { media_ids: mediaIds };
    }

    const response = await client.v2.tweet(tweetData);

    res.json({
      data: response.data,
      url: `https://twitter.com/i/web/status/${response.data.id}`
    });

  } catch (error) {
    console.error('Twitter post error:', error);
    res.status(400).json({ error: error.message });
  }
});

// LinkedIn post endpoint
router.post('/linkedin/post', async (req, res) => {
  try {
    const { text, userId } = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    const postData = {
      author: `urn:li:person:${userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await axios.post('https://api.linkedin.com/v2/ugcPosts', postData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      }
    });

    res.json({
      id: response.data.id,
      url: `https://linkedin.com/feed/update/${response.data.id}`
    });

  } catch (error) {
    console.error('LinkedIn post error:', error);
    res.status(400).json({ error: error.response?.data || error.message });
  }
});

// Facebook post endpoint
router.post('/facebook/post', async (req, res) => {
  try {
    const { message, userId } = req.body;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${userId}/feed`,
      {
        message,
        access_token: accessToken
      }
    );

    res.json({
      id: response.data.id,
      url: `https://facebook.com/${response.data.id}`
    });

  } catch (error) {
    console.error('Facebook post error:', error);
    res.status(400).json({ error: error.response?.data?.error || error.message });
  }
});

// Instagram post endpoint
router.post('/instagram/post', upload.single('media'), async (req, res) => {
  try {
    const { caption, userId } = req.body;
    const mediaFile = req.file;
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ error: 'No access token provided' });
    }

    if (!mediaFile) {
      return res.status(400).json({ error: 'No media file provided for Instagram' });
    }

    // First, upload the media
    const formData = new FormData();
    formData.append('image', fs.createReadStream(mediaFile.path));
    formData.append('caption', caption);
    formData.append('access_token', accessToken);

    const mediaResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${userId}/media`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    // Then publish the media
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${userId}/media_publish`,
      {
        creation_id: mediaResponse.data.id,
        access_token: accessToken
      }
    );

    // Clean up uploaded file
    fs.unlinkSync(mediaFile.path);

    res.json({
      id: publishResponse.data.id,
      url: `https://instagram.com/p/${publishResponse.data.id}`
    });

  } catch (error) {
    console.error('Instagram post error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: error.response?.data?.error || error.message });
  }
});

// Cross-post endpoint
router.post('/cross-post', upload.single('video'), async (req, res) => {
  try {
    const { title, description, tags, platforms, userTokens } = req.body;
    const videoFile = req.file;

    const results = [];
    const parsedPlatforms = JSON.parse(platforms);
    const parsedTokens = JSON.parse(userTokens);

    // YouTube upload first (if selected)
    if (parsedPlatforms.includes('youtube') && videoFile) {
      try {
        const youtubeResult = await uploadToYouTube({
          title,
          description,
          tags,
          videoFile,
          accessToken: parsedTokens.youtube
        });
        results.push({
          platform: 'youtube',
          success: true,
          data: youtubeResult
        });
      } catch (error) {
        results.push({
          platform: 'youtube',
          success: false,
          error: error.message
        });
      }
    }

    // Post to other platforms
    for (const platform of parsedPlatforms) {
      if (platform === 'youtube') continue; // Already handled

      try {
        let result;
        const content = formatContentForPlatform(platform, { title, description, tags });

        switch (platform) {
          case 'twitter':
            result = await postToTwitter(content, parsedTokens.twitter);
            break;
          case 'linkedin':
            result = await postToLinkedIn(content, parsedTokens.linkedin);
            break;
          case 'facebook':
            result = await postToFacebook(content, parsedTokens.facebook);
            break;
          case 'instagram':
            if (videoFile) {
              result = await postToInstagram(content, videoFile, parsedTokens.instagram);
            } else {
              throw new Error('Instagram requires media file');
            }
            break;
        }

        results.push({
          platform,
          success: true,
          data: result
        });

      } catch (error) {
        results.push({
          platform,
          success: false,
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    if (videoFile) {
      fs.unlinkSync(videoFile.path);
    }

    res.json({ results });

  } catch (error) {
    console.error('Cross-post error:', error);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ error: error.message });
  }
});

// Analytics endpoints
router.get('/analytics/overview', async (req, res) => {
  try {
    // Mock analytics data - in production, fetch from each platform's API
    const analytics = {
      totalPosts: 247,
      totalReach: 1200000,
      engagementRate: 8.4,
      newFollowers: 2847,
      platformStats: [
        { platform: 'youtube', posts: 45, reach: 850000, engagement: 12.3 },
        { platform: 'twitter', posts: 89, reach: 245000, engagement: 6.8 },
        { platform: 'linkedin', posts: 67, reach: 78000, engagement: 15.2 },
        { platform: 'facebook', posts: 23, reach: 42000, engagement: 4.1 },
        { platform: 'instagram', posts: 34, reach: 156000, engagement: 9.7 }
      ]
    };

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Helper functions
function formatContentForPlatform(platform, content) {
  const { title, description, tags } = content;
  let text = `${title}\n\n${description}`;
  
  if (tags) {
    const hashtags = tags.split(',').map(tag => `#${tag.trim()}`).join(' ');
    text += `\n\n${hashtags}`;
  }

  switch (platform) {
    case 'twitter':
      return text.length > 280 ? text.substring(0, 277) + '...' : text;
    case 'linkedin':
    case 'facebook':
    case 'instagram':
    default:
      return text;
  }
}

async function uploadToYouTube({ title, description, tags, videoFile, accessToken }) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  const response = await youtube.videos.insert({
    part: 'snippet,status',
    requestBody: {
      snippet: {
        title,
        description,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : []
      },
      status: { privacyStatus: 'public' }
    },
    media: { body: fs.createReadStream(videoFile.path) }
  });

  return {
    id: response.data.id,
    url: `https://youtube.com/watch?v=${response.data.id}`
  };
}

async function postToTwitter(text, accessToken) {
  const client = new TwitterApi(accessToken);
  const response = await client.v2.tweet({ text });
  return {
    id: response.data.id,
    url: `https://twitter.com/i/web/status/${response.data.id}`
  };
}

async function postToLinkedIn(text, accessToken) {
  // Implementation for LinkedIn posting
  return { id: 'linkedin-post-id', url: 'https://linkedin.com/feed/update/linkedin-post-id' };
}

async function postToFacebook(text, accessToken) {
  // Implementation for Facebook posting
  return { id: 'facebook-post-id', url: 'https://facebook.com/facebook-post-id' };
}

async function postToInstagram(text, mediaFile, accessToken) {
  // Implementation for Instagram posting
  return { id: 'instagram-post-id', url: 'https://instagram.com/p/instagram-post-id' };
}

module.exports = router;