import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldPlus } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-blue-600 text-white py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center max-w-lg">
        <Link to="/" className="flex flex-col">
          <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">MedVault</span>
          <h1 className="text-lg font-bold leading-none">Health System</h1>
        </Link>

        {user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-400 border border-white/30 flex items-center justify-center font-bold text-xs uppercase">
              {profile?.name ? profile.name.split(' ').map(n => n[0]).join('') : 'U'}
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 opacity-70 hover:opacity-100 transition-opacity"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
