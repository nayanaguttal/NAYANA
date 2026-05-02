import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { User, Activity, AlertCircle, Chrome } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // If new user via Google, we need a role. 
        // For simplicity in this demo, let's default to patient or ask via onboarding
        await setDoc(doc(db, 'users', user.uid), {
          id: user.uid,
          name: user.displayName || 'Google User',
          email: user.email || '',
          role: 'patient', // Default role for social login
          onboardingComplete: false,
          sharingEnabled: true,
        });
        navigate('/onboarding');
      } else {
        const userData = userDoc.data();
        if (userData.onboardingComplete) {
          navigate(userData.role === 'patient' ? '/patient' : '/doctor');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const userDoc = await getDoc(doc(db, 'users', userCred.user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.onboardingComplete) {
            navigate(userData.role === 'patient' ? '/patient' : '/doctor');
          } else {
            navigate('/onboarding');
          }
        } else {
          navigate('/onboarding');
        }
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'users', userCred.user.uid), {
          id: userCred.user.uid,
          name,
          email,
          role,
          onboardingComplete: false,
          sharingEnabled: role === 'patient' ? true : false,
        });
        navigate('/onboarding');
      }
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password auth is not enabled in Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2">
          Health Record MVP
        </div>
        <h1 className="text-4xl font-black text-slate-900 leading-tight">MedVault <br /><span className="text-blue-600">Health Portal</span></h1>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">Access your medical history anywhere, secure and private.</p>
      </div>

      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-xl custom-shadow space-y-6">
        <div className="flex p-1 bg-slate-100 rounded-2xl">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              !isLogin ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">I am a</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('patient')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all ${
                        role === 'patient' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-neutral-100 text-neutral-500'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('doctor')}
                      className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all ${
                        role === 'doctor' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-neutral-100 text-neutral-500'
                      }`}
                    >
                      <Activity className="w-4 h-4" />
                      Doctor
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
              placeholder="name@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500 ml-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Login' : 'Sign Up'}
          </button>

          <div className="relative flex items-center justify-center py-2">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Chrome className="w-5 h-5 text-blue-600" />
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
