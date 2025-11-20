import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../design-system/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
  text
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2 className={cn(sizeClasses[size], 'animate-spin text-primary-600')} />
      {text && <p className="mt-2 text-sm text-neutral-600">{text}</p>}
    </div>
  );
};
