'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function SubmitStoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    story: '',
    company: '',
    designation: '',
    category: 'career',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit story');

      alert('Story submitted successfully! It will appear on the gallery after admin review.');
      router.push('/stories');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error submitting story');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 6 }}>
            Share Your Alumni Story
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Inspire students and fellow alumni by sharing your professional milestones, achievements, or entrepreneurial journey.
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: 'var(--error)', borderRadius: 6, fontSize: '0.85rem', marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-panel" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Story Headline / Title *</label>
            <input
              type="text"
              className="form-input"
              placeholder="From Campus to Founding a Tech Startup"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Current Designation</label>
              <input
                type="text"
                className="form-input"
                placeholder="Co-founder & CTO"
                value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Company</label>
              <input
                type="text"
                className="form-input"
                placeholder="TechCorp"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="career">Career Journey</option>
                <option value="achievement">Achievement & Milestone</option>
                <option value="entrepreneurship">Entrepreneurship & Startups</option>
                <option value="education">Higher Education & Research</option>
                <option value="milestone">Personal Milestone</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Story *</label>
            <textarea
              className="form-textarea"
              rows={8}
              placeholder="Share details about your journey, key lessons learned, and advice for junior students..."
              required
              value={formData.story}
              onChange={e => setFormData({ ...formData, story: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => router.push('/stories')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-navy" disabled={submitting} style={{ padding: '12px 28px' }}>
              {submitting ? 'Submitting...' : 'Submit Story for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
