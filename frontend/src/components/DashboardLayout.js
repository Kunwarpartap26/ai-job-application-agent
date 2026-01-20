import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, Briefcase, FileText, FolderOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', testId: 'nav-dashboard' },
    { icon: User, label: 'Profile', path: '/profile', testId: 'nav-profile' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs', testId: 'nav-jobs' },
    { icon: FolderOpen, label: 'Applications', path: '/applications', testId: 'nav-applications' },
    { icon: FileText, label: 'Resumes', path: '/resumes', testId: 'nav-resumes' }
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <aside className="bg-white border-r border-stone-200 w-64 hidden md:flex flex-col h-screen sticky top-0">
        <div className="p-6 border-b border-stone-200">
          <h2 className="font-heading text-xl font-semibold text-stone-900">AutoApply AI</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setCurrentPath(item.path);
                }}
                data-testid={item.testId}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-stone-200">
          <Button
            onClick={handleLogout}
            data-testid="logout-btn"
            variant="ghost"
            className="w-full justify-start text-stone-600 hover:text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" strokeWidth={1.5} />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;