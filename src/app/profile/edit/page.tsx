'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    currentCity: '',
    currentCountry: '',
    profilePhoto: '',
    jobTitle: '',
    company: '',
    industry: '',
    yearsOfExperience: 0,
    skillsInput: '',
    skills: [] as string[],
    degree: '',
    department: '',
    graduationYear: 2024,
    additionalEducation: '',
    bio: '',
    professionalSummary: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    availableForMentorship: false,
    mentorshipAreasInput: '',
    mentorshipAreas: [] as string[],
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            const p = data.profile;
            setFormData({
              fullName: p.fullName || user.name || '',
              phone: p.phone || '',
              currentCity: p.currentCity || user.currentLocation || '',
              currentCountry: p.currentCountry || '',
              profilePhoto: p.profilePhoto || '',
              jobTitle: p.jobTitle || '',
              company: p.company || '',
              industry: p.industry || '',
              yearsOfExperience: p.yearsOfExperience || 0,
              skillsInput: (p.skills || []).join(', '),
              skills: p.skills || [],
              degree: p.degree || '',
              department: p.department || user.department || '',
              graduationYear: p.graduationYear || user.graduationYear || 2024,
              additionalEducation: p.additionalEducation || '',
              bio: p.bio || '',
              professionalSummary: p.professionalSummary || '',
              linkedIn: p.linkedIn || '',
              github: p.github || '',
              portfolio: p.portfolio || '',
              availableForMentorship: !!p.availableForMentorship,
              mentorshipAreasInput: (p.mentorshipAreas || []).join(', '),
              mentorshipAreas: p.mentorshipAreas || [],
            });
          }
        })
        .catch(console.error);
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    const processedSkills = formData.skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const processedMentorshipAreas = formData.mentorshipAreasInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const payload = {
        ...formData,
        skills: processedSkills,
        mentorshipAreas: processedMentorshipAreas,
      };

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      await refreshUser();
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => router.push('/profile'), 1000);
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error updating profile' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
            Edit Alumni Profile
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Update your professional details, contact information, skills, and mentorship status.
          </p>
        </div>

        {message.text && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 24,
              fontSize: '0.9rem',
              background: message.type === 'success' ? '#e6f4ea' : '#fef2f2',
              border: `1px solid ${message.type === 'success' ? '#b7e1cd' : '#fecaca'}`,
              color: message.type === 'success' ? 'var(--success)' : 'var(--error)',
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-panel" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section 1: Basic Information */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>1. Basic Information</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profile Photo URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://example.com/photo.jpg"
                  value={formData.profilePhoto}
                  onChange={e => setFormData({ ...formData, profilePhoto: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="+91 9876543210"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current City</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Noida"
                  value={formData.currentCity}
                  onChange={e => setFormData({ ...formData, currentCity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Country</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="India"
                  value={formData.currentCountry}
                  onChange={e => setFormData({ ...formData, currentCountry: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Professional */}
          <div style={{ paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>2. Professional Experience</h3>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Senior Software Engineer"
                  value={formData.jobTitle}
                  onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Google / Microsoft"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Industry</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Technology / Healthcare"
                  value={formData.industry}
                  onChange={e => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Years of Experience</label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  max="50"
                  value={formData.yearsOfExperience}
                  onChange={e => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Skills (Comma-separated)</label>
              <input
                type="text"
                className="form-input"
                placeholder="React, Node.js, Python, System Design"
                value={formData.skillsInput}
                onChange={e => setFormData({ ...formData, skillsInput: e.target.value })}
              />
            </div>
          </div>

          {/* Section 3: Education */}
          <div style={{ paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>3. Education</h3>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Degree</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="B.Tech in Computer Science"
                  value={formData.degree}
                  onChange={e => setFormData({ ...formData, degree: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.graduationYear}
                  onChange={e => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bio */}
          <div style={{ paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>4. Bio & Summary</h3>
            <div className="form-group">
              <label className="form-label">Short Bio</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Brief introduction about yourself..."
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
          </div>

          {/* Section 5: Mentorship */}
          <div style={{ paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>5. Mentorship Status</h3>
            <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <input
                type="checkbox"
                id="mentorshipCheck"
                checked={formData.availableForMentorship}
                onChange={e => setFormData({ ...formData, availableForMentorship: e.target.checked })}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-blue)' }}
              />
              <label htmlFor="mentorshipCheck" style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.92rem', cursor: 'pointer' }}>
                Available for Mentorship
              </label>
            </div>

            {formData.availableForMentorship && (
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="form-label">Mentorship Topics (Comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Resume Review, Mock Interviews, Career Guidance"
                  value={formData.mentorshipAreasInput}
                  onChange={e => setFormData({ ...formData, mentorshipAreasInput: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Section 6: Links */}
          <div style={{ paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>6. Professional Links</h3>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedIn}
                  onChange={e => setFormData({ ...formData, linkedIn: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">GitHub URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/username"
                  value={formData.github}
                  onChange={e => setFormData({ ...formData, github: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Portfolio Website</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://yourwebsite.com"
                  value={formData.portfolio}
                  onChange={e => setFormData({ ...formData, portfolio: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.push('/profile')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-navy" disabled={saving} style={{ padding: '12px 28px' }}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
