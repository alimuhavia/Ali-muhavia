import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import { AcademyProvider } from './context/AcademyContext';

const App: React.FC = () => {
  return (
    <AcademyProvider>
      <Router>
        <div className="flex bg-gray-50 min-h-screen font-sans">
          <Sidebar />
          <div className="flex-1 ml-64">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<AdminPanel />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/fees" element={<Fees />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AcademyProvider>
  );
};

export default App;