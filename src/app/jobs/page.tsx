'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { timeAgo } from '@/lib/utils';

interface JobItem {
  _id: string;
  title: string;
  company: string;
  description: string;
  location: string;
  employmentType: string;
  experienceRequired: string;
  skillsRequired: string[];
  salaryRange: string;
  createdAt: string;
  postedBy: {
    name: string;
    department: string;
  };
}

export default function JobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedType) params.append('type', selectedType);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return (
    <div className="section-padding">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px' }}>
          <span style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1.5px' }}>
            CAREER OPPORTUNITIES
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '8px 0 12px' }}>
            Alumni Job & Internship Board
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Browse career openings shared directly by alumni hiring managers at global companies.
          </p>
        </div>

        {/* Filter & Action Bar */}
        <div className="card-panel" style={{ padding: 16, marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search jobs by title, company, skills..."
              style={{ flex: 1, minWidth: 240 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select
              className="form-select"
              style={{ width: 170 }}
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              <option value="">All Employment Types</option>
              <option value="full-time">Full-Time</option>
              <option value="part-time">Part-Time</option>
              <option value="internship">Internship</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
            </select>
          </div>

          {(user?.role === 'alumni' || user?.role === 'admin') && (
            <Link href="/jobs/create" className="btn btn-navy">
              + Share a Job Post
            </Link>
          )}
        </div>

        {/* Jobs List */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading job postings...
          </div>
        ) : jobs.length === 0 ? (
          <div className="card-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            No job opportunities found matching your criteria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {jobs.map(job => (
              <div key={job._id} className="card-panel" style={styles.jobCard}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <Link href={`/jobs/${job._id}`}>{job.title}</Link>
                    </h3>
                    <span className="badge badge-primary">{job.employmentType}</span>
                  </div>

                  <div style={{ color: 'var(--primary-blue)', fontSize: '0.95rem', fontWeight: 600, marginBottom: 8 }}>
                    🏢 {job.company} • 📍 {job.location || 'Remote'}
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: 12 }}>
                    {job.description.substring(0, 160)}{job.description.length > 160 ? '...' : ''}
                  </p>

                  {/* Required Skills */}
                  {job.skillsRequired && job.skillsRequired.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                      {job.skillsRequired.map(skill => (
                        <span key={skill} className="badge badge-info" style={{ textTransform: 'none', fontSize: '0.72rem' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Posted by {job.postedBy?.name || 'Alumnus'} • {timeAgo(job.createdAt)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  {job.salaryRange && (
                    <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success)' }}>
                      💰 {job.salaryRange}
                    </span>
                  )}
                  <Link href={`/jobs/${job._id}`} className="btn btn-secondary btn-sm" style={{ marginTop: 'auto' }}>
                    View & Apply →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  jobCard: {
    padding: 24,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
  },
};
