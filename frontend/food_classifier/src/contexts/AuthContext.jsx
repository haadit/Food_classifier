import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('AuthContext: Getting initial session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('AuthContext: Initial session:', session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('AuthContext: User found, fetching profile for:', session.user.id);
        await fetchUserProfile(session.user.id);
      }
      setLoading(false);
      console.log('AuthContext: Initial loading complete');
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state change:', event, session);
        setUser(session?.user ?? null);
        if (session?.user) {
          console.log('AuthContext: User authenticated, fetching profile for:', session.user.id);
          await fetchUserProfile(session.user.id);
        } else {
          console.log('AuthContext: User logged out, clearing profile');
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      console.log('AuthContext: Fetching profile for user:', userId);
      
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);
      
      console.log('AuthContext: Profile query result:', { data, error });

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('AuthContext: Error fetching profile:', error);
        return;
      }

      console.log('AuthContext: Profile data:', data);
      setProfile(data);
    } catch (error) {
      console.error('AuthContext: Error fetching profile:', error);
    }
  };

  const signUp = async (email, password, fullName) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email, password) => {
    try {
      console.log('AuthContext: Attempting sign in for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('AuthContext: Sign in error:', error);
        throw error;
      }
      console.log('AuthContext: Sign in successful:', data);
      return { data, error: null };
    } catch (error) {
      console.error('AuthContext: Sign in catch error:', error);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Attempting to sign out...');
      
      // Clear local state first
      setUser(null);
      setProfile(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('AuthContext: Sign out error:', error);
        throw error;
      }
      console.log('AuthContext: Successfully signed out');
    } catch (error) {
      console.error('AuthContext: Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
