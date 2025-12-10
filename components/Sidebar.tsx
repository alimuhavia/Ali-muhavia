import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Camera, DollarSign, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-800';
  };

  return (
    <div className="w-64 bg-indigo-900 min-h-screen flex flex-col fixed left-0 top-0 z-50 shadow-xl">
      <div className="p-6 border-b border-indigo-800 flex items-center space-x-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-900 font-bold">EG</div>
        <h1 className="text-xl font-bold text-white tracking-wide">EduGuard AI</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link to="/" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>
        
        <Link to="/attendance" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/attendance')}`}>
          <Camera size={20} />
          <span>Smart Attendance</span>
        </Link>

        <Link to="/students" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/students')}`}>
          <Users size={20} />
          <span>Student Admin</span>
        </Link>

        <Link to="/fees" className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/fees')}`}>
          <DollarSign size={20} />
          <span>Fee Management</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-indigo-800">
        <button className="flex items-center space-x-3 text-indigo-200 hover:text-white px-4 py-2 w-full transition-colors">
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;