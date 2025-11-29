import React, { useState } from 'react';
import { DashboardLayout } from '../Dashboard/DashboardLayout';
import { ConnectorCard } from './ConnectorCard';
import { Youtube, Instagram, Linkedin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logger } from '../../utils/logger';
import { config } from '../../config';

interface Connector {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error' | 'expired';
  accountName?: string;
  lastSync?: Date;
}

export const ConnectorSettings: React.FC = () => {
  const { user } = useAuth();
  const [connectors, setConnectors] = useState<Connector[]>([
    {
      id: 'youtube',
      name: 'YouTube',
      icon: <Youtube className="w-6 h-6 text-red-500" />,
      status: 'disconnected'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: <Instagram className="w-6 h-6 text-pink-500" />,
      status: 'disconnected'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: <div className="w-6 h-6 bg-black rounded-sm" />,
      status: 'disconnected'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Linkedin className="w-6 h-6 text-blue-600" />,
      status: 'disconnected'
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      icon: <div className="w-6 h-6 bg-red-600 rounded-full" />,
      status: 'disconnected'
    }
  ]);

  const handleConnect = async (connectorId: string) => {
    try {
      const state = btoa(JSON.stringify({
        userId: user?.id,
        connectorId,
        redirectUrl: window.location.href,
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(2)
      }));

      const authUrls: Record<string, string> = {
        youtube: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.get('VITE_YOUTUBE_CLIENT_ID')}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/oauth-callback')}&response_type=code&scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload')}&state=${state}`,
        instagram: `https://api.instagram.com/oauth/authorize?client_id=${config.get('VITE_INSTAGRAM_CLIENT_ID')}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/oauth-callback')}&scope=instagram_basic,instagram_content_publish&response_type=code&state=${state}`,
        tiktok: `https://www.tiktok.com/auth/authorize?client_key=${config.get('VITE_TIKTOK_CLIENT_KEY')}&response_type=code&scope=user.info.basic,video.upload&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/oauth-callback')}&state=${state}`,
        linkedin: `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${config.get('VITE_LINKEDIN_CLIENT_ID')}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/oauth-callback')}&scope=w_member_social%20r_liteprofile&state=${state}`,
        pinterest: `https://www.pinterest.com/oauth/?client_id=${config.get('VITE_PINTEREST_CLIENT_ID')}&redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/oauth-callback')}&response_type=code&scope=pins:read,pins:write,boards:read&state=${state}`
      };

      const authUrl = authUrls[connectorId];
      if (authUrl) {
        window.location.href = authUrl;
      }
    } catch (error) {
      logger.error('Failed to initiate OAuth', error as Error);
    }
  };

  const handleDisconnect = async (connectorId: string) => {
    logger.info('Disconnecting connector', { connectorId });

    setConnectors(prev =>
      prev.map(c =>
        c.id === connectorId
          ? { ...c, status: 'disconnected', accountName: undefined, lastSync: undefined }
          : c
      )
    );
  };

  const handleRefresh = async (connectorId: string) => {
    logger.info('Refreshing connector', { connectorId });
  };

  return (
    <DashboardLayout currentPage="settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Platform Connections</h1>
          <p className="text-neutral-600 mt-1">
            Connect your social media accounts to publish and manage content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectors.map(connector => (
            <ConnectorCard
              key={connector.id}
              {...connector}
              onConnect={() => handleConnect(connector.id)}
              onDisconnect={() => handleDisconnect(connector.id)}
              onRefresh={connector.status === 'connected' ? () => handleRefresh(connector.id) : undefined}
            />
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Getting Started</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Click "Connect" on any platform to authorize access</li>
            <li>You'll be redirected to authenticate with the platform</li>
            <li>Once connected, you can publish content directly from SparkLabs</li>
            <li>Monitor connection health and refresh tokens as needed</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  );
};
