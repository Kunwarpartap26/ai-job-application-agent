import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-orange-600" strokeWidth={1.5} />
            <span className="font-heading text-2xl font-semibold text-stone-900">AutoApply AI</span>
          </div>
          <h1 className="font-heading text-3xl font-semibold text-stone-900 mb-2">
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </h1>
          <p className="text-stone-600">
            {isLogin ? 'Sign in to continue your job search' : 'Create your account to start applying'}
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-stone-700 mb-1.5 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required={!isLogin}
                  data-testid="auth-name-input"
                  className="bg-white border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg h-12 px-4 transition-all"
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-stone-700 mb-1.5 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                data-testid="auth-email-input"
                className="bg-white border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg h-12 px-4 transition-all"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium text-stone-700 mb-1.5 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                data-testid="auth-password-input"
                className="bg-white border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg h-12 px-4 transition-all"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              data-testid="auth-submit-btn"
              className="w-full bg-orange-600 text-white hover:bg-orange-700 rounded-full h-12 font-medium transition-transform active:scale-95 shadow-sm hover:shadow-md"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              data-testid="auth-toggle-btn"
              className="text-stone-600 hover:text-orange-600 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;