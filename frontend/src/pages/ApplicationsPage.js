import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Calendar, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [statusFilter, applications]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/applications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data.applications || []);
      setFilteredApplications(response.data.applications || []);
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    if (statusFilter === 'all') {
      setFilteredApplications(applications);
    } else {
      setFilteredApplications(applications.filter((app) => app.status === statusFilter));
    }
  };

  const updateStatus = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API}/applications/${applicationId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setApplications(
        applications.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-700';
      case 'Interview':
        return 'bg-green-100 text-green-700';
      case 'Rejected':
        return 'bg-red-100 text-red-700';
      case 'Offer':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

  return (
    <DashboardLayout>
      <div data-testid="applications-page-container" className="space-y-8">
        <div>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight mb-2">
            Applications
          </h1>
          <p className="text-lg text-stone-600">Track your job applications</p>
        </div>

        <div className="flex justify-between items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger data-testid="status-filter-select" className="w-48 bg-white border-stone-200 rounded-lg h-12">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Applied">Applied</SelectItem>
              <SelectItem value="Interview">Interview</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
              <SelectItem value="Offer">Offer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-orange-200 transition-all hover:shadow-md"
                data-testid={`application-card-${app.id}`}
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <h3 className="font-heading text-2xl font-semibold text-stone-900">{app.job_title}</h3>
                      <Badge className={getStatusColor(app.status)} data-testid={`app-status-${app.id}`}>
                        {app.status}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2 text-stone-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" strokeWidth={1.5} />
                        <span>{app.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" strokeWidth={1.5} />
                        <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {app.cover_letter && (
                      <details className="mt-4">
                        <summary className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium">
                          View Cover Letter
                        </summary>
                        <div className="mt-3 p-4 bg-stone-50 rounded-lg text-sm text-stone-700 whitespace-pre-wrap">
                          {app.cover_letter}
                        </div>
                      </details>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Select
                      value={app.status}
                      onValueChange={(value) => updateStatus(app.id, value)}
                      disabled={updatingId === app.id}
                    >
                      <SelectTrigger data-testid={`update-status-${app.id}`} className="w-full md:w-40 bg-white border-stone-200 rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Applied">Applied</SelectItem>
                        <SelectItem value="Interview">Interview</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                        <SelectItem value="Offer">Offer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredApplications.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-stone-600 mb-4">
              {statusFilter === 'all'
                ? 'No applications yet. Start by browsing jobs!'
                : `No ${statusFilter} applications found.`}
            </p>
            {statusFilter === 'all' && (
              <Button
                onClick={() => window.location.href = '/jobs'}
                data-testid="browse-jobs-cta"
                className="bg-orange-600 text-white hover:bg-orange-700 rounded-full px-8 py-3 font-medium transition-transform active:scale-95"
              >
                Browse Jobs
              </Button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ApplicationsPage;