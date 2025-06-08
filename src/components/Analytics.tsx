import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, Users, Heart, MessageCircle, Share, Calendar, Filter, Download } from 'lucide-react';

interface AnalyticsProps {
  onBack: () => void;
}

export function Analytics({ onBack }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState('7d');

  const overallStats = [
    { label: 'Total Posts', value: '247', change: '+12%', trend: 'up' },
    { label: 'Total Reach', value: '1.2M', change: '+23%', trend: 'up' },
    { label: 'Engagement Rate', value: '8.4%', change: '+2.1%', trend: 'up' },
    { label: 'New Followers', value: '2,847', change: '+15%', trend: 'up' },
  ];

  const platformStats = [
    { platform: 'YouTube', posts: 45, reach: '850K', engagement: '12.3%', color: 'bg-red-500' },
    { platform: 'Twitter', posts: 89, reach: '245K', engagement: '6.8%', color: 'bg-blue-400' },
    { platform: 'LinkedIn', posts: 67, reach: '78K', engagement: '15.2%', color: 'bg-blue-700' },
    { platform: 'Facebook', posts: 23, reach: '42K', engagement: '4.1%', color: 'bg-blue-600' },
    { platform: 'Instagram', posts: 34, reach: '156K', engagement: '9.7%', color: 'bg-pink-600' },
  ];

  const topPosts = [
    {
      id: 1,
      title: 'Complete React Tutorial for Beginners',
      platform: 'YouTube',
      reach: '45.2K',
      engagement: '892',
      date: '3 days ago',
      type: 'video'
    },
    {
      id: 2,
      title: 'Quick tip: CSS Grid vs Flexbox',
      platform: 'Twitter',
      reach: '12.8K',
      engagement: '234',
      date: '1 day ago',
      type: 'text'
    },
    {
      id: 3,
      title: 'Building Scalable Applications',
      platform: 'LinkedIn',
      reach: '8.9K',
      engagement: '167',
      date: '2 days ago',
      type: 'article'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your social media performance across all platforms</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overallStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Platform Performance */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Platform Performance</h2>
              <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>

            <div className="space-y-4">
              {platformStats.map((platform) => (
                <div key={platform.platform} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-12 rounded-full ${platform.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{platform.platform}</h3>
                      <span className="text-sm text-gray-500">{platform.posts} posts</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Reach:</span>
                        <span className="font-medium text-gray-900 ml-1">{platform.reach}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Engagement:</span>
                        <span className="font-medium text-gray-900 ml-1">{platform.engagement}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Posts */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Top Performing Posts</h2>
            
            <div className="space-y-4">
              {topPosts.map((post) => (
                <div key={post.id} className="border-l-4 border-purple-500 pl-4 py-2">
                  <h3 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{post.title}</h3>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                    <span className="bg-gray-100 px-2 py-1 rounded">{post.platform}</span>
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{post.reach}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-600">{post.engagement}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 text-purple-600 text-sm font-medium hover:text-purple-700 transition-colors duration-200">
              View All Posts
            </button>
          </div>
        </div>
      </div>

      {/* Engagement Breakdown */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Engagement Breakdown</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">12.4K</p>
            <p className="text-sm text-gray-500">Total Likes</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">3.2K</p>
            <p className="text-sm text-gray-500">Comments</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Share className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">1.8K</p>
            <p className="text-sm text-gray-500">Shares</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">847</p>
            <p className="text-sm text-gray-500">New Followers</p>
          </div>
        </div>
      </div>
    </div>
  );
}