'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { calculateProfileCompletion } from '@/lib/utils';

interface ProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  currentCity?: string;
  currentCountry?: string;
  degree?: string;
  department?: string;
  graduationYear?: number;
  jobTitle?: string;
  company?: string;
  industry?: string;
  yearsOfExperience?: number;
  skills?: string[];
  profilePhoto?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

interface EventItem {
  _id: string;
  title: string;
  date: string;
  venue: string;
  eventType: string;
}

interface JobItem {
  _id: string;
  title: string;
  company: string;
  location: string;
  employmentType: string;
}

interface NotifItem {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      Promise.all([
        fetch('/api/profile').then(res => res.json()),
        fetch('/api/connections').then(res => res.json()),
        fetch('/api/events').then(res => res.json()),
        fetch('/api/jobs').then(res => res.json()),
        fetch('/api/notifications').then(res => res.json()),
      ])
        .then(([profData, connData, eventData, jobData, notifData]) => {
          setProfile(profData.profile || null);
          setConnectionsCount(connData.acceptedConnections?.length || 0);
          setEvents(eventData.events?.slice(0, 3) || []);
          setJobs(jobData.jobs?.slice(0, 4) || []);
          setNotifications(notifData.notifications?.slice(0, 4) || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</div>
      </div>
    );
  }

  if (!user) return null;

  const completionPercent = calculateProfileCompletion((profile as unknown) as Record<string, unknown>);

  return (
    <div className="section-padding">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Welcome Header */}
        <div className="card-panel" style={styles.welcomeCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.6rem', background: 'var(--primary-blue)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Welcome back, {user.name.split(' ')[0]}!
                </h1>
                <span className={`badge ${user.role === 'admin' ? 'badge-warning' : user.role === 'alumni' ? 'badge-primary' : 'badge-info'}`}>
                  {user.role}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                {user.department} • Class of {user.graduationYear} {user.currentLocation && `• ${user.currentLocation}`}
              </p>
            </div>
          </div>

          <div style={styles.completionBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: 8 }}>
              <span style={{ color: 'var(--text-primary)' }}>Profile Strength</span>
              <span style={{ color: 'var(--primary-blue)' }}>{completionPercent}%</span>
            </div>
            <div style={styles.progressTrack}>
              <div style={{ ...styles.progressBar, width: `${completionPercent}%` }} />
            </div>
            {completionPercent < 100 && (
              <Link href="/profile/edit" style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', marginTop: 6, display: 'inline-block', fontWeight: 600 }}>
                + Add missing profile fields
              </Link>
            )}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid-4">
          <div className="card-panel" style={styles.statBox}>
            <div style={{ fontSize: '1.8rem' }}>👥</div>
            <div>
              <div style={styles.statNum}>{connectionsCount}</div>
              <div style={styles.statLabel}>Connections</div>
            </div>
          </div>

          <div className="card-panel" style={styles.statBox}>
            <div style={{ fontSize: '1.8rem' }}>📅</div>
            <div>
              <div style={styles.statNum}>{events.length}</div>
              <div style={styles.statLabel}>Upcoming Events</div>
            </div>
          </div>

          <div className="card-panel" style={styles.statBox}>
            <div style={{ fontSize: '1.8rem' }}>💼</div>
            <div>
              <div style={styles.statNum}>{jobs.length}</div>
              <div style={styles.statLabel}>Recent Jobs</div>
            </div>
          </div>

          <div className="card-panel" style={styles.statBox}>
            <div style={{ fontSize: '1.8rem' }}>🔔</div>
            <div>
              <div style={styles.statNum}>{notifications.filter(n => !n.read).length}</div>
              <div style={styles.statLabel}>Unread Alerts</div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28 }}>
          {/* Left Column: Jobs & Events */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Jobs */}
            <div className="card-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recommended Job Opportunities</h3>
                <Link href="/jobs" style={{ fontSize: '0.85rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
                  View All Jobs →
                </Link>
              </div>

              {jobs.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No job postings available yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {jobs.map(job => (
                    <div key={job._id} style={styles.listItem}>
                      <div>
                        <Link href={`/jobs/${job._id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {job.title}
                        </Link>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          {job.company} • {job.location || 'Remote'}
                        </div>
                      </div>
                      <span className="badge badge-primary">{job.employmentType}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Events */}
            <div className="card-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Upcoming Events</h3>
                <Link href="/events" style={{ fontSize: '0.85rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
                  Explore Events →
                </Link>
              </div>

              {events.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No upcoming events scheduled.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {events.map(evt => (
                    <div key={evt._id} style={styles.listItem}>
                      <div>
                        <Link href={`/events/${evt._id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                          {evt.title}
                        </Link>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                          📍 {evt.venue || 'Online'} • 📅 {new Date(evt.date).toLocaleDateString()}
                        </div>
                      </div>
                      <span className="badge badge-info">{evt.eventType}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Actions & Alerts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Quick Actions */}
            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link href="/profile/edit" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                  ✏️ Edit Profile Information
                </Link>
                <Link href="/directory" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                  🔍 Search Alumni Directory
                </Link>
                {user.role === 'alumni' && (
                  <Link href="/jobs/create" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
                    ➕ Share Job Posting
                  </Link>
                )}
                <Link href="/mentorship" className="btn btn-secondary" style={{ justifyContent: 'flex-start' }}>
                  🤝 Mentorship Hub
                </Link>
              </div>
            </div>

            {/* Notifications Feed */}
            <div className="card-panel" style={{ padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Alerts</h3>
                <Link href="/notifications" style={{ fontSize: '0.8rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
                  View All
                </Link>
              </div>

              {notifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No notifications.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {notifications.map(notif => (
                    <div key={notif._id} style={{ fontSize: '0.85rem', paddingBottom: 10, borderBottom: '1px solid var(--card-border)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{notif.title}</div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{notif.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  welcomeCard: {
    padding: 28,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 24,
  },
  completionBox: {
    width: 240,
    background: 'var(--bg-muted)',
    padding: 16,
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--card-border)',
  },
  progressTrack: {
    width: '100%',
    height: 8,
    background: 'var(--card-border)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    background: 'var(--primary-blue)',
    borderRadius: 4,
    transition: 'var(--transition)',
  },
  statBox: {
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  statNum: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: 'var(--text-primary)',
  },
  statLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: 500,
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--bg-muted)',
    border: '1px solid var(--card-border)',
  },
};
