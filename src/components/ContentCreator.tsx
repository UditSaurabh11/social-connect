import React, { useState } from 'react';
import { ArrowLeft, Upload, Calendar, Send, Eye, Youtube, Twitter, Facebook, Linkedin, Instagram, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';

interface ContentCreatorProps {
  onBack: () => void;
}

export function ContentCreator({ onBack }: ContentCreatorProps) {
  const { connectedPlatforms, isConnected } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    scheduleDate: '',
    scheduleTime: '',
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState({
    youtube: true,
    twitter: true,
    facebook: false,
    linkedin: true,
    instagram: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<any[]>([]);

  const platforms = [
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-600', description: 'Primary video platform' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: 'text-blue-400', description: 'Short updates & clips' },
    { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', description: 'Community engagement' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', description: 'Professional network' },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-600', description: 'Visual storytelling' },
  ];

  const handlePlatformToggle = (platformId: string) => {
    if (!isConnected(platformId)) {
      alert(`Please connect to ${platformId} first in the Platform Manager.`);
      return;
    }

    setSelectedPlatforms(prev => ({
      ...prev,
      [platformId]: !prev[platformId as keyof typeof prev]
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        alert('File size must be less than 100MB');
        return;
      }
      setVideoFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedPlatformIds = Object.entries(selectedPlatforms)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform);

    if (selectedPlatformIds.length === 0) {
      alert('Please select at least one platform to publish to.');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in the title and description.');
      return;
    }

    if (selectedPlatformIds.includes('youtube') && !videoFile) {
      alert('Please upload a video file for YouTube.');
      return;
    }

    setIsPublishing(true);
    setPublishResults([]);

    try {
      const content = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        videoFile,
        scheduledAt: formData.scheduleDate && formData.scheduleTime 
          ? new Date(`${formData.scheduleDate}T${formData.scheduleTime}`)
          : undefined
      };

      const results = await apiService.crossPost(content, selectedPlatformIds);
      setPublishResults(results);
      
      // Move to results step
      setCurrentStep(4);
    } catch (error) {
      console.error('Publishing failed:', error);
      alert('Publishing failed. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors duration-200">
              <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Video</h3>
              <p className="text-gray-500 mb-4">Drop your video file here or click to browse (Max 100MB)</p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="video-upload"
              />
              <label
                htmlFor="video-upload"
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 cursor-pointer inline-block"
              >
                Choose File
              </label>
              {videoFile && (
                <p className="mt-2 text-sm text-green-600">
                  ✓ {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your video title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="tech, tutorial, programming"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                placeholder="Describe your video content..."
                required
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Select Platforms</h3>
              <p className="text-gray-600">Choose where you want to publish your content</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {platforms.map((platform) => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms[platform.id as keyof typeof selectedPlatforms];
                const connected = isConnected(platform.id);
                
                return (
                  <div
                    key={platform.id}
                    onClick={() => connected && handlePlatformToggle(platform.id)}
                    className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                      !connected
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                        : isSelected
                        ? 'border-purple-500 bg-purple-50 shadow-md cursor-pointer'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Icon className={`h-6 w-6 ${platform.color}`} />
                      <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{platform.description}</p>
                    
                    {!connected ? (
                      <div className="text-sm text-red-600 font-medium">
                        ⚠ Not connected - Go to Platform Manager
                      </div>
                    ) : isSelected ? (
                      <div className="text-sm text-purple-600 font-medium">
                        ✓ Selected for publishing
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">
                        Click to select
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Schedule & Publish</h3>
              <p className="text-gray-600">Set your publishing preferences</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold text-gray-900">Publishing Schedule</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.scheduleDate}
                    onChange={(e) => setFormData({ ...formData, scheduleDate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                <span className="text-sm text-gray-600">Publish immediately</span>
                <button
                  onClick={handleSubmit}
                  disabled={isPublishing}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isPublishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Publish Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-semibold text-gray-900 mb-3">Platform Previews</h4>
              <div className="space-y-3">
                {Object.entries(selectedPlatforms)
                  .filter(([_, selected]) => selected)
                  .map(([platformId]) => {
                    const platform = platforms.find(p => p.id === platformId);
                    if (!platform) return null;
                    const Icon = platform.icon;
                    
                    return (
                      <div key={platformId} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                        <Icon className={`h-5 w-5 ${platform.color}`} />
                        <span className="font-medium text-gray-900">{platform.name}</span>
                        <span className="text-sm text-green-600 ml-auto">Ready to publish</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Publishing Results</h3>
              <p className="text-gray-600">Here's how your content performed across platforms</p>
            </div>

            <div className="space-y-4">
              {publishResults.map((result, index) => {
                const platform = platforms.find(p => p.id === result.platform);
                if (!platform) return null;
                const Icon = platform.icon;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${
                      result.success
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-6 w-6 ${platform.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-semibold text-gray-900">{platform.name}</h4>
                          {result.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        {result.success ? (
                          <div className="text-sm text-gray-600">
                            <p>Successfully published!</p>
                            {result.url && (
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:text-purple-700 underline"
                              >
                                View post →
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-red-600">
                            Error: {result.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setFormData({
                    title: '',
                    description: '',
                    tags: '',
                    scheduleDate: '',
                    scheduleTime: '',
                  });
                  setVideoFile(null);
                  setPublishResults([]);
                }}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors duration-200"
              >
                Create Another Post
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-600">Upload to YouTube and cross-post to your social networks</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((step) => (
            <React.Fragment key={step}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 4 && (
                <div className={`w-16 h-1 ${
                  currentStep > step ? 'bg-purple-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      {currentStep < 4 && (
        <div className="flex justify-between">
          <button
            onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Previous
          </button>

          <div className="flex space-x-3">
            <button className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Preview</span>
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all duration-200"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isPublishing}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publish</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}