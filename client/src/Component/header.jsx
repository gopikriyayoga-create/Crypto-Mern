import React, { useState } from 'react';
import { Bell, User, Search, Settings, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';

export default function Header() {
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    // Basic logout logic here
    navigate('/');
  };

  return (
    <header className="flex justify-between items-center p-6 bg-black border-b border-white/5">
      <div className="flex items-center bg-[#161616] rounded-full px-4 py-2 w-1/3 border border-white/5">
        <Search className="text-gray-500 w-5 h-5 mr-2" />
        <input 
          type="text" 
          placeholder="Search crypto..." 
          className="bg-transparent border-none outline-none text-white w-full text-sm"
        />
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/dashboard/alerts')} 
          className={`relative p-2 rounded-full transition-all ${location.pathname === '/dashboard/alerts' ? 'bg-orange-500/20 text-orange-500' : 'bg-[#161616] text-gray-400 hover:text-white'}`}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-black"></span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 bg-[#161616] p-2 pr-4 rounded-full border border-white/5 hover:border-white/20 transition-all"
          >
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white font-bold">
              U
            </div>
            <span className="text-sm font-medium text-white">User Profile</span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-[#161616] border border-white/5 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="p-4 border-b border-white/5">
                <p className="text-white text-sm font-bold">User Name</p>
                <p className="text-gray-500 text-xs">user@example.com</p>
              </div>
              <div className="py-2">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                  <User size={16} /> My Account
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2">
                  <Settings size={16} /> Settings
                </button>
              </div>
              <div className="py-2 border-t border-white/5">
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
