import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { cn } from '../../design-system/utils/cn';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
}

const variantStyles = {
  error: 'bg-error-50 border-error-200 text-error-800',
  warning: 'bg-warning-50 border-warning-200 text-warning-800',
  info: 'bg-primary-50 border-primary-200 text-primary-800'
};

const iconColors = {
  error: 'text-error-600',
  warning: 'text-warning-600',
  info: 'text-primary-600'
};

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  onClose,
  className,
  variant = 'error'
}) => {
  return (
    <div className={cn(
      'p-4 rounded-lg border flex items-start space-x-3',
      variantStyles[variant],
      className
    )}>
      <AlertCircle className={cn('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[variant])} />
      <div className="flex-1">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-sm">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
