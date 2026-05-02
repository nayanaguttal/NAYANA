import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { FileUp, ClipboardList, Loader2, CheckCircle2 } from 'lucide-react';

const PatientUpload: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report'>('prescription');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `records/${user.uid}/${fileName}`);
      
      const snapshot = await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, 'records'), {
        patientId: user.uid,
        fileUrl,
        fileName: file.name,
        type,
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setTimeout(() => navigate('/patient/timeline'), 1500);
    } catch (err) {
      console.error(err);
      alert('Upload failed. Please check your storage configuration.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 py-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Upload Record</h1>
        <p className="text-neutral-500">Securely add prescriptions or reports.</p>
      </div>

      <form onSubmit={handleUpload} className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm space-y-6">
        <div className="space-y-6">
          <div className="space-y-1 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-none mb-1">Document Type</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('prescription')}
              className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                type === 'prescription' ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' : 'border-slate-100 bg-slate-50 text-slate-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${type === 'prescription' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200'}`}>+</div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Prescription</span>
            </button>
            <button
              type="button"
              onClick={() => setType('report')}
              className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                type === 'report' ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm shadow-blue-100' : 'border-slate-100 bg-slate-50 text-slate-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${type === 'report' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200'}`}>+</div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Report</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block text-center mb-1">Select File</label>
            <div className="relative">
              <input
                type="file"
                id="file-upload"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,image/*"
              />
              <label 
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center gap-4 w-full py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] cursor-pointer hover:bg-slate-100 transition-colors"
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2 px-6 text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate max-w-full">{file.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tap to change</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-300 shadow-sm">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-bold text-slate-600 block mb-0.5 leading-none">Click to browse documents</span>
                      <span className="text-[10px] text-slate-400 font-bold tracking-wide">PDF or Images (Max 5MB)</span>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={!file || uploading || success}
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:bg-neutral-300 flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Uploading...</span>
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Upload Successful</span>
            </>
          ) : (
            'Confirm Upload'
          )}
        </button>
      </form>
    </div>
  );
};

export default PatientUpload;
