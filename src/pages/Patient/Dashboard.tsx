import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import Reminders from '../../components/Patient/Reminders';
import { 
  User, 
  Settings, 
  Upload, 
  History, 
  Shield, 
  ShieldOff,
  Copy,
  Check
} from 'lucide-react';

const PatientDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  if (!profile) return null;

  const toggleSharing = async () => {
    const userRef = doc(db, 'users', profile.id);
    try {
      await updateDoc(userRef, {
        sharingEnabled: !profile.sharingEnabled
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.id}`);
    }
  };

  const copyId = () => {
    navigator.clipboard.writeText(profile.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `${window.location.origin}/doctor/patient/${profile.id}`;

  return (
    <div className="space-y-6 pb-20">
      {/* Header Profile Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <User className="w-7 h-7" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none block mb-1">Patient Profile</span>
          <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
          <p className="text-xs text-slate-500 font-medium">{profile.age} yrs • {profile.gender} • {profile.bloodGroup}</p>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center gap-6">
        <div className="text-center space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Unique Patient QR</span>
          <p className="text-[10px] text-slate-400">Doctors scan this for instant access</p>
        </div>
        
        <div className="p-4 bg-slate-50 border-4 border-slate-50 rounded-3xl">
          <QRCodeSVG value={qrUrl} size={160} />
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className={`w-2 h-2 rounded-full ${profile.sharingEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs font-bold text-slate-700">Sharing: {profile.sharingEnabled ? 'ON' : 'OFF'}</span>
        </div>
      </div>

      {/* Action Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Link 
          to="/patient/upload"
          className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex flex-col items-center gap-2 shadow-sm hover:bg-blue-100 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold group-active:scale-95 transition-transform">+</div>
          <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Upload Record</span>
        </Link>
        <Link 
          to="/patient/timeline"
          className="bg-slate-50 border border-slate-200 p-6 rounded-3xl flex flex-col items-center gap-2 shadow-sm hover:bg-slate-100 transition-all group"
        >
          <div className="w-12 h-12 rounded-full bg-white border border-slate-300 flex items-center justify-center text-slate-400 text-2xl font-bold group-active:scale-95 transition-transform">≡</div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Timeline</span>
        </Link>
      </div>

      {/* Privacy Toggle (Mini) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${profile.sharingEnabled ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {profile.sharingEnabled ? <Shield className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
          </div>
          <span className="text-xs font-bold text-slate-700">Medical Privacy Mode</span>
        </div>
        
        <button
          onClick={toggleSharing}
          className={`relative w-10 h-5 rounded-full transition-colors ${profile.sharingEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${profile.sharingEnabled ? 'left-5.5' : 'left-0.5'}`} />
        </button>
      </div>

      {/* Health Reminders */}
      <Reminders />
    </div>
  );
};

export default PatientDashboard;
