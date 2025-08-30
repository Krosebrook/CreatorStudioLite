import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of your auth context
interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to safely get initial session
const getInitialSession = (): User | null => {
  try {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      return null;
    }

    // Safely check localStorage
    const storedAuth = localStorage.getItem('auth');
    if (!storedAuth) {
      return null;
    }

    // Parse the stored auth data with error handling
    const parsedAuth = JSON.parse(storedAuth);
    
    // Validate that parsedAuth has the expected structure
    if (parsedAuth && parsedAuth.auth && parsedAuth.auth.user) {
      return parsedAuth.auth.user;
    }
    
    // Alternative: Check if parsedAuth itself is the user object
    if (parsedAuth && parsedAuth.id && parsedAuth.email) {
      return parsedAuth;
    }

    return null;
  } catch (error) {
    console.error('Error getting initial session:', error);
    return null;
  }
};

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const initialUser = getInitialSession();
        setUser(initialUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Replace this with your actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      const userData = data.user;
      
      // Store user data in localStorage
      localStorage.setItem('auth', JSON.stringify({ auth: { user: userData } }));
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout API if needed
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      // Clear local storage
      localStorage.removeItem('auth');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local state
      localStorage.removeItem('auth');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      
      // Replace with your actual API call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      const userData = data.user;
      
      // Store user data in localStorage
      localStorage.setItem('auth', JSON.stringify({ auth: { user: userData } }));
      setUser(userData);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context if needed elsewhere
export default AuthContext;