import React from 'react';
import { cn } from '../utils/cn';

// Button variant types based on creator workflows
export type ButtonVariant = 
  | 'primary'      // Main actions (Publish, Save)
  | 'secondary'    // Secondary actions (Draft, Cancel)
  | 'success'      // Positive actions (Approve, Accept)
  | 'warning'      // Caution actions (Delete Draft)
  | 'error'        // Destructive actions (Delete, Remove)
  | 'ghost'        // Subtle actions (Edit, View)
  | 'outline'      // Alternative actions
  | 'link'         // Text-based actions
  | 'platform-instagram' // Platform-specific
  | 'platform-tiktok'
  | 'platform-youtube'
  | 'platform-twitter';

export type ButtonSize = 
  | 'sm'    // 32px height - Compact UI
  | 'base'  // 44px height - Standard touch target
  | 'lg'    // 48px height - Comfortable touch
  | 'xl';   // 56px height - Large touch target

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

// Variant styles optimized for creator workflows
const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all duration-fast',
  secondary: 'bg-neutral-100 hover:bg-neutral-200 active:bg-neutral-300 text-neutral-900 border border-neutral-300 transition-all duration-fast',
  success: 'bg-success-500 hover:bg-success-600 active:bg-success-700 text-white shadow-md hover:shadow-lg transition-all duration-fast',
  warning: 'bg-warning-500 hover:bg-warning-600 active:bg-warning-700 text-white shadow-md hover:shadow-lg transition-all duration-fast',
  error: 'bg-error-500 hover:bg-error-600 active:bg-error-700 text-white shadow-md hover:shadow-lg transition-all duration-fast',
  ghost: 'hover:bg-neutral-100 active:bg-neutral-200 text-neutral-700 transition-all duration-fast',
  outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100 transition-all duration-fast',
  link: 'text-primary-500 hover:text-primary-600 active:text-primary-700 underline-offset-4 hover:underline transition-all duration-fast',
  'platform-instagram': 'bg-[#E4405F] hover:bg-[#d73653] text-white shadow-md hover:shadow-lg transition-all duration-fast',
  'platform-tiktok': 'bg-black hover:bg-neutral-800 text-white shadow-md hover:shadow-lg transition-all duration-fast',
  'platform-youtube': 'bg-[#FF0000] hover:bg-[#e60000] text-white shadow-md hover:shadow-lg transition-all duration-fast',
  'platform-twitter': 'bg-[#1DA1F2] hover:bg-[#1a91da] text-white shadow-md hover:shadow-lg transition-all duration-fast',
};

// Size styles with proper touch targets
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm font-medium rounded-md',
  base: 'h-11 px-4 text-base font-medium rounded-lg min-w-touch', // 44px minimum
  lg: 'h-12 px-6 text-lg font-medium rounded-lg min-w-comfortable', // 48px comfortable
  xl: 'h-14 px-8 text-xl font-semibold rounded-xl min-w-large', // 56px large
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'base',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const widthStyles = fullWidth ? 'w-full' : '';
  
  const loadingStyles = loading ? 'cursor-wait' : '';

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        loadingStyles,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && leftIcon && (
        <span className="mr-2 flex-shrink-0">
          {leftIcon}
        </span>
      )}
      
      <span className="truncate">
        {children}
      </span>
      
      {!loading && rightIcon && (
        <span className="ml-2 flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

// Preset button components for common creator actions
export const PublishButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="primary" {...props} />
);

export const SaveDraftButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="secondary" {...props} />
);

export const DeleteButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="error" {...props} />
);

export const InstagramButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="platform-instagram" {...props} />
);

export const TikTokButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="platform-tiktok" {...props} />
);

export const YouTubeButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button variant="platform-youtube" {...props} />
);