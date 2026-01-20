import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProfileBuilder = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: [],
    education: [],
    experience: [],
    projects: [],
    preferred_roles: []
  });
  const [newSkill, setNewSkill] = useState('');
  const [newRole, setNewRole] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API}/profile`, profile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Profile saved successfully!');
    } catch (error) {
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const addEducation = () => {
    setProfile({
      ...profile,
      education: [...profile.education, { degree: '', field: '', institution: '', year: '' }]
    });
  };

  const addExperience = () => {
    setProfile({
      ...profile,
      experience: [...profile.experience, { title: '', company: '', duration: '', description: '' }]
    });
  };

  const addProject = () => {
    setProfile({
      ...profile,
      projects: [...profile.projects, { name: '', description: '', technologies: '' }]
    });
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (index) => {
    setProfile({ ...profile, skills: profile.skills.filter((_, i) => i !== index) });
  };

  const addPreferredRole = () => {
    if (newRole.trim()) {
      setProfile({ ...profile, preferred_roles: [...profile.preferred_roles, newRole.trim()] });
      setNewRole('');
    }
  };

  const removeRole = (index) => {
    setProfile({ ...profile, preferred_roles: profile.preferred_roles.filter((_, i) => i !== index) });
  };

  return (
    <DashboardLayout>
      <div data-testid="profile-builder-container" className="max-w-4xl">
        <div className="mb-8">
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-stone-900 tracking-tight mb-2">
            Build Your Profile
          </h1>
          <p className="text-lg text-stone-600">Tell us about yourself to generate ATS-optimized resumes</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-stone-200 rounded-2xl p-8">
            <h2 className="font-heading text-2xl font-semibold text-stone-900 mb-6">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-stone-700 mb-1.5 block">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  data-testid="profile-name-input"
                  className="bg-white border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg h-12 px-4 transition-all"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-stone-700 mb-1.5 block">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  data-testid="profile-email-input"
                  className="bg-white border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg h-12 px-4 transition-all"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-stone-700 mb-1.5 block">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  data-testid="profile-phone-input"
                  className="bg-white border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg h-12 px-4 transition-all"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-sm font-medium text-stone-700 mb-1.5 block">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  data-testid="profile-location-input"
                  placeholder="City, State"
                  className="bg-white border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg h-12 px-4 transition-all"
                />
              </div>
            </div>
            <div className="mt-6">
              <Label htmlFor="summary" className="text-sm font-medium text-stone-700 mb-1.5 block">Professional Summary</Label>
              <Textarea
                id="summary"
                value={profile.summary}
                onChange={(e) => setProfile({ ...profile, summary: e.target.value })}
                data-testid="profile-summary-input"
                placeholder="Brief summary of your professional background"
                rows={4}
                className="bg-white border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg px-4 py-3 transition-all resize-none"
              />
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-8">
            <h2 className="font-heading text-2xl font-semibold text-stone-900 mb-6">Skills</h2>
            <div className="flex gap-2 mb-4">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill"
                data-testid="add-skill-input"
                className="bg-white border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg h-12 px-4 transition-all"
              />
              <Button onClick={addSkill} data-testid="add-skill-btn" className="bg-orange-600 text-white hover:bg-orange-700 rounded-full px-6">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <div key={index} className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full flex items-center gap-2">
                  <span>{skill}</span>
                  <button onClick={() => removeSkill(index)} data-testid={`remove-skill-${index}`}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-8">
            <h2 className="font-heading text-2xl font-semibold text-stone-900 mb-6">Education</h2>
            {profile.education.map((edu, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 border border-stone-200 rounded-lg">
                <Input
                  placeholder="Degree"
                  value={edu.degree}
                  onChange={(e) => {
                    const updated = [...profile.education];
                    updated[index].degree = e.target.value;
                    setProfile({ ...profile, education: updated });
                  }}
                  data-testid={`edu-degree-${index}`}
                  className="bg-white border-stone-200 rounded-lg h-10 px-4"
                />
                <Input
                  placeholder="Field of Study"
                  value={edu.field}
                  onChange={(e) => {
                    const updated = [...profile.education];
                    updated[index].field = e.target.value;
                    setProfile({ ...profile, education: updated });
                  }}
                  data-testid={`edu-field-${index}`}
                  className="bg-white border-stone-200 rounded-lg h-10 px-4"
                />
                <Input
                  placeholder="Institution"
                  value={edu.institution}
                  onChange={(e) => {
                    const updated = [...profile.education];
                    updated[index].institution = e.target.value;
                    setProfile({ ...profile, education: updated });
                  }}
                  data-testid={`edu-institution-${index}`}
                  className="bg-white border-stone-200 rounded-lg h-10 px-4"
                />
                <Input
                  placeholder="Year"
                  value={edu.year}
                  onChange={(e) => {
                    const updated = [...profile.education];
                    updated[index].year = e.target.value;
                    setProfile({ ...profile, education: updated });
                  }}
                  data-testid={`edu-year-${index}`}
                  className="bg-white border-stone-200 rounded-lg h-10 px-4"
                />
              </div>
            ))}
            <Button onClick={addEducation} data-testid="add-education-btn" variant="outline" className="border-stone-200 rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Add Education
            </Button>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-8">
            <h2 className="font-heading text-2xl font-semibold text-stone-900 mb-6">Experience</h2>
            {profile.experience.map((exp, index) => (
              <div key={index} className="space-y-4 mb-4 p-4 border border-stone-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Job Title"
                    value={exp.title}
                    onChange={(e) => {
                      const updated = [...profile.experience];
                      updated[index].title = e.target.value;
                      setProfile({ ...profile, experience: updated });
                    }}
                    data-testid={`exp-title-${index}`}
                    className="bg-white border-stone-200 rounded-lg h-10 px-4"
                  />
                  <Input
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...profile.experience];
                      updated[index].company = e.target.value;
                      setProfile({ ...profile, experience: updated });
                    }}
                    data-testid={`exp-company-${index}`}
                    className="bg-white border-stone-200 rounded-lg h-10 px-4"
                  />
                </div>
                <Input
                  placeholder="Duration (e.g., 2020-2022)"
                  value={exp.duration}
                  onChange={(e) => {
                    const updated = [...profile.experience];
                    updated[index].duration = e.target.value;
                    setProfile({ ...profile, experience: updated });
                  }}
                  data-testid={`exp-duration-${index}`}
                  className="bg-white border-stone-200 rounded-lg h-10 px-4"
                />
                <Textarea
                  placeholder="Job Description"
                  value={exp.description}
                  onChange={(e) => {
                    const updated = [...profile.experience];
                    updated[index].description = e.target.value;
                    setProfile({ ...profile, experience: updated });
                  }}
                  data-testid={`exp-description-${index}`}
                  rows={3}
                  className="bg-white border-stone-200 rounded-lg px-4 py-3 resize-none"
                />
              </div>
            ))}
            <Button onClick={addExperience} data-testid="add-experience-btn" variant="outline" className="border-stone-200 rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Add Experience
            </Button>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-8">
            <h2 className="font-heading text-2xl font-semibold text-stone-900 mb-6">Projects</h2>
            {profile.projects.map((proj, index) => (
              <div key={index} className="space-y-4 mb-4 p-4 border border-stone-200 rounded-lg">
                <Input
                  placeholder="Project Name"
                  value={proj.name}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[index].name = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                  data-testid={`proj-name-${index}`}
                  className="bg-white border-stone-200 rounded-lg h-10 px-4"
                />
                <Textarea
                  placeholder="Project Description"
                  value={proj.description}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[index].description = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                  data-testid={`proj-description-${index}`}
                  rows={2}
                  className="bg-white border-stone-200 rounded-lg px-4 py-3 resize-none"
                />
                <Input
                  placeholder="Technologies Used"
                  value={proj.technologies}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[index].technologies = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                  data-testid={`proj-technologies-${index}`}
                  className="bg-white border-stone-200 rounded-lg h-10 px-4"
                />
              </div>
            ))}
            <Button onClick={addProject} data-testid="add-project-btn" variant="outline" className="border-stone-200 rounded-full">
              <Plus className="w-4 h-4 mr-2" /> Add Project
            </Button>
          </div>

          <div className="bg-white border border-stone-200 rounded-2xl p-8">
            <h2 className="font-heading text-2xl font-semibold text-stone-900 mb-6">Preferred Roles</h2>
            <div className="flex gap-2 mb-4">
              <Input
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPreferredRole()}
                placeholder="Add a preferred role"
                data-testid="add-role-input"
                className="bg-white border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 rounded-lg h-12 px-4 transition-all"
              />
              <Button onClick={addPreferredRole} data-testid="add-role-btn" className="bg-orange-600 text-white hover:bg-orange-700 rounded-full px-6">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.preferred_roles.map((role, index) => (
                <div key={index} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full flex items-center gap-2">
                  <span>{role}</span>
                  <button onClick={() => removeRole(index)} data-testid={`remove-role-${index}`}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            data-testid="save-profile-btn"
            className="w-full bg-orange-600 text-white hover:bg-orange-700 rounded-full h-12 font-medium transition-transform active:scale-95 shadow-sm hover:shadow-md"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileBuilder;