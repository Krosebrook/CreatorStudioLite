import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';
import { ChevronDown, Check, AlertCircle, CheckCircle, X } from 'lucide-react';

export type SelectVariant = 
  | 'default'
  | 'success' 
  | 'warning'
  | 'error';

export type SelectSize = 
  | 'sm'    // 32px height
  | 'base'  // 44px height - mobile optimized
  | 'lg';   // 48px height

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  description?: string;
  // Platform-specific styling
  color?: string;
  badge?: string;
}

export interface SelectProps {
  variant?: SelectVariant;
  size?: SelectSize;
  label?: string;
  description?: string;
  error?: string;
  success?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  disabled?: boolean;
  required?: boolean;
  // Creator-specific props
  platformIcons?: boolean;
  groupBy?: string;
  maxSelections?: number;
  className?: string;
}

const variantStyles: Record<SelectVariant, string> = {
  default: 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
  success: 'border-success-300 focus:border-success-500 focus:ring-success-500',
  warning: 'border-warning-300 focus:border-warning-500 focus:ring-warning-500',
  error: 'border-error-300 focus:border-error-500 focus:ring-error-500',
};

const sizeStyles: Record<SelectSize, string> = {
  sm: 'h-8 px-3 text-sm',
  base: 'h-11 px-4 text-base min-w-touch', // 44px mobile optimized
  lg: 'h-12 px-4 text-lg',
};

export const Select: React.FC<SelectProps> = ({
  variant = 'default',
  size = 'base',
  label,
  description,
  error,
  success,
  placeholder = 'Select an option...',
  options,
  value,
  onChange,
  multiple = false,
  searchable = false,
  clearable = false,
  loading = false,
  disabled = false,
  required = false,
  platformIcons = false,
  maxSelections,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const currentVariant = error ? 'error' : success ? 'success' : variant;
  
  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const selectedOptions = options.filter(option => selectedValues.includes(option.value));

  // Filter options based on search query
  const filteredOptions = searchQuery
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        option.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const newValue = selectedValues.includes(optionValue)
        ? selectedValues.filter(v => v !== optionValue)
        : maxSelections && selectedValues.length >= maxSelections
          ? selectedValues
          : [...selectedValues, optionValue];
      onChange?.(newValue);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiple ? [] : '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
          handleOptionClick(filteredOptions[focusedIndex].value);
        }
        break;
    }
  };

  const baseSelectStyles = 'w-full rounded-lg border bg-white transition-all duration-fast focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-neutral-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}

      {/* Select Container */}
      <div ref={selectRef} className="relative">
        <div
          className={cn(
            baseSelectStyles,
            variantStyles[currentVariant],
            sizeStyles[size],
            className
          )}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex items-center justify-between">
            {/* Selected Value Display */}
            <div className="flex-1 flex items-center space-x-2 min-w-0">
              {selectedOptions.length === 0 ? (
                <span className="text-neutral-500 truncate">{placeholder}</span>
              ) : multiple ? (
                <div className="flex flex-wrap gap-1">
                  {selectedOptions.slice(0, 3).map((option) => (
                    <span
                      key={option.value}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                      style={option.color ? { backgroundColor: `${option.color}20`, color: option.color } : {}}
                    >
                      {option.icon && <span className="mr-1">{option.icon}</span>}
                      {option.label}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOptionClick(option.value);
                        }}
                        className="ml-1 hover:text-primary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedOptions.length > 3 && (
                    <span className="text-xs text-neutral-500">
                      +{selectedOptions.length - 3} more
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2 truncate">
                  {selectedOptions[0].icon && (
                    <span>{selectedOptions[0].icon}</span>
                  )}
                  <span className="truncate">{selectedOptions[0].label}</span>
                  {selectedOptions[0].badge && (
                    <span className="text-xs px-1 py-0.5 bg-neutral-100 text-neutral-600 rounded">
                      {selectedOptions[0].badge}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-1 ml-2">
              {loading && (
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              )}
              
              {clearable && selectedValues.length > 0 && !loading && (
                <button
                  onClick={handleClear}
                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <ChevronDown className={cn(
                'w-4 h-4 text-neutral-400 transition-transform',
                isOpen && 'transform rotate-180'
              )} />

              {/* Validation Icon */}
              {error && <AlertCircle className="w-4 h-4 text-error-500" />}
              {success && <CheckCircle className="w-4 h-4 text-success-500" />}
            </div>
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 max-h-60 overflow-hidden">
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-neutral-100">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto" role="listbox">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-neutral-500 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isFocused = index === focusedIndex;
                  
                  return (
                    <div
                      key={option.value}
                      className={cn(
                        'px-4 py-3 cursor-pointer transition-colors flex items-center justify-between',
                        isFocused && 'bg-neutral-50',
                        !isFocused && 'hover:bg-neutral-50',
                        option.disabled && 'opacity-50 cursor-not-allowed',
                        isSelected && 'bg-primary-50'
                      )}
                      onClick={() => !option.disabled && handleOptionClick(option.value)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {option.icon && (
                          <span className="flex-shrink-0">{option.icon}</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className={cn(
                              'font-medium truncate',
                              isSelected ? 'text-primary-900' : 'text-neutral-900'
                            )}>
                              {option.label}
                            </span>
                            {option.badge && (
                              <span className="text-xs px-1 py-0.5 bg-neutral-100 text-neutral-600 rounded flex-shrink-0">
                                {option.badge}
                              </span>
                            )}
                          </div>
                          {option.description && (
                            <p className="text-xs text-neutral-500 truncate">
                              {option.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Max Selections Warning */}
      {multiple && maxSelections && selectedValues.length >= maxSelections && (
        <p className="text-sm text-warning-600">
          Maximum {maxSelections} selections allowed
        </p>
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
};