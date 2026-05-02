import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserSearch, AlertCircle, ArrowRight, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import QRScanner from '../../components/Doctor/QRScanner';

const DoctorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!patientId.trim()) {
      setError('Please enter a Patient ID');
      return;
    }
    navigate(`/doctor/patient/${patientId.trim()}`);
  };

  const handleScanSuccess = (decodedText: string) => {
    // Some QR codes might be URLs, extract ID if necessary
    const id = decodedText.includes('/') ? decodedText.split('/').pop() || decodedText : decodedText;
    setPatientId(id);
    setShowScanner(false);
    navigate(`/doctor/patient/${id}`);
  };

  if (!profile) return null;

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Doctor Dashboard</h1>
        <p className="text-neutral-500">Welcome back, Dr. {profile.name.split(' ')[0]}</p>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl custom-shadow space-y-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-blue-50 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 flex items-center justify-center text-blue-600">
            <UserSearch className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-xl text-slate-900">Patient Lookup</h3>
            <p className="text-xs text-slate-500 font-medium max-w-[200px] mx-auto">Scan the Patient QR code or enter the unique ID manually.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between items-end mb-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Access Credentials</label>
              <button 
                type="button"
                onClick={() => setShowScanner(true)}
                className="text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
              >
                <Camera className="w-3 h-3" />
                Scan QR
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={patientId}
                onChange={(e) => {
                  setPatientId(e.target.value);
                  setError('');
                }}
                placeholder="Unique Patient ID..."
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm leading-tight">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span>Access Records</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-2">
        <h4 className="font-bold text-blue-800 text-sm">Quick Tip</h4>
        <p className="text-xs text-blue-700 leading-relaxed">
          The most secure way to access records is by scanning the patient's mobile device directly. Ask the patient to open their MedVault Dashboard.
        </p>
      </div>

      {/* Doctor Daily Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Patients Today</span>
          <p className="text-2xl font-black text-slate-900">12</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Consultations</span>
          <p className="text-2xl font-black text-blue-600">08</p>
        </div>
      </div>

      {showScanner && (
        <QRScanner 
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
