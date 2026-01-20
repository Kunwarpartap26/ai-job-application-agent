import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ResumesPage = () => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/resumes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResumes(response.data.resumes || []);
    } catch (error) {
      toast.error('Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (resumeId) => {
    setDownloadingId(resumeId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/resume/export-pdf?resume_id=${resumeId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `resume_${resumeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Resume downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download resume');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div data-testid="resumes-page-container" className="space-y-8">
        <div>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight mb-2">
            My Resumes
          </h1>
          <p className="text-lg text-stone-600">ATS-optimized resumes generated for your applications</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-white border border-stone-200 rounded-2xl p-6 hover:border-orange-200 transition-all hover:shadow-md"
                data-testid={`resume-card-${resume.id}`}
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <FileText className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" strokeWidth={1.5} />
                      <div>
                        <h3 className="font-heading text-2xl font-semibold text-stone-900 mb-1">
                          {resume.job_title}
                        </h3>
                        <div className="flex items-center gap-2 text-stone-600 text-sm">
                          <Calendar className="w-4 h-4" strokeWidth={1.5} />
                          <span>Generated {new Date(resume.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-stone-600 mb-2">Keywords optimized for:</p>
                      <div className="flex flex-wrap gap-2">
                        {resume.keywords.slice(0, 8).map((keyword, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-3 py-1 bg-orange-100 text-orange-700 rounded-full"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <details className="mt-4">
                      <summary className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium">
                        View Resume Content
                      </summary>
                      <div className="mt-3 p-4 bg-stone-50 rounded-lg text-sm text-stone-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
                        {resume.content}
                      </div>
                    </details>
                  </div>
                  <Button
                    onClick={() => downloadPDF(resume.id)}
                    disabled={downloadingId === resume.id}
                    data-testid={`download-pdf-${resume.id}`}
                    className="bg-orange-600 text-white hover:bg-orange-700 rounded-full px-6 py-3 font-medium transition-transform active:scale-95 shadow-sm hover:shadow-md"
                  >
                    {downloadingId === resume.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && resumes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-lg text-stone-600 mb-4">
              No resumes generated yet. Apply to jobs to create AI-optimized resumes!
            </p>
            <Button
              onClick={() => window.location.href = '/jobs'}
              data-testid="browse-jobs-from-resumes"
              className="bg-orange-600 text-white hover:bg-orange-700 rounded-full px-8 py-3 font-medium transition-transform active:scale-95"
            >
              Browse Jobs
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResumesPage;