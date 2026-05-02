import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (userData: any, profileData: UserProfile | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  profile: null, 
  loading: true,
  login: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(() => {
    const saved = localStorage.getItem('demo_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('demo_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = (userData: any, profileData: UserProfile | null) => {
    setUser(userData);
    setProfile(profileData);
    localStorage.setItem('demo_user', JSON.stringify(userData));
    if (profileData) localStorage.setItem('demo_profile', JSON.stringify(profileData));
  };

  const logout = () => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('demo_user');
    localStorage.removeItem('demo_profile');
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
