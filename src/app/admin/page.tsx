'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';

interface AdminStats {
  totalUsers: number;
  totalAlumni: number;
  totalStudents: number;
  totalEvents: number;
  totalJobs: number;
  totalStories: number;
  totalConnections: number;
  pendingStories: number;
  totalCompanies: number;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  graduationYear: number;
  department: string;
  isActive: boolean;
  company: string;
  jobTitle: string;
}

interface JobItem {
  _id: string;
  title: string;
  company: string;
  status: string;
  postedBy: { name: string };
  createdAt: string;
}

interface StoryItem {
  _id: string;
  title: string;
  status: string;
  published: boolean;
  author: { name: string };
  createdAt: string;
}

interface AnnouncementItem {
  _id: string;
  title: string;
  category: string;
  published: boolean;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'jobs' | 'stories' | 'announcements'>('stats');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [jobsList, setJobsList] = useState<JobItem[]>([]);
  const [storiesList, setStoriesList] = useState<StoryItem[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // New Announcement Form State
  const [newAnn, setNewAnn] = useState({ title: '', description: '', category: 'general' });
  const [annSubmitting, setAnnSubmitting] = useState(false);

  const fetchSectionData = useCallback(async (section: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?section=${section}`);
      const data = await res.json();
      if (res.ok) {
        if (section === 'stats') setStats(data.stats);
        if (section === 'users') setUsersList(data.users || []);
        if (section === 'jobs') setJobsList(data.jobs || []);
        if (section === 'stories') setStoriesList(data.stories || []);
        if (section === 'announcements') setAnnouncementsList(data.announcements || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/dashboard');
      return;
    }

    if (user && user.role === 'admin') {
      fetchSectionData(activeTab);
    }
  }, [user, authLoading, activeTab, router, fetchSectionData]);

  // Admin Actions
  const handleUserToggleActive = async (userId: string) => {
    await fetch('/api/admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'user', id: userId, action: 'toggle-active' }),
    });
    fetchSectionData('users');
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    await fetch('/api/admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'user', id: userId, action: 'change-role', data: { role: newRole } }),
    });
    fetchSectionData('users');
  };

  const handleUserDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    await fetch(`/api/admin?target=user&id=${userId}`, { method: 'DELETE' });
    fetchSectionData('users');
  };

  const handleStoryAction = async (storyId: string, action: string) => {
    await fetch('/api/admin', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'story', id: storyId, action }),
    });
    fetchSectionData('stories');
  };

  const handleStoryDelete = async (storyId: string) => {
    if (!confirm('Delete this story?')) return;
    await fetch(`/api/admin?target=story&id=${storyId}`, { method: 'DELETE' });
    fetchSectionData('stories');
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnnSubmitting(true);
    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnn),
      });
      setNewAnn({ title: '', description: '', category: 'general' });
      fetchSectionData('announcements');
    } catch (err) {
      console.error(err);
    } finally {
      setAnnSubmitting(false);
    }
  };

  const handleAnnDelete = async (annId: string) => {
    if (!confirm('Delete this announcement?')) return;
    await fetch(`/api/admin?target=announcement&id=${annId}`, { method: 'DELETE' });
    fetchSectionData('announcements');
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="section-padding">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <div style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1.5px' }}>
              INSTITUTIONAL ADMINISTRATION
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '4px 0' }}>
              Portal Control Center
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Manage accounts, moderate story submissions, publish announcements, and review portal analytics.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28, borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
          {[
            { id: 'stats', label: '📊 System Overview' },
            { id: 'users', label: '👥 User Accounts' },
            { id: 'stories', label: `📖 Moderation Queue ${stats?.pendingStories ? `(${stats.pendingStories})` : ''}` },
            { id: 'jobs', label: '💼 Job Openings' },
            { id: 'announcements', label: '📢 Announcements' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: activeTab === tab.id ? 'var(--primary-blue)' : 'var(--text-secondary)',
                background: activeTab === tab.id ? 'var(--light-blue)' : 'transparent',
                border: activeTab === tab.id ? '1px solid #d0e1f4' : '1px solid transparent',
                transition: 'var(--transition)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Section 1: Stats */}
        {activeTab === 'stats' && stats && (
          <div className="grid-4">
            <div className="card-panel" style={styles.statCard}>
              <div style={styles.statVal}>{stats.totalUsers}</div>
              <div style={styles.statLbl}>Total Registered Users</div>
            </div>
            <div className="card-panel" style={styles.statCard}>
              <div style={styles.statVal}>{stats.totalAlumni}</div>
              <div style={styles.statLbl}>Graduated Alumni</div>
            </div>
            <div className="card-panel" style={styles.statCard}>
              <div style={styles.statVal}>{stats.totalStudents}</div>
              <div style={styles.statLbl}>Active Students</div>
            </div>
            <div className="card-panel" style={styles.statCard}>
              <div style={styles.statVal}>{stats.totalConnections}</div>
              <div style={styles.statLbl}>Active Connections</div>
            </div>
            <div className="card-panel" style={styles.statCard}>
              <div style={styles.statVal}>{stats.totalJobs}</div>
              <div style={styles.statLbl}>Job Opportunities</div>
            </div>
            <div className="card-panel" style={styles.statCard}>
              <div style={styles.statVal}>{stats.totalEvents}</div>
              <div style={styles.statLbl}>Events Scheduled</div>
            </div>
            <div className="card-panel" style={styles.statCard}>
              <div style={styles.statVal}>{stats.pendingStories}</div>
              <div style={styles.statLbl}>Stories Pending Review</div>
            </div>
            <div className="card-panel" style={styles.statCard}>
              <div style={styles.statVal}>{stats.totalCompanies}</div>
              <div style={styles.statLbl}>Represented Companies</div>
            </div>
          </div>
        )}

        {/* Content Section 2: Users Management */}
        {activeTab === 'users' && (
          <div className="card-panel" style={{ padding: 24, overflowX: 'auto' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>
              User Accounts ({usersList.length})
            </h3>
            {loading ? (
              <div>Loading users...</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeadRow}>
                    <th style={styles.th}>Name & Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Dept & Year</th>
                    <th style={styles.th}>Company</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => (
                    <tr key={u.id} style={styles.tableRow}>
                      <td style={styles.td}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td style={styles.td}>
                        <select
                          className="form-select"
                          value={u.role}
                          onChange={e => handleUserRoleChange(u.id, e.target.value)}
                          style={{ padding: '4px 8px', fontSize: '0.82rem' }}
                        >
                          <option value="alumni">Alumni</option>
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={styles.td}>
                        {u.department} ({u.graduationYear})
                      </td>
                      <td style={styles.td}>
                        {u.company || '—'}
                      </td>
                      <td style={styles.td}>
                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-warning'}`}>
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleUserToggleActive(u.id)}
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          >
                            {u.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleUserDelete(u.id)}
                            style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Content Section 3: Story Moderation */}
        {activeTab === 'stories' && (
          <div className="card-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>
              Submitted Alumni Stories ({storiesList.length})
            </h3>
            {storiesList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No stories submitted for review.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {storiesList.map(st => (
                  <div key={st._id} style={{ padding: 16, background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{st.title}</h4>
                        <span className={`badge ${st.status === 'approved' ? 'badge-success' : st.status === 'rejected' ? 'badge-warning' : 'badge-primary'}`}>
                          {st.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        By {st.author?.name || 'Alumnus'} • {formatDate(st.createdAt)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      {st.status !== 'approved' && (
                        <button className="btn btn-navy btn-sm" onClick={() => handleStoryAction(st._id, 'approve')}>
                          ✓ Approve & Publish
                        </button>
                      )}
                      {st.status !== 'rejected' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleStoryAction(st._id, 'reject')}>
                          Reject
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleStoryDelete(st._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content Section 4: Jobs */}
        {activeTab === 'jobs' && (
          <div className="card-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>
              Job Opportunities ({jobsList.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {jobsList.map(j => (
                <div key={j._id} style={{ padding: 16, background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{j.title}</h4>
                    <div style={{ color: 'var(--primary-blue)', fontSize: '0.88rem' }}>
                      {j.company} • Posted by {j.postedBy?.name || 'User'}
                    </div>
                  </div>
                  <span className="badge badge-primary">{j.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Section 5: Announcements */}
        {activeTab === 'announcements' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>
                ➕ Create & Publish Announcement
              </h3>
              <form onSubmit={handleCreateAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      placeholder="Annual Alumni Meet 2026 Announced"
                      value={newAnn.title}
                      onChange={e => setNewAnn({ ...newAnn, title: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={newAnn.category}
                      onChange={e => setNewAnn({ ...newAnn, category: e.target.value })}
                    >
                      <option value="college-news">College News</option>
                      <option value="alumni-news">Alumni News</option>
                      <option value="events">Events</option>
                      <option value="career">Career</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Content / Description</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    required
                    placeholder="Announcement details..."
                    value={newAnn.description}
                    onChange={e => setNewAnn({ ...newAnn, description: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-navy" style={{ width: 'fit-content' }} disabled={annSubmitting}>
                  {annSubmitting ? 'Publishing...' : 'Publish Announcement'}
                </button>
              </form>
            </div>

            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>
                Published Announcements ({announcementsList.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {announcementsList.map(a => (
                  <div key={a._id} style={{ padding: 16, background: '#F8FAFC', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{a.title}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Category: {a.category} • Date: {formatDate(a.createdAt)}
                      </div>
                    </div>

                    <button className="btn btn-danger btn-sm" onClick={() => handleAnnDelete(a._id)}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  statCard: {
    padding: 20,
    textAlign: 'center',
  },
  statVal: {
    fontSize: '2rem',
    fontWeight: 800,
    color: 'var(--primary-navy)',
  },
  statLbl: {
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    marginTop: 4,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
  },
  tableHeadRow: {
    borderBottom: '1px solid #E2E8F0',
    textAlign: 'left',
    background: '#F8FAFC',
  },
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--card-border)',
    background: 'var(--bg-muted)',
    whiteSpace: 'nowrap',
  },
  tableRow: {
    borderBottom: '1px solid #E2E8F0',
  },
  td: {
    padding: '12px 16px',
    fontSize: '0.88rem',
    color: 'var(--text-primary)',
    borderBottom: '1px solid var(--card-border)',
  },
};
