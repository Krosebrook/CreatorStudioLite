import React, { useState } from 'react';
import { Button } from '../../design-system/components/Button';
import { Input } from '../../design-system/components/Input';
import { Card } from '../../design-system/components/Card';
import { useAuth } from '../../contexts/AuthContext';
import {
  X,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Camera,
  Users,
  Briefcase,
  Rocket,
  Shield,
  Zap
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

type AuthMode = 'signin' | 'signup' | 'forgot-password' | 'user-type' | 'success';
type UserType = 'creator' | 'agency' | 'brand';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signup'
}) => {
  const { signUp, signIn, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [userType, setUserType] = useState<UserType>('creator');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    username: ''
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      username: ''
    });
    setError('');
    setSuccess('');
    setLoading(false);
  };

  const handleClose = () => {
    resetForm();
    setMode(initialMode);
    onClose();
  };

  const validateEmail = (email: string) => {
    const disposableDomains = ['example.com', 'test.com', 'tempmail.com', 'throwaway.email'];
    const domain = email.split('@')[1]?.toLowerCase();
    return !disposableDomains.includes(domain);
  };

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return {
      isValid: hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && password.length >= 10,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      hasMinLength: password.length >= 10
    };
  };

  const validateForm = () => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!validateEmail(formData.email)) {
      setError('Please use a valid email address (disposable domains not allowed)');
      return false;
    }

    if (mode === 'signup') {
      if (!formData.password) {
        setError('Password is required');
        return false;
      }

      const passwordCheck = validatePassword(formData.password);
      if (!passwordCheck.isValid) {
        const missing = [];
        if (!passwordCheck.hasMinLength) missing.push('at least 10 characters');
        if (!passwordCheck.hasUpperCase) missing.push('one uppercase letter');
        if (!passwordCheck.hasLowerCase) missing.push('one lowercase letter');
        if (!passwordCheck.hasNumber) missing.push('one number');
        if (!passwordCheck.hasSpecialChar) missing.push('one special character (!@#$%^&*...)');
        setError(`Password must contain: ${missing.join(', ')}`);
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[MODAL] handleSignUp called');

    if (!validateForm()) {
      console.log('[MODAL] Form validation failed');
      return;
    }

    console.log('[MODAL] Form validated, starting signup...');
    setLoading(true);
    setError('');

    try {
      const userData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        user_type: userType,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email}`
      };

      console.log('[MODAL] Calling signUp with userData:', userData);
      const { error } = await signUp(formData.email, formData.password, userData);
      console.log('[MODAL] signUp returned, error:', error);

      if (error) {
        console.error('[MODAL] SignUp error:', error);
        if (error.message.includes('weak_password') || error.message.includes('weak and easy') || error.message.includes('pwned')) {
          setError('This password appears in known data breaches. Please choose a different, more unique password for your security.');
        } else if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('email_address_invalid')) {
          setError('Please use a valid email address from a real email provider.');
        } else {
          setError(error.message);
        }
      } else {
        console.log('[MODAL] SignUp successful!');
        setSuccess('Account created successfully! You can now sign in with your credentials.');
        setTimeout(() => {
          setMode('signin');
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      console.error('[MODAL] SignUp exception:', err);
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[MODAL] handleSignIn called');

    if (!validateForm()) {
      console.log('[MODAL] Form validation failed');
      return;
    }

    console.log('[MODAL] Form validated, starting signin...');
    setLoading(true);
    setError('');

    try {
      console.log('[MODAL] Calling signIn...');
      const { error } = await signIn(formData.email, formData.password);
      console.log('[MODAL] signIn returned, error:', error);

      if (error) {
        console.error('[MODAL] SignIn error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again. If you just signed up, make sure you\'re using the correct password.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email address before signing in. Check your inbox for the confirmation link.');
        } else if (error.message.includes('email_not_confirmed') || error.message.includes('Email not confirmed')) {
          setError('Please verify your email address before signing in. Check your inbox for the confirmation link.');
        } else {
          setError(error.message);
        }
      } else {
        console.log('[MODAL] SignIn successful!');
        setSuccess('Signed in successfully!');
        handleClose();
      }
    } catch (err) {
      console.error('[MODAL] SignIn exception:', err);
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await resetPassword(formData.email);

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password reset email sent! Check your inbox.');
        setMode('success');
      }
    } catch (err) {
      setError((err as Error).message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setMode('signup');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {mode !== 'user-type' && mode !== 'success' && (
                <button
                  onClick={() => {
                    if (mode === 'signup' && userType) {
                      setMode('user-type');
                    } else if (mode === 'forgot-password') {
                      setMode('signin');
                    } else {
                      handleClose();
                    }
                  }}
                  className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-primary-500" />
                <h3 className="text-xl font-bold text-neutral-900">
                  {mode === 'signin' && 'Welcome Back'}
                  {mode === 'signup' && 'Join Amplify'}
                  {mode === 'forgot-password' && 'Reset Password'}
                  {mode === 'user-type' && 'Tell us about yourself'}
                  {mode === 'success' && 'Success!'}
                </h3>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Type Selection */}
          {mode === 'user-type' && (
            <div className="space-y-4">
              <p className="text-neutral-600 text-center">
                Choose your account type to get personalized features
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleUserTypeSelect('creator')}
                  className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                      <Camera className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">Individual Creator</div>
                      <div className="text-sm text-neutral-600">Perfect for solo creators and influencers</div>
                      <div className="text-xs text-primary-600 mt-1">Most popular choice</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleUserTypeSelect('agency')}
                  className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center group-hover:bg-success-200 transition-colors">
                      <Users className="w-6 h-6 text-success-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">Agency/Team</div>
                      <div className="text-sm text-neutral-600">Manage multiple creator accounts</div>
                      <div className="text-xs text-success-600 mt-1">Advanced features included</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleUserTypeSelect('brand')}
                  className="w-full p-4 border-2 border-neutral-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center group-hover:bg-warning-200 transition-colors">
                      <Briefcase className="w-6 h-6 text-warning-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">Brand/Business</div>
                      <div className="text-sm text-neutral-600">Find and collaborate with creators</div>
                      <div className="text-xs text-warning-600 mt-1">Partnership tools</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <p className="text-neutral-600 text-center">
                Sign in to your Amplify account
              </p>

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="creator@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-error-600 bg-error-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
                leftIcon={<Rocket className="w-4 h-4" />}
              >
                Sign In
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setMode('forgot-password')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Forgot your password?
                </button>
                
                <p className="text-sm text-neutral-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('user-type')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-neutral-600">
                  Create your {userType} account
                </p>
                <div className="flex items-center justify-center space-x-1 mt-2">
                  <Shield className="w-4 h-4 text-success-500" />
                  <span className="text-sm text-success-600">14-day free trial • No credit card required</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Sarah"
                  required
                  autoComplete="given-name"
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Chen"
                  required
                  autoComplete="family-name"
                />
              </div>

              <Input
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') }))}
                placeholder="sarahcreates"
                description="This will be your unique Amplify handle"
                required
                autoComplete="username"
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your.email@gmail.com"
                description="Use a real email address from Gmail, Outlook, Yahoo, etc."
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
              />

              <div>
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create a strong password"
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  required
                  autoComplete="new-password"
                />
                {formData.password && (
                  <div className="mt-2 space-y-1 text-xs">
                    <div className={`flex items-center space-x-1 ${formData.password.length >= 10 ? 'text-success-600' : 'text-neutral-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 10 ? 'bg-success-600' : 'bg-neutral-300'}`} />
                      <span>At least 10 characters</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${/[A-Z]/.test(formData.password) ? 'text-success-600' : 'text-neutral-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-success-600' : 'bg-neutral-300'}`} />
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${/[a-z]/.test(formData.password) ? 'text-success-600' : 'text-neutral-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-success-600' : 'bg-neutral-300'}`} />
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${/[0-9]/.test(formData.password) ? 'text-success-600' : 'text-neutral-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-success-600' : 'bg-neutral-300'}`} />
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-success-600' : 'text-neutral-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'bg-success-600' : 'bg-neutral-300'}`} />
                      <span>One special character (!@#$%...)</span>
                    </div>
                  </div>
                )}
              </div>

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
                leftIcon={<Lock className="w-4 h-4" />}
                required
                autoComplete="new-password"
              />

              {error && (
                <div className="flex items-center space-x-2 text-error-600 bg-error-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
                leftIcon={<Rocket className="w-4 h-4" />}
              >
                Create Account
              </Button>

              <div className="text-center">
                <p className="text-sm text-neutral-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Sign in
                  </button>
                </p>
              </div>

              <div className="text-center pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-500">
                  By creating an account, you agree to our{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
                </p>
              </div>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-neutral-600">
                  Enter your email and we'll send you a password reset link
                </p>
              </div>

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="creator@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
              />

              {error && (
                <div className="flex items-center space-x-2 text-error-600 bg-error-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
                leftIcon={<Mail className="w-4 h-4" />}
              >
                Send Reset Link
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}

          {/* Success State */}
          {mode === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-neutral-900 mb-2">
                  {success.includes('reset') ? 'Check Your Email' : 'Check Your Email'}
                </h4>
                <p className="text-neutral-600">{success}</p>
              </div>

              {!success.includes('reset') && (
                <div className="space-y-3">
                  <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg text-left">
                    <h5 className="font-semibold text-primary-900 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Important: Email Verification Required
                    </h5>
                    <div className="text-sm text-primary-800 space-y-2">
                      <p>We've sent a confirmation email to <strong>{formData.email}</strong></p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Open your email inbox</li>
                        <li>Click the verification link in the email</li>
                        <li>Return here and sign in with your credentials</li>
                      </ol>
                      <p className="text-xs text-primary-600 mt-3">
                        Can't find the email? Check your spam folder or contact support.
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={() => setMode('signin')}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Go to Sign In
                  </Button>
                </div>
              )}

              {success.includes('reset') && (
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleClose}
                >
                  Close
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};