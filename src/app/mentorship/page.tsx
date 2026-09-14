'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface MentorProfile {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
    graduationYear: number;
    department: string;
  };
  fullName: string;
  jobTitle: string;
  company: string;
  profilePhoto: string;
  mentorshipAreas: string[];
  bio: string;
}

interface RequestItem {
  _id: string;
  mentor: {
    _id: string;
    name: string;
    email: string;
    department: string;
  };
  mentee: {
    _id: string;
    name: string;
    email: string;
    department: string;
  };
  areas: string[];
  message: string;
  status: string;
  createdAt: string;
}

export default function MentorshipPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'mentors' | 'requests'>('mentors');
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMentors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mentorship?view=available');
      const data = await res.json();
      setMentors(data.mentors || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/mentorship');
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchMentors();
    if (user) {
      fetchRequests();
    }
  }, [user, fetchMentors, fetchRequests]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !requestMsg.trim() || submitting) return;

    if (!user) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/mentorship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: selectedMentor.userId._id,
          message: requestMsg.trim(),
          areas: selectedMentor.mentorshipAreas,
        }),
      });

      if (res.ok) {
        setSelectedMentor(null);
        setRequestMsg('');
        fetchRequests();
        setActiveTab('requests');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: string) => {
    try {
      await fetch('/api/mentorship', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, status }),
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading) return null;

  return (
    <div className="section-padding">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px' }}>
          <span style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1.5px' }}>
            CAREER GUIDANCE HUB
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '8px 0 12px' }}>
            1-on-1 Alumni Mentorship
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Connect with experienced alumni mentors for career coaching, resume reviews, and technical mock interviews.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
          <button
            onClick={() => setActiveTab('mentors')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'mentors' ? styles.activeTabBtn : {}),
            }}
          >
            🎓 Available Mentors ({mentors.length})
          </button>

          {user && (
            <button
              onClick={() => setActiveTab('requests')}
              style={{
                ...styles.tabBtn,
                ...(activeTab === 'requests' ? styles.activeTabBtn : {}),
              }}
            >
              📋 My Requests ({requests.length})
            </button>
          )}
        </div>

        {/* Available Mentors Tab */}
        {activeTab === 'mentors' && (
          <div>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading mentors...
              </div>
            ) : mentors.length === 0 ? (
              <div className="card-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                No mentors available currently. If you are an alumnus, update your profile to offer mentorship!
              </div>
            ) : (
              <div className="grid-3">
                {mentors.map(mentor => {
                  const uObj = mentor.userId || {};
                  const name = mentor.fullName || uObj.name || 'Alumnus';

                  return (
                    <div key={mentor._id} className="card-panel" style={styles.card}>
                      <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.6rem', background: 'var(--primary-navy)' }}>
                        {mentor.profilePhoto ? (
                          <img src={mentor.profilePhoto} alt={name} />
                        ) : (
                          name.charAt(0).toUpperCase()
                        )}
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{name}</h3>
                      <div style={{ color: 'var(--primary-blue)', fontSize: '0.9rem', fontWeight: 600 }}>
                        {mentor.jobTitle || 'Professional'} {mentor.company ? `@ ${mentor.company}` : ''}
                      </div>

                      <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        🎓 {uObj.department} ({uObj.graduationYear})
                      </div>

                      {/* Mentorship Areas */}
                      {mentor.mentorshipAreas && mentor.mentorshipAreas.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
                          {mentor.mentorshipAreas.map(area => (
                            <span key={area} className="badge badge-primary" style={{ textTransform: 'none', fontSize: '0.72rem' }}>
                              {area}
                            </span>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: 'auto', paddingTop: 16, width: '100%' }}>
                        <button className="btn btn-navy btn-sm" style={{ width: '100%' }} onClick={() => setSelectedMentor(mentor)}>
                          🤝 Request Mentorship
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'requests' && user && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {requests.length === 0 ? (
              <div className="card-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                You have no active mentorship requests.
              </div>
            ) : (
              requests.map(req => {
                const isMentor = req.mentor._id === user.id;
                const other = isMentor ? req.mentee : req.mentor;

                return (
                  <div key={req._id} className="card-panel" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {isMentor ? `Mentee: ${other.name}` : `Mentor: ${other.name}`}
                        </h4>
                        <span className={`badge ${req.status === 'accepted' ? 'badge-success' : req.status === 'requested' ? 'badge-warning' : 'badge-primary'}`}>
                          {req.status}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
                        &quot;{req.message}&quot;
                      </p>
                    </div>

                    {isMentor && req.status === 'requested' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(req._id, 'accepted')}>
                          Accept Mentorship
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(req._id, 'rejected')}>
                          Decline
                        </button>
                      </div>
                    )}

                    {req.status === 'accepted' && (
                      <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateStatus(req._id, 'completed')}>
                        Mark Completed
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Mentorship Request Modal */}
        {selectedMentor && (
          <div style={styles.modalOverlay}>
            <div className="card-panel" style={styles.modalContent}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 6 }}>
                Request Mentorship from {selectedMentor.fullName || selectedMentor.userId.name}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 16 }}>
                Explain what guidance or topics you are seeking help with.
              </p>

              <form onSubmit={handleSendRequest}>
                <div className="form-group">
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Hi! I am interested in software engineering roles. I would love your guidance on resume reviews and interview preparation..."
                    required
                    value={requestMsg}
                    onChange={e => setRequestMsg(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 16 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedMentor(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-navy" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tabBtn: {
    padding: '8px 16px',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--text-secondary)',
    fontSize: '0.92rem',
    fontWeight: 600,
    background: 'transparent',
    transition: 'var(--transition)',
  },
  activeTabBtn: {
    background: 'var(--light-blue)',
    color: 'var(--primary-blue)',
  },
  card: {
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(11, 31, 56, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 200,
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    padding: 28,
  },
};
