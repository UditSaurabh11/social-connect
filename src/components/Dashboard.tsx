import React from 'react';
import { Plus, TrendingUp, Users, Calendar, Youtube, Twitter, Facebook, Linkedin, Instagram, Clock } from 'lucide-react';

type View = 'dashboard' | 'create' | 'platforms' | 'analytics';

interface DashboardProps {
  onViewChange: (view: View) => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const stats = [
    { label: 'Total Posts', value: '247', change: '+12%', trend: 'up' },
    { label: 'Engagement Rate', value: '8.4%', change: '+2.1%', trend: 'up' },
    { label: 'Platforms Connected', value: '5', change: '0', trend: 'neutral' },
    { label: 'Scheduled Posts', value: '18', change: '+6', trend: 'up' },
  ];

  const recentPosts = [
    {
      id: 1,
      title: 'New Product Launch Video',
      platforms: ['youtube', 'twitter', 'linkedin'],
      status: 'published',
      engagement: '2.4K',
      date: '2 hours ago'
    },
    {
      id: 2,
      title: 'Behind the Scenes Content',
      platforms: ['instagram', 'facebook', 'twitter'],
      status: 'scheduled',
      engagement: '-',
      date: 'Tomorrow 9:00 AM'
    },
    {
      id: 3,
      title: 'Weekly Tech Update',
      platforms: ['youtube', 'linkedin'],
      status: 'published',
      engagement: '1.8K',
      date: '1 day ago'
    }
  ];

  const platformIcons = {
    youtube: Youtube,
    twitter: Twitter,
    facebook: Facebook,
    linkedin: Linkedin,
    instagram: Instagram
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Streamline Your Social Media Presence
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Create once, publish everywhere. Upload to YouTube and automatically cross-post to all your social platforms with optimized content for each audience.
        </p>
        <button
          onClick={() => onViewChange('create')}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 inline-flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Post</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`flex items-center space-x-1 text-sm ${
                stat.trend === 'up' ? 'text-green-600' : stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {stat.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                <span>{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recent Posts</h2>
            <button
              onClick={() => onViewChange('analytics')}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              View All
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {recentPosts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-2">{post.title}</h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {post.platforms.map((platform) => {
                        const Icon = platformIcons[platform as keyof typeof platformIcons];
                        return (
                          <div key={platform} className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                            <Icon className="h-3 w-3 text-gray-600" />
                          </div>
                        );
                      })}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      post.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {post.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                    <Users className="h-4 w-4" />
                    <span>{post.engagement}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{post.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}