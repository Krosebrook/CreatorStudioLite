import React from 'react';
import { Check, AlertCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { cn } from '../../design-system/utils/cn';

interface ConnectorCardProps {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected' | 'error' | 'expired';
  accountName?: string;
  lastSync?: Date;
  onConnect: () => void;
  onDisconnect: () => void;
  onRefresh?: () => void;
}

export const ConnectorCard: React.FC<ConnectorCardProps> = ({
  id: _id,
  name,
  icon,
  status,
  accountName,
  lastSync,
  onConnect,
  onDisconnect,
  onRefresh
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Check className="w-4 h-4 text-success-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-error-500" />;
      case 'expired':
        return <Clock className="w-4 h-4 text-warning-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'expired':
        return 'Expired';
      default:
        return 'Not Connected';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-success-100 text-success-700';
      case 'error':
        return 'bg-error-100 text-error-700';
      case 'expired':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
            {icon}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">{name}</h3>

            <div className="flex items-center space-x-2 mt-1">
              {getStatusIcon()}
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', getStatusColor())}>
                {getStatusText()}
              </span>
            </div>

            {accountName && (
              <p className="text-sm text-neutral-600 mt-1">{accountName}</p>
            )}

            {lastSync && status === 'connected' && (
              <p className="text-xs text-neutral-500 mt-1">
                Last synced: {lastSync.toRelativeTime()}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-2">
        {status === 'connected' ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={onDisconnect}
              className="flex-1"
            >
              Disconnect
            </Button>
            {onRefresh && (
              <Button
                size="sm"
                variant="secondary"
                onClick={onRefresh}
              >
                Refresh
              </Button>
            )}
          </>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={onConnect}
            className="flex-1"
            leftIcon={<ExternalLink className="w-4 h-4" />}
          >
            Connect
          </Button>
        )}
      </div>
    </Card>
  );
};
