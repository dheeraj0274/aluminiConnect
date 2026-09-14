'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';

interface JobDetail {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  employmentType: string;
  experienceRequired: string;
  skillsRequired: string[];
  salaryRange: string;
  applicationUrl: string;
  createdAt: string;
  postedBy: {
    _id: string;
    name: string;
    email: string;
    department: string;
  };
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params);
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/jobs?id=${jobId}`)
      .then(res => res.json())
      .then(data => setJob(data.job))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading job post...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="section-padding" style={{ textAlign: 'center' }}>
        <h2>Job Post Not Found</h2>
        <Link href="/jobs" className="btn btn-secondary" style={{ marginTop: 16 }}>
          Return to Job Board
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === job.postedBy?._id || user?.role === 'admin';

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: 840 }}>
        <Link href="/jobs" className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
          ← Back to Job Board
        </Link>

        <div className="card-panel" style={{ padding: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy)' }}>{job.title}</h1>
                <span className="badge badge-primary">{job.employmentType}</span>
              </div>
              <div style={{ color: 'var(--primary-blue)', fontSize: '1.1rem', fontWeight: 600 }}>
                🏢 {job.company} • 📍 {job.location || 'Remote'}
              </div>
            </div>

            {job.salaryRange && (
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>
                💰 {job.salaryRange}
              </div>
            )}
          </div>

          {/* Quick Meta */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.88rem', color: 'var(--text-secondary)', padding: '14px 0', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', marginBottom: 24 }}>
            <div>Experience: <strong>{job.experienceRequired || 'Not specified'}</strong></div>
            <div>Posted by: <strong>{job.postedBy?.name || 'Alumnus'}</strong></div>
            <div>Posted on: <strong>{formatDate(job.createdAt)}</strong></div>
          </div>

          {/* Skills Required */}
          {job.skillsRequired && job.skillsRequired.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>Required Skills</h4>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {job.skillsRequired.map(skill => (
                  <span key={skill} className="badge badge-info" style={{ textTransform: 'none' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 12 }}>Job Description & Requirements</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {job.description}
            </p>
          </div>

          {/* Apply Button */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingTop: 20, borderTop: '1px solid #E2E8F0' }}>
            {job.applicationUrl ? (
              <a href={job.applicationUrl} target="_blank" rel="noreferrer" className="btn btn-navy" style={{ padding: '12px 32px' }}>
                Apply Now ↗
              </a>
            ) : (
              <Link href={`/profile/${job.postedBy?._id}`} className="btn btn-navy" style={{ padding: '12px 32px' }}>
                Contact Poster for Application
              </Link>
            )}

            {isOwner && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                You are the author of this job post.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
