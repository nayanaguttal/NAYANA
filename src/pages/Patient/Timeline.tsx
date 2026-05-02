import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { MedicalRecord } from '../../types';
import { 
  FileText, 
  ClipboardList, 
  Calendar, 
  ExternalLink,
  Search,
  ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const PatientTimeline: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'records'),
      where('patientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recordsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MedicalRecord[];
      setRecords(recordsList);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center justify-between">
        <Link to="/patient" className="p-2 -ml-2 text-neutral-500 hover:text-neutral-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Medical Timeline</h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-3xl border border-neutral-100 shadow-sm space-y-3">
            <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-300 mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <p className="text-neutral-500">No records found yet.</p>
            <Link to="/patient/upload" className="inline-block text-blue-600 font-semibold">Upload your first record</Link>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center group shadow-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-800 capitalize">{record.type} - {record.fileName.split('_').pop()?.slice(0, 15)}...</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  {record.createdAt ? format(record.createdAt.toDate(), 'MMM dd, yyyy') : 'Processing...'} • Medical Record
                </span>
              </div>

              <a 
                href={record.fileUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-blue-600 font-bold text-[10px] uppercase tracking-wider hover:underline px-2 py-1"
              >
                VIEW
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientTimeline;
