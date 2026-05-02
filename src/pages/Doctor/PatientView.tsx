import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { UserProfile, MedicalRecord } from '../../types';
import { 
  ArrowLeft, 
  ShieldAlert, 
  User, 
  FileText, 
  ClipboardList, 
  Calendar, 
  ExternalLink,
  MapPin,
  Droplets
} from 'lucide-react';
import { format } from 'date-fns';

const DoctorPatientView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      try {
        const patientDoc = await getDoc(doc(db, 'users', id));
        if (patientDoc.exists()) {
          const data = patientDoc.data() as UserProfile;
          setPatient(data);
          
          if (data.sharingEnabled) {
            // Fetch records
            const q = query(
              collection(db, 'records'),
              where('patientId', '==', id),
              orderBy('createdAt', 'desc')
            );
            
            onSnapshot(q, (snapshot) => {
              const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as MedicalRecord[];
              setRecords(list);
            });
          }
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center p-20">
      <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  if (notFound) return (
    <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
      <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold">Patient Not Found</h2>
      <p className="text-neutral-500 mb-6">The ID provided does not exist.</p>
      <Link to="/doctor" className="text-blue-600 font-semibold">Back to Dashboard</Link>
    </div>
  );

  if (patient && !patient.sharingEnabled) return (
    <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 px-6">
      <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
      <p className="text-neutral-500 mb-8 leading-relaxed">
        {patient.name} has disabled health record sharing. Please ask the patient to enable sharing from their dashboard.
      </p>
      <Link to="/doctor" className="inline-block py-4 px-8 bg-neutral-100 text-neutral-700 rounded-2xl font-bold hover:bg-neutral-200 transition-all">
        Back to Dashboard
      </Link>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link to="/doctor" className="p-2 -ml-2 text-neutral-500 hover:text-neutral-900">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-xl font-bold">Patient Profile</h1>
      </div>

      {/* Patient Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <User className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none block mb-1">Medical Record Access</span>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{patient?.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{patient?.age} yrs • {patient?.gender}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <Droplets className="w-4 h-4 text-red-500" />
            <span className="text-xs font-bold text-slate-700">{patient?.bloodGroup}</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 truncate">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-slate-700 truncate">{patient?.address}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-bold text-lg text-slate-800">Medical History</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{records.length} records</span>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No active records found</p>
          </div>
        ) : (
          records.map((record) => (
            <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-800 capitalize">{record.type} - {record.fileName.split('_').pop()?.slice(0, 15)}...</span>
                <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  {record.createdAt ? format(record.createdAt.toDate(), 'MMM dd, yyyy') : 'Processing...'}
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

export default DoctorPatientView;
