import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { doc, updateDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import Reminders from '../../components/Patient/Reminders';
import { MedicalRecord } from '../../types';
import { 
  User, 
  Settings, 
  Upload, 
  History as HistoryIcon, 
  Shield, 
  ShieldOff,
  Copy,
  Check,
  FileText,
  ClipboardList,
  ChevronRight,
  Calendar
} from 'lucide-react';

const PatientDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentRecords = async () => {
      if (!profile?.id) return;
      
      const recordsRef = collection(db, 'records');
      const q = query(
        recordsRef,
        where('patientId', '==', profile.id),
        orderBy('createdAt', 'desc'),
        limit(4)
      );

      try {
        const querySnapshot = await getDocs(q);
        const fetchedRecords = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as MedicalRecord[];
        setRecords(fetchedRecords);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, 'records');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentRecords();
  }, [profile?.id]);

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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header Profile Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <User className="w-7 h-7" />
        </div>
        <div className="flex-1">
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

      {/* Medical History Section */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Medical History</span>
          </div>
          <Link to="/patient/timeline" className="text-[10px] text-blue-600 font-bold uppercase tracking-widest hover:underline px-2 py-0.5 rounded-full">See All</Link>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium italic">Loading history...</div>
          ) : records.length === 0 ? (
            <div className="py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center gap-2">
              <ClipboardList className="w-8 h-8 text-slate-200" />
              <p className="text-xs text-slate-400 font-medium">No records found yet</p>
              <Link to="/patient/upload" className="text-[10px] text-blue-600 font-bold uppercase">Upload Now</Link>
            </div>
          ) : (
            records.map((record) => (
              <a
                key={record.id}
                href={record.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:border-blue-200 transition-all group"
              >
                <div className={`p-2.5 rounded-xl ${record.type === 'prescription' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {record.type === 'prescription' ? <FileText className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate leading-tight mb-0.5">{record.fileName}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md ${record.type === 'prescription' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {record.type}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                      <Calendar className="w-3 h-3" />
                      {formatDate(record.createdAt)}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </a>
            ))
          )}
        </div>
      </div>

      {/* Vitals Summary Card */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Health Vitals</span>
          <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest bg-green-50 px-2 py-0.5 rounded-full">Synchronized</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">BMI</span>
            <p className="text-base font-black text-slate-900">22.4</p>
            <div className="h-1 w-8 bg-blue-500 mx-auto rounded-full"></div>
          </div>
          <div className="text-center space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Heart</span>
            <p className="text-base font-black text-slate-900">72</p>
            <div className="h-1 w-8 bg-red-400 mx-auto rounded-full"></div>
          </div>
          <div className="text-center space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Sleep</span>
            <p className="text-base font-black text-slate-900">7.5h</p>
            <div className="h-1 w-8 bg-indigo-400 mx-auto rounded-full"></div>
          </div>
        </div>
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
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${profile.sharingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
      </div>

      {/* Health Reminders */}
      <Reminders />
    </div>
  );
};

export default PatientDashboard;
