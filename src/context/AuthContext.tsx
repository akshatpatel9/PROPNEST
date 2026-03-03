import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string) => Promise<any>;
  logout: () => Promise<void>;
  toggleSavedProperty: (propertyId: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = {
          id: userId,
          name: email.split('@')[0],
          email: email,
          saved_properties: []
        };
        await supabase.from('profiles').insert([newProfile]);
        setUser({
          id: userId,
          name: newProfile.name,
          email: newProfile.email,
          savedProperties: []
        });
      } else if (data) {
        setUser({
          id: userId,
          name: data.name,
          email: data.email,
          savedProperties: data.saved_properties || []
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password = 'password123') => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signup = async (email: string, password = 'password123') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const toggleSavedProperty = async (propertyId: string) => {
    if (!user) return;
    
    const currentSavedProperties = user.savedProperties || [];
    const isSaved = currentSavedProperties.includes(propertyId);
    
    const newSavedProperties = isSaved
      ? currentSavedProperties.filter(id => id !== propertyId)
      : [...currentSavedProperties, propertyId];

    // Optimistic update
    setUser({ ...user, savedProperties: newSavedProperties });

    // Update Supabase
    await supabase
      .from('profiles')
      .update({ saved_properties: newSavedProperties })
      .eq('id', user.id);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, toggleSavedProperty, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
