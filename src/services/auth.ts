import axios from 'axios';
import Cookies from 'js-cookie';

export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface PlatformAuth {
  platform: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  userId: string;
  username: string;
}

class AuthService {
  private baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  // YouTube OAuth
  async connectYouTube(): Promise<void> {
    const config = {
      client_id: import.meta.env.VITE_YOUTUBE_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/youtube/callback`,
      scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    };

    const params = new URLSearchParams(config);
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    
    window.location.href = authUrl;
  }

  // Twitter OAuth 2.0
  async connectTwitter(): Promise<void> {
    const config = {
      client_id: import.meta.env.VITE_TWITTER_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/twitter/callback`,
      scope: 'tweet.read tweet.write users.read offline.access',
      response_type: 'code',
      state: this.generateState(),
      code_challenge: await this.generateCodeChallenge(),
      code_challenge_method: 'S256'
    };

    const params = new URLSearchParams(config);
    const authUrl = `https://twitter.com/i/oauth2/authorize?${params}`;
    
    window.location.href = authUrl;
  }

  // LinkedIn OAuth
  async connectLinkedIn(): Promise<void> {
    const config = {
      client_id: import.meta.env.VITE_LINKEDIN_CLIENT_ID,
      redirect_uri: `${window.location.origin}/auth/linkedin/callback`,
      scope: 'w_member_social r_liteprofile',
      response_type: 'code',
      state: this.generateState()
    };

    const params = new URLSearchParams(config);
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params}`;
    
    window.location.href = authUrl;
  }

  // Facebook OAuth
  async connectFacebook(): Promise<void> {
    const config = {
      client_id: import.meta.env.VITE_FACEBOOK_APP_ID,
      redirect_uri: `${window.location.origin}/auth/facebook/callback`,
      scope: 'pages_manage_posts,pages_read_engagement,publish_video',
      response_type: 'code',
      state: this.generateState()
    };

    const params = new URLSearchParams(config);
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
    
    window.location.href = authUrl;
  }

  // Instagram OAuth (via Facebook)
  async connectInstagram(): Promise<void> {
    const config = {
      client_id: import.meta.env.VITE_FACEBOOK_APP_ID,
      redirect_uri: `${window.location.origin}/auth/instagram/callback`,
      scope: 'instagram_basic,instagram_content_publish',
      response_type: 'code',
      state: this.generateState()
    };

    const params = new URLSearchParams(config);
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${params}`;
    
    window.location.href = authUrl;
  }

  // Handle OAuth callbacks
  async handleCallback(platform: string, code: string, state?: string): Promise<PlatformAuth> {
    try {
      const response = await axios.post(`${this.baseURL}/auth/${platform}/callback`, {
        code,
        state,
        redirect_uri: `${window.location.origin}/auth/${platform}/callback`
      });

      const authData: PlatformAuth = response.data;
      this.storeAuth(platform, authData);
      return authData;
    } catch (error) {
      console.error(`Failed to authenticate with ${platform}:`, error);
      throw error;
    }
  }

  // Store authentication data
  private storeAuth(platform: string, authData: PlatformAuth): void {
    Cookies.set(`auth_${platform}`, JSON.stringify(authData), {
      expires: new Date(authData.expiresAt),
      secure: true,
      sameSite: 'strict'
    });
  }

  // Get stored authentication
  getAuth(platform: string): PlatformAuth | null {
    const authData = Cookies.get(`auth_${platform}`);
    if (!authData) return null;

    try {
      const parsed: PlatformAuth = JSON.parse(authData);
      if (Date.now() > parsed.expiresAt) {
        this.removeAuth(platform);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  // Remove authentication
  removeAuth(platform: string): void {
    Cookies.remove(`auth_${platform}`);
  }

  // Check if platform is connected
  isConnected(platform: string): boolean {
    return this.getAuth(platform) !== null;
  }

  // Refresh token if needed
  async refreshToken(platform: string): Promise<PlatformAuth | null> {
    const auth = this.getAuth(platform);
    if (!auth || !auth.refreshToken) return null;

    try {
      const response = await axios.post(`${this.baseURL}/auth/${platform}/refresh`, {
        refresh_token: auth.refreshToken
      });

      const newAuth: PlatformAuth = response.data;
      this.storeAuth(platform, newAuth);
      return newAuth;
    } catch (error) {
      console.error(`Failed to refresh token for ${platform}:`, error);
      this.removeAuth(platform);
      return null;
    }
  }

  // Utility methods
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private async generateCodeChallenge(): Promise<string> {
    const codeVerifier = this.generateState();
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

export const authService = new AuthService();