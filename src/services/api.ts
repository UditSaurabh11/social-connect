import axios from 'axios';
import { authService } from './auth';

export interface PostContent {
  title: string;
  description: string;
  tags: string[];
  videoFile?: File;
  imageFile?: File;
  scheduledAt?: Date;
}

export interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

class APIService {
  private baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  // YouTube API
  async uploadToYouTube(content: PostContent): Promise<PostResult> {
    const auth = authService.getAuth('youtube');
    if (!auth) throw new Error('YouTube not connected');

    try {
      const formData = new FormData();
      if (content.videoFile) {
        formData.append('video', content.videoFile);
      }
      formData.append('title', content.title);
      formData.append('description', content.description);
      formData.append('tags', content.tags.join(','));

      const response = await axios.post(`${this.baseURL}/api/youtube/upload`, formData, {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        platform: 'youtube',
        success: true,
        postId: response.data.id,
        url: `https://youtube.com/watch?v=${response.data.id}`
      };
    } catch (error: any) {
      return {
        platform: 'youtube',
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Twitter API
  async postToTwitter(content: PostContent): Promise<PostResult> {
    const auth = authService.getAuth('twitter');
    if (!auth) throw new Error('Twitter not connected');

    try {
      const tweetText = this.formatForTwitter(content);
      
      const response = await axios.post(`${this.baseURL}/api/twitter/tweet`, {
        text: tweetText
      }, {
        headers: {
          'Authorization': `Bearer ${auth.accessToken}`
        }
      });

      return {
        platform: 'twitter',
        success: true,
        postId: response.data.data.id,
        url: `https://twitter.com/${auth.username}/status/${response.data.data.id}`
      };
    } catch (error: any) {
      return {
        platform: 'twitter',
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // LinkedIn API
  async postToLinkedIn(content: PostContent): Promise<PostResult> {
    const auth = authService.getAuth('linkedin');
    if (!auth) throw new Error('LinkedIn not connected');

    try {
      const postData = {
        author: `urn:li:person:${auth.userId}`,
        lifecycleState: 'PUBLISHED',
        specificContent: {
          'com.linkedin.ugc.ShareContent': {
            shareCommentary: {
              text: this.formatForLinkedIn(content)
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
          'Authorization': `Bearer ${auth.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        platform: 'linkedin',
        success: true,
        postId: response.data.id,
        url: `https://linkedin.com/feed/update/${response.data.id}`
      };
    } catch (error: any) {
      return {
        platform: 'linkedin',
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  // Facebook API
  async postToFacebook(content: PostContent): Promise<PostResult> {
    const auth = authService.getAuth('facebook');
    if (!auth) throw new Error('Facebook not connected');

    try {
      const postData = {
        message: this.formatForFacebook(content),
        access_token: auth.accessToken
      };

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${auth.userId}/feed`,
        postData
      );

      return {
        platform: 'facebook',
        success: true,
        postId: response.data.id,
        url: `https://facebook.com/${response.data.id}`
      };
    } catch (error: any) {
      return {
        platform: 'facebook',
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Instagram API
  async postToInstagram(content: PostContent): Promise<PostResult> {
    const auth = authService.getAuth('instagram');
    if (!auth) throw new Error('Instagram not connected');

    try {
      // Instagram requires image/video upload
      if (!content.imageFile && !content.videoFile) {
        throw new Error('Instagram requires an image or video');
      }

      const caption = this.formatForInstagram(content);
      
      // First, upload media
      const mediaResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${auth.userId}/media`,
        {
          image_url: content.imageFile ? URL.createObjectURL(content.imageFile) : undefined,
          video_url: content.videoFile ? URL.createObjectURL(content.videoFile) : undefined,
          caption: caption,
          access_token: auth.accessToken
        }
      );

      // Then publish the media
      const publishResponse = await axios.post(
        `https://graph.facebook.com/v18.0/${auth.userId}/media_publish`,
        {
          creation_id: mediaResponse.data.id,
          access_token: auth.accessToken
        }
      );

      return {
        platform: 'instagram',
        success: true,
        postId: publishResponse.data.id,
        url: `https://instagram.com/p/${publishResponse.data.id}`
      };
    } catch (error: any) {
      return {
        platform: 'instagram',
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Cross-post to multiple platforms
  async crossPost(content: PostContent, platforms: string[]): Promise<PostResult[]> {
    const results: PostResult[] = [];

    for (const platform of platforms) {
      try {
        let result: PostResult;
        
        switch (platform) {
          case 'youtube':
            result = await this.uploadToYouTube(content);
            break;
          case 'twitter':
            result = await this.postToTwitter(content);
            break;
          case 'linkedin':
            result = await this.postToLinkedIn(content);
            break;
          case 'facebook':
            result = await this.postToFacebook(content);
            break;
          case 'instagram':
            result = await this.postToInstagram(content);
            break;
          default:
            result = {
              platform,
              success: false,
              error: 'Platform not supported'
            };
        }
        
        results.push(result);
      } catch (error: any) {
        results.push({
          platform,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  // Platform-specific formatting
  private formatForTwitter(content: PostContent): string {
    const maxLength = 280;
    let text = `${content.title}\n\n${content.description}`;
    
    if (content.tags.length > 0) {
      const hashtags = content.tags.map(tag => `#${tag}`).join(' ');
      text += `\n\n${hashtags}`;
    }

    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  }

  private formatForLinkedIn(content: PostContent): string {
    let text = `${content.title}\n\n${content.description}`;
    
    if (content.tags.length > 0) {
      const hashtags = content.tags.map(tag => `#${tag}`).join(' ');
      text += `\n\n${hashtags}`;
    }

    return text;
  }

  private formatForFacebook(content: PostContent): string {
    let text = `${content.title}\n\n${content.description}`;
    
    if (content.tags.length > 0) {
      const hashtags = content.tags.map(tag => `#${tag}`).join(' ');
      text += `\n\n${hashtags}`;
    }

    return text;
  }

  private formatForInstagram(content: PostContent): string {
    let text = `${content.title}\n\n${content.description}`;
    
    if (content.tags.length > 0) {
      const hashtags = content.tags.map(tag => `#${tag}`).join(' ');
      text += `\n\n${hashtags}`;
    }

    return text;
  }
}

export const apiService = new APIService();