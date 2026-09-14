'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function CreateJobPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    employmentType: 'full-time',
    experienceRequired: '',
    skillsInput: '',
    salaryRange: '',
    applicationUrl: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'alumni' && user.role !== 'admin') {
      router.push('/jobs');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const skillsRequired = formData.skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          skillsRequired,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post job');

      router.push('/jobs');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error creating job post');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: 740 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 6 }}>
            Share a Job Opportunity
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Help fellow alumni and students advance their careers by sharing openings at your company.
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: 'var(--error)', borderRadius: 6, fontSize: '0.85rem', marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-panel" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Full Stack Software Engineer"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Company Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Acme Corp / TechCorp"
                required
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                className="form-input"
                placeholder="Noida, India / Remote"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Employment Type</label>
              <select
                className="form-select"
                value={formData.employmentType}
                onChange={e => setFormData({ ...formData, employmentType: e.target.value })}
              >
                <option value="full-time">Full-Time</option>
                <option value="part-time">Part-Time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Required</label>
              <input
                type="text"
                className="form-input"
                placeholder="1-3 years"
                value={formData.experienceRequired}
                onChange={e => setFormData({ ...formData, experienceRequired: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Salary Range (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="₹12L - ₹18L / annum"
                value={formData.salaryRange}
                onChange={e => setFormData({ ...formData, salaryRange: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Skills Required (Comma-separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="TypeScript, Next.js, Node.js, MongoDB"
              value={formData.skillsInput}
              onChange={e => setFormData({ ...formData, skillsInput: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Application URL / Link</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://company.com/careers/job-id"
              value={formData.applicationUrl}
              onChange={e => setFormData({ ...formData, applicationUrl: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Job Description *</label>
            <textarea
              className="form-textarea"
              rows={6}
              placeholder="Role responsibilities, team details, and application requirements..."
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.push('/jobs')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-navy" disabled={submitting} style={{ padding: '12px 28px' }}>
              {submitting ? 'Publishing...' : 'Publish Job Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
