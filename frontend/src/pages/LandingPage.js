import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Target, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-600" strokeWidth={1.5} />
            <span className="font-heading text-xl font-semibold text-stone-900">AutoApply AI</span>
          </div>
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/auth')}
              data-testid="nav-login-btn"
              className="text-stone-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors"
            >
              Login
            </Button>
            <Button
              onClick={() => navigate('/auth')}
              data-testid="nav-signup-btn"
              className="bg-orange-600 text-white hover:bg-orange-700 rounded-full px-8 py-3 font-medium transition-transform active:scale-95 shadow-sm hover:shadow-md"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="font-heading text-5xl md:text-7xl font-semibold text-stone-900 tracking-tight leading-[1.1]">
              Land Your Dream Job on Autopilot
            </h1>
            <p className="text-lg md:text-xl text-stone-600 leading-relaxed">
              Let AI handle your job applications while you focus on what matters. 
              Generate ATS-friendly resumes, get matched with perfect opportunities, 
              and apply automatically.
            </p>
            <div className="flex gap-4">
              <Button
                onClick={() => navigate('/auth')}
                data-testid="hero-cta-btn"
                className="bg-orange-600 text-white hover:bg-orange-700 rounded-full px-8 py-6 text-lg font-medium transition-transform active:scale-95 shadow-sm hover:shadow-md"
              >
                Start Applying Now
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1511385348-a52b4a160dc2?crop=entropy&cs=srgb&fm=jpg&q=85"
              alt="Professional workspace"
              className="rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.16)] transition-shadow duration-300"
            />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight mb-4">
            How It Works
          </h2>
          <p className="text-lg text-stone-600">Three simple steps to automate your job search</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-stone-200 rounded-2xl p-8 hover:border-orange-200 transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
              <Target className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
            </div>
            <h3 className="font-heading text-2xl font-semibold text-stone-900 mb-3">Build Your Profile</h3>
            <p className="text-stone-600 leading-relaxed">
              Add your education, skills, projects, and experience. Our AI will optimize everything for maximum ATS compatibility.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-8 hover:border-orange-200 transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
              <Sparkles className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
            </div>
            <h3 className="font-heading text-2xl font-semibold text-stone-900 mb-3">AI Job Matching</h3>
            <p className="text-stone-600 leading-relaxed">
              Our AI analyzes thousands of jobs and scores them based on your profile. Only see opportunities that truly fit.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-8 hover:border-orange-200 transition-all hover:shadow-md group">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
              <Zap className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" strokeWidth={1.5} />
            </div>
            <h3 className="font-heading text-2xl font-semibold text-stone-900 mb-3">Auto-Apply</h3>
            <p className="text-stone-600 leading-relaxed">
              Click apply and let our AI generate a custom resume and cover letter for each job. Track everything in one dashboard.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-white border border-stone-200 rounded-2xl p-12">
          <div className="text-center mb-12">
            <h2 className="font-heading text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight mb-4">
              Why AutoApply AI?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              'ATS-optimized resumes for every application',
              'AI-powered job compatibility scoring',
              'Automated cover letter generation',
              'Application tracking dashboard',
              'Support for LinkedIn, Indeed & Wellfound',
              'Export resumes as PDF'
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" strokeWidth={1.5} />
                <span className="text-lg text-stone-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-orange-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-semibold text-white tracking-tight mb-6">
            Ready to Land Your Next Role?
          </h2>
          <p className="text-xl text-orange-100 mb-8">
            Join thousands of job seekers who are automating their applications with AI
          </p>
          <Button
            onClick={() => navigate('/auth')}
            data-testid="footer-cta-btn"
            className="bg-white text-orange-600 hover:bg-orange-50 rounded-full px-8 py-6 text-lg font-medium transition-transform active:scale-95 shadow-lg hover:shadow-xl"
          >
            Get Started Free
          </Button>
        </div>
      </section>

      <footer className="bg-white border-t border-stone-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-stone-600">
          <p>&copy; 2025 AutoApply AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;