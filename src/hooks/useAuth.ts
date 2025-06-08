import { useState, useEffect } from 'react';
import { authService, PlatformAuth } from '../services/auth';

export function useAuth() {
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, PlatformAuth>>({});
  const [loading, setLoading] = useState(true);

  const platforms = ['youtube', 'twitter', 'linkedin', 'facebook', 'instagram'];

  useEffect(() => {
    const loadAuthData = () => {
      const authData: Record<string, PlatformAuth> = {};
      
      platforms.forEach(platform => {
        const auth = authService.getAuth(platform);
        if (auth) {
          authData[platform] = auth;
        }
      });
      
      setConnectedPlatforms(authData);
      setLoading(false);
    };

    loadAuthData();
  }, []);

  const connectPlatform = async (platform: string) => {
    try {
      switch (platform) {
        case 'youtube':
          await authService.connectYouTube();
          break;
        case 'twitter':
          await authService.connectTwitter();
          break;
        case 'linkedin':
          await authService.connectLinkedIn();
          break;
        case 'facebook':
          await authService.connectFacebook();
          break;
        case 'instagram':
          await authService.connectInstagram();
          break;
        default:
          throw new Error(`Platform ${platform} not supported`);
      }
    } catch (error) {
      console.error(`Failed to connect to ${platform}:`, error);
      throw error;
    }
  };

  const disconnectPlatform = (platform: string) => {
    authService.removeAuth(platform);
    setConnectedPlatforms(prev => {
      const updated = { ...prev };
      delete updated[platform];
      return updated;
    });
  };

  const isConnected = (platform: string): boolean => {
    return platform in connectedPlatforms;
  };

  const refreshPlatformToken = async (platform: string) => {
    try {
      const newAuth = await authService.refreshToken(platform);
      if (newAuth) {
        setConnectedPlatforms(prev => ({
          ...prev,
          [platform]: newAuth
        }));
      } else {
        disconnectPlatform(platform);
      }
    } catch (error) {
      console.error(`Failed to refresh token for ${platform}:`, error);
      disconnectPlatform(platform);
    }
  };

  return {
    connectedPlatforms,
    loading,
    connectPlatform,
    disconnectPlatform,
    isConnected,
    refreshPlatformToken
  };
}