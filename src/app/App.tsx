import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import YearOverview from './components/YearOverview';
import MonthDetail from './components/MonthDetail';
import YearSettings from './components/YearSettings';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminLogin from './components/Admin/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import { Toaster } from 'sonner';

const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-full">加载中...</div>;
  }
  
  if (!user) {
    return <AdminLogin />;
  }
  
  return <AdminDashboard />;
};

export default function App() {
  const [activeView, setActiveView] = useState('overview');

  const renderContent = () => {
    if (activeView === 'overview') {
      return <YearOverview onNavigate={setActiveView} />;
    } else if (activeView === 'settings') {
      return <YearSettings />;
    } else if (activeView === 'admin') {
      return <AdminRoute />;
    } else if (activeView.startsWith('month-')) {
      const parts = activeView.split('-');
      const month = parseInt(parts[1]);
      const year = parseInt(parts[2]);
      return <MonthDetail month={month} year={year} onNavigate={setActiveView} />;
    }
    return <YearOverview onNavigate={setActiveView} />;
  };

  return (
    <AuthProvider>
      <ProjectProvider>
        <div className="w-full h-screen flex flex-col bg-gray-50">
          <Header />
          <div className="flex-1 flex overflow-hidden">
            <Sidebar activeView={activeView} onNavigate={setActiveView} />
            <main className="flex-1 overflow-y-auto">
              {renderContent()}
            </main>
          </div>
          <Toaster position="top-right" />
        </div>
      </ProjectProvider>
    </AuthProvider>
  );
}