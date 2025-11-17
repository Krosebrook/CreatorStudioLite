import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../utils/cn';

// Form Context Types
interface FormContextValue {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  setTouched: (name: string, touched: boolean) => void;
  validateField: (name: string) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
}

const FormContext = createContext<FormContextValue | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a Form component');
  }
  return context;
};

// Validation Rules
export type ValidationRule = 
  | { type: 'required'; message?: string }
  | { type: 'minLength'; value: number; message?: string }
  | { type: 'maxLength'; value: number; message?: string }
  | { type: 'email'; message?: string }
  | { type: 'url'; message?: string }
  | { type: 'pattern'; value: RegExp; message?: string }
  | { type: 'custom'; validator: (value: any) => boolean | string; message?: string }
  | { type: 'platformRequirements'; platforms: Array<{ platform: string; minLength?: number; maxLength?: number }> };

export interface FormFieldConfig {
  name: string;
  label?: string;
  defaultValue?: any;
  validation?: ValidationRule[];
  dependencies?: string[]; // Fields that affect this field's validation
}

export interface FormProps {
  children: React.ReactNode;
  onSubmit: (values: Record<string, any>) => Promise<void> | void;
  initialValues?: Record<string, any>;
  fields?: FormFieldConfig[];
  autoSave?: boolean;
  autoSaveDelay?: number;
  className?: string;
}

// Validation Functions
const validateField = (value: any, rules: ValidationRule[]): string => {
  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          return rule.message || 'This field is required';
        }
        break;
      
      case 'minLength':
        if (typeof value === 'string' && value.length < rule.value) {
          return rule.message || `Minimum ${rule.value} characters required`;
        }
        break;
      
      case 'maxLength':
        if (typeof value === 'string' && value.length > rule.value) {
          return rule.message || `Maximum ${rule.value} characters allowed`;
        }
        break;
      
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (value && !emailRegex.test(value)) {
          return rule.message || 'Please enter a valid email address';
        }
        break;
      }
      
      case 'url':
        try {
          if (value) new URL(value);
        } catch {
          return rule.message || 'Please enter a valid URL';
        }
        break;
      
      case 'pattern':
        if (value && !rule.value.test(value)) {
          return rule.message || 'Invalid format';
        }
        break;
      
      case 'custom':
        if (value) {
          const result = rule.validator(value);
          if (result === false) {
            return rule.message || 'Invalid value';
          }
          if (typeof result === 'string') {
            return result;
          }
        }
        break;
      
      case 'platformRequirements':
        if (typeof value === 'string') {
          for (const platform of rule.platforms) {
            if (platform.minLength && value.length < platform.minLength) {
              return `${platform.platform} requires at least ${platform.minLength} characters`;
            }
            if (platform.maxLength && value.length > platform.maxLength) {
              return `${platform.platform} allows maximum ${platform.maxLength} characters`;
            }
          }
        }
        break;
    }
  }
  return '';
};

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  initialValues = {},
  fields = [],
  autoSave = false,
  autoSaveDelay = 2000,
  className,
}) => {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const defaultValues: Record<string, any> = {};
    fields.forEach(field => {
      defaultValues[field.name] = initialValues[field.name] ?? field.defaultValue ?? '';
    });
    return { ...defaultValues, ...initialValues };
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  // Auto-save functionality
  const triggerAutoSave = useCallback(() => {
    if (!autoSave) return;
    
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      // Implement auto-save logic here
      console.log('Auto-saving form data:', values);
    }, autoSaveDelay);
    
    setAutoSaveTimeout(timeout);
  }, [values, autoSave, autoSaveDelay, autoSaveTimeout]);

  const setValue = useCallback((name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    triggerAutoSave();
  }, [errors, triggerAutoSave]);

  const setError = useCallback((name: string, error: string) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const setTouchedField = useCallback((name: string, isTouched: boolean) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }));
  }, []);

  const validateSingleField = useCallback(async (name: string): Promise<boolean> => {
    const field = fields.find(f => f.name === name);
    if (!field || !field.validation) return true;
    
    const error = validateField(values[name], field.validation);
    setError(name, error);
    return !error;
  }, [fields, values, setError]);

  const validateAllFields = useCallback(async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    for (const field of fields) {
      if (field.validation) {
        const error = validateField(values[field.name], field.validation);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      }
    }
    
    setErrors(newErrors);
    return isValid;
  }, [fields, values]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const isValid = await validateAllFields();
      
      if (isValid) {
        await onSubmit(values);
      } else {
        // Mark all fields as touched to show errors
        const allTouched: Record<string, boolean> = {};
        fields.forEach(field => {
          allTouched[field.name] = true;
        });
        setTouched(allTouched);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextValue: FormContextValue = {
    values,
    errors,
    touched,
    isSubmitting,
    setValue,
    setError,
    setTouched: setTouchedField,
    validateField: validateSingleField,
    validateForm: validateAllFields,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={cn('space-y-6', className)} noValidate>
        {children}
      </form>
    </FormContext.Provider>
  );
};

// Form Field Wrapper Component
export interface FormFieldProps {
  name: string;
  children: (props: {
    value: any;
    onChange: (value: any) => void;
    onBlur: () => void;
    error?: string;
    touched: boolean;
  }) => React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({ name, children }) => {
  const { values, errors, touched, setValue, setTouched, validateField } = useFormContext();

  const handleChange = (value: any) => {
    setValue(name, value);
  };

  const handleBlur = () => {
    setTouched(name, true);
    validateField(name);
  };

  return (
    <>
      {children({
        value: values[name] ?? '',
        onChange: handleChange,
        onBlur: handleBlur,
        error: touched[name] ? errors[name] : undefined,
        touched: touched[name] ?? false,
      })}
    </>
  );
};

// Pre-built Creator Form Components
export const ContentCreationForm: React.FC<{
  onSubmit: (data: any) => Promise<void>;
  platforms?: string[];
}> = ({ onSubmit, platforms = ['instagram', 'tiktok', 'youtube'] }) => {
  const fields: FormFieldConfig[] = [
    {
      name: 'title',
      label: 'Content Title',
      validation: [
        { type: 'required' },
        { type: 'minLength', value: 3 },
        { type: 'maxLength', value: 100 }
      ]
    },
    {
      name: 'description',
      label: 'Description',
      validation: [
        { type: 'required' },
        { type: 'platformRequirements', platforms: [
          { platform: 'Instagram', maxLength: 2200 },
          { platform: 'TikTok', maxLength: 300 },
          { platform: 'YouTube', maxLength: 5000 }
        ]}
      ]
    },
    {
      name: 'platforms',
      label: 'Publish to Platforms',
      defaultValue: [],
      validation: [{ type: 'required', message: 'Select at least one platform' }]
    },
    {
      name: 'hashtags',
      label: 'Hashtags',
      defaultValue: '',
      validation: [
        { type: 'custom', validator: (value: string) => {
          const hashtags = value.split(' ').filter(tag => tag.startsWith('#'));
          return hashtags.length <= 30 || 'Maximum 30 hashtags allowed';
        }}
      ]
    }
  ];

  return (
    <Form fields={fields} onSubmit={onSubmit} autoSave>
      <FormField name="title">
        {({ value, onChange, onBlur, error }) => (
          <Input
            label="Content Title"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            error={error}
            placeholder="Enter your content title..."
          />
        )}
      </FormField>

      <FormField name="description">
        {({ value, onChange, onBlur, error }) => (
          <TextArea
            label="Description"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            error={error}
            placeholder="Write your content description..."
            characterLimit={2200}
            showCharacterCount
            platformRequirements={[
              { platform: 'Instagram', maxLength: 2200 },
              { platform: 'TikTok', maxLength: 300 },
              { platform: 'YouTube', maxLength: 5000 }
            ]}
            hashtagSuggestions={['trending', 'viral', 'creator', 'content']}
            autoResize
          />
        )}
      </FormField>

      <FormField name="platforms">
        {({ value, onChange, error }) => (
          <Select
            label="Publish to Platforms"
            multiple
            value={value}
            onChange={onChange}
            error={error}
            options={platforms.map(platform => ({
              value: platform,
              label: platform.charAt(0).toUpperCase() + platform.slice(1),
              icon: <div className="w-4 h-4 rounded bg-primary-500" />, // Platform icons would go here
            }))}
            placeholder="Select platforms..."
          />
        )}
      </FormField>

      <FormField name="hashtags">
        {({ value, onChange, onBlur, error }) => (
          <Input
            label="Hashtags"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            error={error}
            placeholder="#hashtag1 #hashtag2 #hashtag3"
            description="Separate hashtags with spaces. Maximum 30 hashtags."
          />
        )}
      </FormField>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary">
          Save Draft
        </Button>
        <Button type="submit" variant="primary">
          Publish Content
        </Button>
      </div>
    </Form>
  );
};

// Import the Input, TextArea, Select, and Button components
import { Input } from './Input';
import { TextArea } from './TextArea';
import { Select } from './Select';
import { Button } from './Button';