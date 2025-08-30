import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '../utils/cn';
import { Eye, EyeOff, AlertCircle, CheckCircle, Search, X } from 'lucide-react';

export type InputVariant = 
  | 'default'
  | 'success' 
  | 'warning'
  | 'error';

export type InputSize = 
  | 'sm'    // 32px height
  | 'base'  // 44px height - mobile optimized
  | 'lg';   // 48px height

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  // Creator-specific props
  characterLimit?: number;
  showCharacterCount?: boolean;
  platformRequirements?: {
    platform: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  }[];
}

const variantStyles: Record<InputVariant, string> = {
  default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
  success: 'border-success-300 focus:border-success-500 focus:ring-success-500',
  warning: 'border-warning-300 focus:border-warning-500 focus:ring-warning-500',
  error: 'border-error-300 focus:border-error-500 focus:ring-error-500',
};

const sizeStyles: Record<InputSize, string> = {
  sm: 'h-8 px-3 text-sm',
  base: 'h-11 px-4 text-base min-w-touch', // 44px mobile optimized
  lg: 'h-12 px-4 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'base',
  label,
  description,
  error,
  success,
  leftIcon,
  rightIcon,
  loading = false,
  clearable = false,
  onClear,
  characterLimit,
  showCharacterCount = false,
  platformRequirements = [],
  className,
  value,
  onChange,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [currentLength, setCurrentLength] = useState(0);

  useEffect(() => {
    if (typeof value === 'string') {
      setCurrentLength(value.length);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Enforce character limit
    if (characterLimit && newValue.length > characterLimit) {
      return;
    }
    
    setCurrentLength(newValue.length);
    onChange?.(e);
  };

  const handleClear = () => {
    setCurrentLength(0);
    onClear?.();
  };

  // Determine current variant based on validation
  const currentVariant = error ? 'error' : success ? 'success' : variant;
  
  // Check platform requirements
  const platformValidation = platformRequirements.map(req => ({
    ...req,
    valid: req.minLength ? currentLength >= req.minLength : true,
    maxValid: req.maxLength ? currentLength <= req.maxLength : true,
  }));

  const baseInputStyles = 'w-full rounded-lg border bg-white transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const paddingStyles = leftIcon ? 'pl-10' : rightIcon || clearable || loading ? 'pr-10' : '';

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {platformRequirements.some(req => req.required) && (
            <span className="text-error-500 ml-1">*</span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
            {leftIcon}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          className={cn(
            baseInputStyles,
            variantStyles[currentVariant],
            sizeStyles[size],
            paddingStyles,
            className
          )}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Right Side Icons */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {loading && (
            <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          )}
          
          {clearable && value && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {rightIcon && !loading && !clearable && (
            <div className="text-neutral-400">
              {rightIcon}
            </div>
          )}

          {/* Validation Icon */}
          {error && (
            <AlertCircle className="w-4 h-4 text-error-500" />
          )}
          {success && (
            <CheckCircle className="w-4 h-4 text-success-500" />
          )}
        </div>
      </div>

      {/* Character Count */}
      {(showCharacterCount || characterLimit) && (
        <div className="flex justify-between items-center text-xs">
          <div />
          <div className={cn(
            'font-medium',
            characterLimit && currentLength > characterLimit * 0.9 
              ? 'text-warning-600' 
              : 'text-neutral-500'
          )}>
            {currentLength}{characterLimit && `/${characterLimit}`}
          </div>
        </div>
      )}

      {/* Platform Requirements */}
      {platformRequirements.length > 0 && isFocused && (
        <div className="space-y-1">
          {platformValidation.map((req, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs">
              <div className={cn(
                'w-2 h-2 rounded-full',
                req.valid && req.maxValid ? 'bg-success-500' : 'bg-neutral-300'
              )} />
              <span className={cn(
                req.valid && req.maxValid ? 'text-success-600' : 'text-neutral-500'
              )}>
                {req.platform}: {req.minLength && `min ${req.minLength}`}
                {req.minLength && req.maxLength && ', '}
                {req.maxLength && `max ${req.maxLength}`} characters
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-neutral-600">{description}</p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-error-600 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}

      {/* Success Message */}
      {success && (
        <p className="text-sm text-success-600 flex items-center space-x-1">
          <CheckCircle className="w-4 h-4" />
          <span>{success}</span>
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

// Password Input Component
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  strengthIndicator?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  strengthIndicator = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  const calculateStrength = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (strengthIndicator) {
      setStrength(calculateStrength(e.target.value));
    }
    props.onChange?.(e);
  };

  const strengthColors = ['bg-error-500', 'bg-error-400', 'bg-warning-500', 'bg-success-400', 'bg-success-500'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="space-y-2">
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        onChange={handleChange}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
      />
      
      {strengthIndicator && props.value && (
        <div className="space-y-1">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  i < strength ? strengthColors[strength - 1] : 'bg-neutral-200'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-600">
            Password strength: {strengthLabels[strength - 1] || 'Too short'}
          </p>
        </div>
      )}
    </div>
  );
};

// Search Input Component
export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (query: string) => void;
  suggestions?: string[];
  showSuggestions?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  suggestions = [],
  showSuggestions = false,
  ...props
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowDropdown(value.length > 0 && suggestions.length > 0);
    props.onChange?.(e);
  };

  const handleSearch = () => {
    onSearch?.(query);
    setShowDropdown(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch?.(suggestion);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <Input
        {...props}
        value={query}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
        leftIcon={<Search className="w-4 h-4" />}
        clearable
        onClear={() => {
          setQuery('');
          setShowDropdown(false);
        }}
      />
      
      {showDropdown && showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions
            .filter(suggestion => suggestion.toLowerCase().includes(query.toLowerCase()))
            .map((suggestion, index) => (
              <button
                key={index}
                className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
};