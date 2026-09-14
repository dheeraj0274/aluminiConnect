'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface UserObj {
  _id: string;
  name: string;
  email: string;
  role: string;
  graduationYear: number;
  department: string;
  currentLocation: string;
}

interface ConnectionItem {
  _id: string;
  requester: UserObj;
  recipient: UserObj;
  status: string;
  createdAt: string;
}

interface ProfileItem {
  _id: string;
  userId: UserObj;
  fullName: string;
  profilePhoto: string;
  jobTitle: string;
  company: string;
  department: string;
  graduationYear: number;
  skills: string[];
}

export default function NetworkPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'connections' | 'pending' | 'suggested'>('connections');
  const [acceptedConnections, setAcceptedConnections] = useState<ConnectionItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ConnectionItem[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<ConnectionItem[]>([]);
  const [suggestedProfiles, setSuggestedProfiles] = useState<ProfileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNetwork = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/connections');
      const data = await res.json();
      setAcceptedConnections(data.acceptedConnections || []);
      setIncomingRequests(data.incomingRequests || []);
      setOutgoingRequests(data.outgoingRequests || []);
      setSuggestedProfiles(data.suggestedProfiles || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchNetwork();
    }
  }, [user, authLoading, router, fetchNetwork]);

  const handleAccept = async (connectionId: string) => {
    try {
      await fetch('/api/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, action: 'accept' }),
      });
      fetchNetwork();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (connectionId: string) => {
    try {
      await fetch('/api/connections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId, action: 'reject' }),
      });
      fetchNetwork();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (connectionId: string) => {
    if (!confirm('Remove this connection?')) return;
    try {
      await fetch(`/api/connections?id=${connectionId}`, { method: 'DELETE' });
      fetchNetwork();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnectSuggested = async (recipientId: string) => {
    try {
      await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId }),
      });
      fetchNetwork();
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading network...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="section-padding">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 6 }}>
            Alumni Network & Connections
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Manage active connections, process incoming requests, and discover suggested department peers.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, borderBottom: '1px solid #E2E8F0', paddingBottom: 12 }}>
          <button
            onClick={() => setActiveTab('connections')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'connections' ? styles.activeTabBtn : {}),
            }}
          >
            👥 My Connections ({acceptedConnections.length})
          </button>

          <button
            onClick={() => setActiveTab('pending')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'pending' ? styles.activeTabBtn : {}),
            }}
          >
            ⏳ Pending Requests ({incomingRequests.length})
          </button>

          <button
            onClick={() => setActiveTab('suggested')}
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'suggested' ? styles.activeTabBtn : {}),
            }}
          >
            ✨ Suggested Peers ({suggestedProfiles.length})
          </button>
        </div>

        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div>
            {acceptedConnections.length === 0 ? (
              <div className="card-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                You have no active connections yet. Browse the suggested alumni or directory to connect!
              </div>
            ) : (
              <div className="grid-3">
                {acceptedConnections.map(conn => {
                  const other = conn.requester._id === user.id ? conn.recipient : conn.requester;
                  return (
                    <div key={conn._id} className="card-panel" style={styles.personCard}>
                      <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.4rem', background: 'var(--primary-navy)' }}>
                        {other.name.charAt(0).toUpperCase()}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{other.name}</h3>
                      <p style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
                        {other.department} ({other.graduationYear})
                      </p>

                      <div style={{ display: 'flex', gap: 8, marginTop: 12, width: '100%' }}>
                        <Link href={`/profile/${other._id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                          View Profile
                        </Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleRemove(conn._id)}>
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pending Tab */}
        {activeTab === 'pending' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>
                Incoming Requests ({incomingRequests.length})
              </h3>
              {incomingRequests.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No incoming connection requests.</p>
              ) : (
                <div className="grid-2">
                  {incomingRequests.map(req => (
                    <div key={req._id} className="card-panel" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Link href={`/profile/${req.requester._id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                          {req.requester.name}
                        </Link>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
                          {req.requester.department} • Class of {req.requester.graduationYear}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleAccept(req._id)}>
                          Accept
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleReject(req._id)}>
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ paddingTop: 20, borderTop: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>
                Outgoing Requests ({outgoingRequests.length})
              </h3>
              {outgoingRequests.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No pending outgoing requests.</p>
              ) : (
                <div className="grid-2">
                  {outgoingRequests.map(req => (
                    <div key={req._id} className="card-panel" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Link href={`/profile/${req.recipient._id}`} style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                          {req.recipient.name}
                        </Link>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
                          {req.recipient.department} • Class of {req.recipient.graduationYear}
                        </div>
                      </div>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleRemove(req._id)}>
                        Cancel Request
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Suggested Tab */}
        {activeTab === 'suggested' && (
          <div>
            {suggestedProfiles.length === 0 ? (
              <div className="card-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                No new suggestions right now. Explore the full alumni directory!
              </div>
            ) : (
              <div className="grid-3">
                {suggestedProfiles.map(prof => {
                  const uObj = prof.userId || {};
                  return (
                    <div key={prof._id} className="card-panel" style={styles.personCard}>
                      <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.4rem', background: 'var(--primary-navy)' }}>
                        {(prof.fullName || uObj.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{prof.fullName || uObj.name}</h3>
                      <p style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
                        {prof.jobTitle || uObj.department} {prof.company ? `@ ${prof.company}` : ''}
                      </p>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                        🎓 Class of {prof.graduationYear || uObj.graduationYear}
                      </div>

                      <button
                        className="btn btn-navy btn-sm"
                        style={{ marginTop: 12, width: '100%' }}
                        onClick={() => handleConnectSuggested(uObj._id)}
                      >
                        🤝 Connect Request
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
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
  personCard: {
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
  },
};
