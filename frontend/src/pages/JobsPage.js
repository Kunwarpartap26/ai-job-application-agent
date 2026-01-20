import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Building2, DollarSign, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [platform, setPlatform] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [platform]);

  useEffect(() => {
    filterJobs();
  }, [searchTerm, jobs]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = platform !== 'all' ? { platform } : {};
      const response = await axios.get(`${API}/jobs/search`, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setJobs(response.data.jobs || []);
      setFilteredJobs(response.data.jobs || []);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    if (!searchTerm.trim()) {
      setFilteredJobs(jobs);
      return;
    }
    const filtered = jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  const handleApply = async (jobId) => {
    setApplyingJobId(jobId);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API}/jobs/apply`,
        { job_id: jobId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Application submitted successfully! AI generated your resume and cover letter.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to apply');
    } finally {
      setApplyingJobId(null);
    }
  };

  return (
    <DashboardLayout>
      <div data-testid="jobs-page-container" className="space-y-8">
        <div>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight mb-2">
            Browse Jobs
          </h1>
          <p className="text-lg text-stone-600">AI-matched opportunities tailored for you</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search by job title or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="job-search-input"
            className="flex-1 bg-white border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg h-12 px-4 transition-all"
          />
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger data-testid="platform-filter-select" className="w-full md:w-48 bg-white border-stone-200 rounded-lg h-12">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="indeed">Indeed</SelectItem>
              <SelectItem value="wellfound">Wellfound</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-orange-200 transition-all hover:shadow-md group"
                data-testid={`job-card-${job.id}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-heading text-2xl font-semibold text-stone-900">{job.title}</h3>
                      {job.compatibility_score && (
                        <Badge
                          className={`${
                            job.compatibility_score >= 80
                              ? 'bg-green-100 text-green-700'
                              : job.compatibility_score >= 60
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                          data-testid={`compatibility-score-${job.id}`}
                        >
                          {job.compatibility_score}% Match
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-4 text-stone-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" strokeWidth={1.5} />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" strokeWidth={1.5} />
                        <span>{job.location}</span>
                      </div>
                      {job.salary_range && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" strokeWidth={1.5} />
                          <span>{job.salary_range}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-stone-600 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements.slice(0, 5).map((req, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 bg-stone-100 text-stone-700 rounded-full"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-stone-500">
                      <Badge variant="outline" className="border-stone-200">{job.job_type}</Badge>
                      <span>•</span>
                      <span>{job.platform}</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleApply(job.id)}
                  disabled={applyingJobId === job.id}
                  data-testid={`apply-btn-${job.id}`}
                  className="w-full md:w-auto bg-orange-600 text-white hover:bg-orange-700 rounded-full px-8 py-3 font-medium transition-transform active:scale-95 shadow-sm hover:shadow-md"
                >
                  {applyingJobId === job.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Apply with AI'
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-stone-600">No jobs found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobsPage;