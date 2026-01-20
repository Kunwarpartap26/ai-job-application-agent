import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Briefcase, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalApplications: 0,
    applied: 0,
    interview: 0,
    totalResumes: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [appsRes, resumesRes] = await Promise.all([
        axios.get(`${API}/applications`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/resumes`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const applications = appsRes.data.applications || [];
      setRecentApplications(applications.slice(0, 5));
      setStats({
        totalApplications: applications.length,
        applied: applications.filter(a => a.status === 'Applied').length,
        interview: applications.filter(a => a.status === 'Interview').length,
        totalResumes: resumesRes.data.resumes?.length || 0
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div data-testid="dashboard-container" className="space-y-8">
        <div>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-lg text-stone-600">Track your job search progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-orange-600" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-heading font-semibold text-stone-900 mb-1">
              {stats.totalApplications}
            </div>
            <div className="text-sm text-stone-600">Total Applications</div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-heading font-semibold text-stone-900 mb-1">
              {stats.applied}
            </div>
            <div className="text-sm text-stone-600">Applied</div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-heading font-semibold text-stone-900 mb-1">
              {stats.interview}
            </div>
            <div className="text-sm text-stone-600">Interviews</div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-3xl font-heading font-semibold text-stone-900 mb-1">
              {stats.totalResumes}
            </div>
            <div className="text-sm text-stone-600">Resumes Generated</div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-8">
          <h2 className="font-heading text-2xl font-semibold text-stone-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/profile')}
              data-testid="quick-action-profile-btn"
              className="bg-white text-stone-900 border border-stone-200 hover:bg-stone-50 rounded-full px-6 py-6 font-medium transition-colors justify-start"
            >
              Build Your Profile
            </Button>
            <Button
              onClick={() => navigate('/jobs')}
              data-testid="quick-action-jobs-btn"
              className="bg-orange-600 text-white hover:bg-orange-700 rounded-full px-6 py-6 font-medium transition-transform active:scale-95 shadow-sm hover:shadow-md"
            >
              Browse Jobs
            </Button>
            <Button
              onClick={() => navigate('/applications')}
              data-testid="quick-action-applications-btn"
              className="bg-white text-stone-900 border border-stone-200 hover:bg-stone-50 rounded-full px-6 py-6 font-medium transition-colors justify-start"
            >
              View Applications
            </Button>
          </div>
        </div>

        {recentApplications.length > 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-8">
            <h2 className="font-heading text-2xl font-semibold text-stone-900 mb-6">Recent Applications</h2>
            <div className="space-y-4">
              {recentApplications.map((app) => (
                <div
                  key={app.id}
                  className="border border-stone-200 rounded-xl p-4 hover:border-orange-200 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-stone-900">{app.job_title}</h3>
                      <p className="text-sm text-stone-600">{app.company}</p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;