import React from 'react';
import { cn } from '../utils/cn';

export type CardVariant = 
  | 'default'     // Standard content cards
  | 'elevated'    // Important content (analytics, revenue)
  | 'interactive' // Clickable cards (content items)
  | 'minimal'     // Subtle containers
  | 'success'     // Positive metrics
  | 'warning'     // Attention needed
  | 'error';      // Issues/problems

export type CardPadding = 
  | 'none'   // No padding
  | 'sm'     // 12px - Compact
  | 'base'   // 16px - Standard
  | 'lg'     // 24px - Comfortable
  | 'xl';    // 32px - Spacious

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  hover?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white border border-neutral-200 shadow-sm',
  elevated: 'bg-white border border-neutral-200 shadow-lg',
  interactive: 'bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-300 cursor-pointer transition-all duration-fast',
  minimal: 'bg-neutral-50 border border-neutral-100',
  success: 'bg-success-50 border border-success-200',
  warning: 'bg-warning-50 border border-warning-200',
  error: 'bg-error-50 border border-error-200',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  base: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'base',
  hover = false,
  loading = false,
  className,
  children,
  ...props
}) => {
  const baseStyles = 'rounded-lg relative overflow-hidden';
  const hoverStyles = hover && !loading ? 'hover:shadow-md transition-shadow duration-fast' : '';
  const loadingStyles = loading ? 'animate-pulse' : '';

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        hoverStyles,
        loadingStyles,
        className
      )}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {children}
    </div>
  );
};

// Specialized card components for creator workflows
export const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
}> = ({ title, value, change, trend, loading }) => (
  <Card variant="elevated" padding="lg" loading={loading}>
    <div className="space-y-2">
      <p className="text-sm font-medium text-neutral-600">{title}</p>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      {change && (
        <div className={cn(
          'flex items-center text-sm font-medium',
          trend === 'up' && 'text-success-600',
          trend === 'down' && 'text-error-600',
          trend === 'neutral' && 'text-neutral-600'
        )}>
          {trend === 'up' && '↗'}
          {trend === 'down' && '↘'}
          {trend === 'neutral' && '→'}
          <span className="ml-1">{change}</span>
        </div>
      )}
    </div>
  </Card>
);

export const ContentCard: React.FC<{
  title: string;
  platform: string;
  status: 'published' | 'draft' | 'scheduled';
  metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  thumbnail?: string;
  onClick?: () => void;
}> = ({ title, platform, status, metrics, thumbnail, onClick }) => (
  <Card variant="interactive" padding="base" onClick={onClick}>
    <div className="flex space-x-4">
      {thumbnail && (
        <div className="w-16 h-16 bg-neutral-200 rounded-lg flex-shrink-0 overflow-hidden">
          <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-neutral-900 truncate">{title}</h3>
        <p className="text-sm text-neutral-600 capitalize">{platform}</p>
        <div className="flex items-center space-x-4 mt-2">
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            status === 'published' && 'bg-success-100 text-success-800',
            status === 'draft' && 'bg-neutral-100 text-neutral-800',
            status === 'scheduled' && 'bg-warning-100 text-warning-800'
          )}>
            {status}
          </span>
          {metrics && (
            <div className="flex space-x-3 text-xs text-neutral-500">
              {metrics.views && <span>{metrics.views} views</span>}
              {metrics.likes && <span>{metrics.likes} likes</span>}
              {metrics.comments && <span>{metrics.comments} comments</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  </Card>
);