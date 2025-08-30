import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '../utils/cn';
import { AlertCircle, CheckCircle, Hash, AtSign } from 'lucide-react';

export type TextAreaVariant = 
  | 'default'
  | 'success' 
  | 'warning'
  | 'error';

export type TextAreaSize = 
  | 'sm'    // 80px height
  | 'base'  // 120px height
  | 'lg'    // 160px height
  | 'xl';   // 200px height

export interface TextAreaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  variant?: TextAreaVariant;
  size?: TextAreaSize;
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  loading?: boolean;
  // Creator-specific props
  characterLimit?: number;
  showCharacterCount?: boolean;
  hashtagSuggestions?: string[];
  mentionSuggestions?: string[];
  platformRequirements?: {
    platform: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  }[];
  autoResize?: boolean;
  // AI assistance
  aiSuggestions?: boolean;
  onAIGenerate?: (prompt: string) => void;
}

const variantStyles: Record<TextAreaVariant, string> = {
  default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
  success: 'border-success-300 focus:border-success-500 focus:ring-success-500',
  warning: 'border-warning-300 focus:border-warning-500 focus:ring-warning-500',
  error: 'border-error-300 focus:border-error-500 focus:ring-error-500',
};

const sizeStyles: Record<TextAreaSize, string> = {
  sm: 'min-h-[80px]',
  base: 'min-h-[120px]',
  lg: 'min-h-[160px]',
  xl: 'min-h-[200px]',
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  variant = 'default',
  size = 'base',
  label,
  description,
  error,
  success,
  loading = false,
  characterLimit,
  showCharacterCount = false,
  hashtagSuggestions = [],
  mentionSuggestions = [],
  platformRequirements = [],
  autoResize = false,
  aiSuggestions = false,
  onAIGenerate,
  className,
  value,
  onChange,
  onKeyDown,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [currentLength, setCurrentLength] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionType, setSuggestionType] = useState<'hashtag' | 'mention' | null>(null);
  const [suggestionQuery, setSuggestionQuery] = useState('');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof value === 'string') {
      setCurrentLength(value.length);
    }
  }, [value]);

  // Auto-resize functionality
  useEffect(() => {
    if (autoResize && textAreaRef.current) {
      textAreaRef.current.style.height = 'auto';
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Enforce character limit
    if (characterLimit && newValue.length > characterLimit) {
      return;
    }
    
    setCurrentLength(newValue.length);
    setCursorPosition(e.target.selectionStart);
    
    // Check for hashtag or mention triggers
    const textBeforeCursor = newValue.substring(0, e.target.selectionStart);
    const lastWord = textBeforeCursor.split(/\s/).pop() || '';
    
    if (lastWord.startsWith('#') && hashtagSuggestions.length > 0) {
      setSuggestionType('hashtag');
      setSuggestionQuery(lastWord.substring(1));
      setShowSuggestions(true);
    } else if (lastWord.startsWith('@') && mentionSuggestions.length > 0) {
      setSuggestionType('mention');
      setSuggestionQuery(lastWord.substring(1));
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
    
    onChange?.(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle suggestion selection
    if (showSuggestions && (e.key === 'Tab' || e.key === 'Enter')) {
      e.preventDefault();
      // This would be handled by suggestion click in a real implementation
    }
    
    onKeyDown?.(e);
  };

  const insertSuggestion = (suggestion: string) => {
    if (!textAreaRef.current || typeof value !== 'string') return;
    
    const textBeforeCursor = value.substring(0, cursorPosition);
    const textAfterCursor = value.substring(cursorPosition);
    const words = textBeforeCursor.split(/\s/);
    words[words.length - 1] = suggestionType === 'hashtag' ? `#${suggestion}` : `@${suggestion}`;
    
    const newValue = words.join(' ') + ' ' + textAfterCursor;
    
    // Create synthetic event
    const syntheticEvent = {
      target: { value: newValue, selectionStart: words.join(' ').length + 1 }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    onChange?.(syntheticEvent);
    setShowSuggestions(false);
  };

  // Determine current variant based on validation
  const currentVariant = error ? 'error' : success ? 'success' : variant;
  
  // Check platform requirements
  const platformValidation = platformRequirements.map(req => ({
    ...req,
    valid: req.minLength ? currentLength >= req.minLength : true,
    maxValid: req.maxLength ? currentLength <= req.maxLength : true,
  }));

  const baseTextAreaStyles = 'w-full rounded-lg border bg-white px-4 py-3 transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed resize-none';

  const currentSuggestions = suggestionType === 'hashtag' 
    ? hashtagSuggestions.filter(tag => tag.toLowerCase().includes(suggestionQuery.toLowerCase()))
    : mentionSuggestions.filter(mention => mention.toLowerCase().includes(suggestionQuery.toLowerCase()));

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

      {/* TextArea Container */}
      <div className="relative">
        <textarea
          ref={(node) => {
            textAreaRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          className={cn(
            baseTextAreaStyles,
            variantStyles[currentVariant],
            sizeStyles[size],
            className
          )}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Validation Icon */}
        {(error || success) && (
          <div className="absolute top-3 right-3">
            {error && <AlertCircle className="w-4 h-4 text-error-500" />}
            {success && <CheckCircle className="w-4 h-4 text-success-500" />}
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && currentSuggestions.length > 0 && (
        <div className="relative">
          <div className="absolute top-0 left-0 right-0 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
            {currentSuggestions.slice(0, 5).map((suggestion, index) => (
              <button
                key={index}
                className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center space-x-2"
                onClick={() => insertSuggestion(suggestion)}
              >
                {suggestionType === 'hashtag' ? (
                  <Hash className="w-4 h-4 text-primary-500" />
                ) : (
                  <AtSign className="w-4 h-4 text-primary-500" />
                )}
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Character Count and AI Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {aiSuggestions && onAIGenerate && (
            <button
              type="button"
              onClick={() => onAIGenerate(typeof value === 'string' ? value : '')}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              ✨ AI Enhance
            </button>
          )}
        </div>
        
        {(showCharacterCount || characterLimit) && (
          <div className={cn(
            'text-xs font-medium',
            characterLimit && currentLength > characterLimit * 0.9 
              ? 'text-warning-600' 
              : 'text-neutral-500'
          )}>
            {currentLength}{characterLimit && `/${characterLimit}`}
          </div>
        )}
      </div>

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

TextArea.displayName = 'TextArea';