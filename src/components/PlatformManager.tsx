import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Settings, Check, AlertCircle, Youtube, Twitter, Facebook, Linkedin, Instagram, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface PlatformManagerProps {
  onBack: () => void;
}

export function PlatformManager({ onBack }: PlatformManagerProps) {
  const { connectedPlatforms, loading, connectPlatform, disconnectPlatform, isConnected } = useAuth();

  const platforms = [
    {
      id: 'youtube',
      name: 'YouTube',
      icon: Youtube,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      features: ['Video Upload', 'Shorts', 'Community Posts']
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: Twitter,
      color: 'text-blue-400',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['Tweets', 'Threads', 'Spaces']
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['Posts', 'Articles', 'Videos']
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['Posts', 'Stories', 'Reels']
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      features: ['Posts', 'Stories', 'Reels', 'IGTV']
    }
  ];

  const handleConnect = async (platformId: string) => {
    try {
      await connectPlatform(platformId);
    } catch (error) {
      console.error(`Failed to connect to ${platformId}:`, error);
      alert(`Failed to connect to ${platformId}. Please try again.`);
    }
  };

  const handleDisconnect = (platformId: string) => {
    if (confirm(`Are you sure you want to disconnect from ${platformId}?`)) {
      disconnectPlatform(platformId);
    }
  };

  const connectedCount = Object.keys(connectedPlatforms).length;
  const totalReach = Object.values(connectedPlatforms).reduce((sum, platform) => {
    // Mock follower counts - in production, fetch from APIs
    const mockFollowers = {
      youtube: 125000,
      twitter: 45000,
      linkedin: 12000,
      facebook: 8000,
      instagram: 25000
    };
    return sum + (mockFollowers[platform.platform as keyof typeof mockFollowers] || 0);
  }, 0);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Manager</h1>
          <p className="text-gray-600">Connect and manage your social media accounts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Connected Platforms</p>
              <p className="text-2xl font-bold text-gray-900">{connectedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Reach</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalReach > 1000 ? `${Math.round(totalReach / 1000)}K` : totalReach}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Settings className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Auto-Post Enabled</p>
              <p className="text-2xl font-bold text-gray-900">{connectedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          const connected = isConnected(platform.id);
          const platformData = connectedPlatforms[platform.id];
          
          return (
            <div
              key={platform.id}
              className={`bg-white rounded-xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                connected ? platform.borderColor : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${platform.bgColor}`}>
                      <Icon className={`h-6 w-6 ${platform.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                      {connected && platformData ? (
                        <p className="text-sm text-gray-500">@{platformData.username}</p>
                      ) : (
                        <p className="text-sm text-gray-500">Not connected</p>
                      )}
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                    connected
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {connected ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        <span>Disconnected</span>
                      </>
                    )}
                  </div>
                </div>

                {connected && (
                  <div className="mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>Auto-posting enabled</span>
                      <span>•</span>
                      <span>Connected {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Supported Features:</p>
                  <div className="flex flex-wrap gap-2">
                    {platform.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  {connected ? (
                    <>
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>Configure</span>
                      </button>
                      <button
                        onClick={() => handleDisconnect(platform.id)}
                        className="py-2 px-4 text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleConnect(platform.id)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Connect</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Platform */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Another Platform?</h3>
          <p className="text-gray-600 mb-4">
            We're constantly adding support for new social media platforms. Let us know which one you'd like to see next!
          </p>
          <button className="bg-white text-purple-600 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors duration-200 border border-purple-200">
            Request Platform
          </button>
        </div>
      </div>
    </div>
  );
}