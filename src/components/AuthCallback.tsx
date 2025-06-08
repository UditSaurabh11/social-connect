import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function AuthCallback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(error);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Extract platform from pathname
        const platform = location.pathname.split('/')[2];
        
        await authService.handleCallback(platform, code, state || undefined);
        
        setStatus('success');
        setMessage(`Successfully connected to ${platform}!`);
        
        // Redirect back to platform manager after 2 seconds
        setTimeout(() => {
          navigate('/platforms');
        }, 2000);
        
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Authentication failed');
        
        // Redirect back to platform manager after 3 seconds
        setTimeout(() => {
          navigate('/platforms');
        }, 3000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connecting your account...
              </h2>
              <p className="text-gray-600">
                Please wait while we complete the authentication process.
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connection Successful!
              </h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting you back to the platform manager...
              </p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Connection Failed
              </h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting you back to try again...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}