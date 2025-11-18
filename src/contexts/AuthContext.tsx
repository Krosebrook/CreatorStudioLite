import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  metadata?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<User>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.display_name,
    avatarUrl: supabaseUser.user_metadata?.avatar_url,
    metadata: supabaseUser.user_metadata
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('Failed to get session', error);
          return;
        }

        if (mounted) {
          setSession(currentSession);
          setUser(mapSupabaseUser(currentSession?.user || null));
        }

        if (currentSession?.user) {
          await ensureUserProfile(currentSession.user);
        }
      } catch (error) {
        logger.error('Auth initialization error', error as Error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        logger.info('Auth state changed', { event });

        if (mounted) {
          setSession(currentSession);
          setUser(mapSupabaseUser(currentSession?.user || null));

          if (event === 'SIGNED_IN' && currentSession?.user) {
            await ensureUserProfile(currentSession.user);
          }

          if (event === 'SIGNED_OUT') {
            setUser(null);
            setSession(null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const ensureUserProfile = async (supabaseUser: SupabaseUser) => {
    if (!supabase) return;

    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (fetchError) {
        logger.error('Failed to fetch user profile', fetchError);
        console.error('[AUTH] Profile fetch error:', fetchError);
        return;
      }

      if (!existingProfile) {
        console.log('[AUTH] Creating user profile for:', supabaseUser.id);
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({
            id: supabaseUser.id,
            display_name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.first_name || supabaseUser.email?.split('@')[0],
            avatar_url: supabaseUser.user_metadata?.avatar_url,
            metadata: supabaseUser.user_metadata || {}
          });

        if (insertError) {
          logger.error('Failed to create user profile', insertError);
          console.error('[AUTH] Profile creation error:', insertError);
        } else {
          logger.info('User profile created', { userId: supabaseUser.id });
          console.log('[AUTH] Profile created successfully');
        }
      } else {
        console.log('[AUTH] User profile already exists');
      }
    } catch (error) {
      logger.error('Error ensuring user profile', error as Error);
      console.error('[AUTH] Profile ensure error:', error);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: { name?: string }
  ): Promise<{ error: AuthError | null }> => {
    console.log('[AUTH] SignUp called with email:', email);

    if (!supabase) {
      console.error('[AUTH] Supabase not configured!');
      return { error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
    }

    try {
      setLoading(true);
      console.log('[AUTH] Calling supabase.auth.signUp...');

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      console.log('[AUTH] SignUp response:', { data, error });

      if (error) {
        console.error('[AUTH] Sign up failed:', error);
        logger.error('Sign up failed', error);
        return { error };
      }

      console.log('[AUTH] User signed up successfully');
      logger.info('User signed up successfully', { email });
      return { error: null };
    } catch (error) {
      console.error('[AUTH] Sign up exception:', error);
      logger.error('Sign up error', error as Error);
      return { error: { message: (error as Error).message, name: 'SignUpError', status: 500 } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    console.log('[AUTH] SignIn called with email:', email);

    if (!supabase) {
      console.error('[AUTH] Supabase not configured!');
      return { error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
    }

    try {
      setLoading(true);
      console.log('[AUTH] Calling supabase.auth.signInWithPassword...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      console.log('[AUTH] SignIn response:', { data, error });

      if (error) {
        console.error('[AUTH] Sign in failed:', error);
        logger.error('Sign in failed', error);
        return { error };
      }

      console.log('[AUTH] User signed in successfully');
      logger.info('User signed in successfully', { email });
      return { error: null };
    } catch (error) {
      console.error('[AUTH] Sign in exception:', error);
      logger.error('Sign in error', error as Error);
      return { error: { message: (error as Error).message, name: 'SignInError', status: 500 } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
    }

    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error('Sign out failed', error);
        return { error };
      }

      setUser(null);
      setSession(null);

      logger.info('User signed out successfully');
      return { error: null };
    } catch (error) {
      logger.error('Sign out error', error as Error);
      return { error: { message: (error as Error).message, name: 'SignOutError', status: 500 } as AuthError };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ error: AuthError | null }> => {
    if (!supabase) {
      return { error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        logger.error('Password reset failed', error);
        return { error };
      }

      logger.info('Password reset email sent', { email });
      return { error: null };
    } catch (error) {
      logger.error('Password reset error', error as Error);
      return { error: { message: (error as Error).message, name: 'ResetPasswordError', status: 500 } as AuthError };
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<{ error: Error | null }> => {
    if (!supabase || !user) {
      return { error: new Error('Not authenticated') };
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: updates.name,
          avatar_url: updates.avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        logger.error('Profile update failed', error);
        return { error };
      }

      setUser({ ...user, ...updates });
      logger.info('Profile updated successfully', { userId: user.id });
      return { error: null };
    } catch (error) {
      logger.error('Profile update error', error as Error);
      return { error: error as Error };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
