import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { Bell, LucideIcon, Pill, Calendar, Activity, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Reminders: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState('pill');

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReminders(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reminders');
    });

    return () => unsubscribe();
  }, [user]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle || !newTime) return;

    try {
      await addDoc(collection(db, 'reminders'), {
        userId: user.uid,
        title: newTitle,
        time: newTime,
        type: newType,
        createdAt: serverTimestamp(),
        completed: false
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reminders');
    }

    setNewTitle('');
    setNewTime('');
    setShowAdd(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reminders', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reminders/${id}`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pill': return <Pill className="w-4 h-4" />;
      case 'checkup': return <Calendar className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-800">Health Reminders</h3>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-lg"
        >
          Add New
        </button>
      </div>

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="p-8 bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No active reminders</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              key={reminder.id} 
              className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  reminder.type === 'pill' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                }`}>
                  {getTypeIcon(reminder.type)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{reminder.title}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{reminder.time}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(reminder.id)}
                className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-900">Add Reminder</h3>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-50 rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleAdd} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">What for?</label>
                  <input 
                    type="text" 
                    required 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Morning Medicine"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Time</label>
                    <input 
                      type="time" 
                      required 
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Type</label>
                    <select 
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 outline-none text-sm font-medium appearance-none"
                    >
                      <option value="pill">Medicine</option>
                      <option value="checkup">Checkup</option>
                      <option value="other">Health Alert</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold mt-2 shadow-lg shadow-blue-100">
                  Save Reminder
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reminders;
