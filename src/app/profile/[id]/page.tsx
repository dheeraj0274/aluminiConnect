'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface UserDetail {
  _id: string;
  name: string;
  email: string;
  role: string;
  graduationYear: number;
  department: string;
  currentLocation: string;
}

interface ProfileDetail {
  _id: string;
  userId: UserDetail;
  fullName: string;
  profilePhoto: string;
  email: string;
  phone: string;
  graduationYear: number;
  department: string;
  currentCity: string;
  currentCountry: string;
  jobTitle: string;
  company: string;
  industry: string;
  yearsOfExperience: number;
  skills: string[];
  linkedIn: string;
  github: string;
  portfolio: string;
  degree: string;
  bio: string;
  availableForMentorship: boolean;
  mentorshipAreas: string[];
}

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: targetUserId } = use(params);
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [connectionState, setConnectionState] = useState<'not_connected' | 'pending_sent' | 'pending_received' | 'connected'>('not_connected');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/profile?userId=${targetUserId}`).then(res => res.json()),
      currentUser ? fetch('/api/connections').then(res => res.json()) : Promise.resolve({}),
    ])
      .then(([profData, connData]) => {
        setProfile(profData.profile || null);

        if (connData.acceptedConnections) {
          const accepted = connData.acceptedConnections.some(
            (c: { requester: { _id: string }; recipient: { _id: string } }) =>
              c.requester._id === targetUserId || c.recipient._id === targetUserId
          );
          if (accepted) {
            setConnectionState('connected');
            return;
          }

          const sent = connData.outgoingRequests?.some(
            (c: { recipient: { _id: string } }) => c.recipient._id === targetUserId
          );
          if (sent) {
            setConnectionState('pending_sent');
            return;
          }

          const rec = connData.incomingRequests?.some(
            (c: { requester: { _id: string } }) => c.requester._id === targetUserId
          );
          if (rec) {
            setConnectionState('pending_received');
            return;
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [targetUserId, currentUser]);

  const handleConnect = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/connections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: targetUserId }),
      });

      if (res.ok) {
        setConnectionState('pending_sent');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: targetUserId }),
      });

      const data = await res.json();
      if (res.ok && data.conversationId) {
        router.push(`/messages/${data.conversationId}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="section-padding" style={{ textAlign: 'center' }}>
        <h2>Profile Not Found</h2>
        <Link href="/directory" className="btn btn-secondary" style={{ marginTop: 16 }}>
          Return to Directory
        </Link>
      </div>
    );
  }

  const u = profile.userId || {};
  const isOwnProfile = currentUser?.id === targetUserId;

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Header Card */}
        <div className="card-panel" style={{ padding: 32, marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="avatar" style={{ width: 88, height: 88, fontSize: '2.2rem', background: 'var(--primary-navy)' }}>
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt={profile.fullName || u.name} />
              ) : (
                (profile.fullName || u.name || 'A').charAt(0).toUpperCase()
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)' }}>
                  {profile.fullName || u.name}
                </h1>
                <span className="badge badge-primary">{u.role}</span>
                {profile.availableForMentorship && (
                  <span className="badge badge-success">Available Mentor</span>
                )}
              </div>

              <div style={{ color: 'var(--primary-blue)', fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>
                {profile.jobTitle || 'Professional'} {profile.company ? `@ ${profile.company}` : ''}
              </div>

              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                🎓 {profile.department || u.department} ({profile.graduationYear || u.graduationYear})
              </div>

              {(profile.currentCity || profile.currentCountry || u.currentLocation) && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
                  📍 {[profile.currentCity || u.currentLocation, profile.currentCountry].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {!isOwnProfile && currentUser && (
              <div style={{ display: 'flex', gap: 10 }}>
                {connectionState === 'connected' ? (
                  <>
                    <button className="btn btn-secondary btn-sm" disabled>
                      ✓ Connected
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={handleMessage}>
                      💬 Message
                    </button>
                  </>
                ) : connectionState === 'pending_sent' ? (
                  <button className="btn btn-secondary btn-sm" disabled>
                    ⏳ Request Sent
                  </button>
                ) : connectionState === 'pending_received' ? (
                  <Link href="/network" className="btn btn-primary btn-sm">
                    Respond to Request
                  </Link>
                ) : (
                  <button className="btn btn-navy btn-sm" onClick={handleConnect} disabled={actionLoading}>
                    {actionLoading ? 'Connecting...' : '🤝 Connect Request'}
                  </button>
                )}
              </div>
            )}

            {isOwnProfile && (
              <Link href="/profile/edit" className="btn btn-navy btn-sm">
                ✏️ Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 12 }}>About</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {profile.bio || 'No bio specified.'}
              </p>
            </div>

            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 16 }}>Professional Experience</h3>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{profile.jobTitle || 'Professional'}</div>
                <div style={{ color: 'var(--primary-blue)', fontSize: '0.9rem', fontWeight: 600 }}>{profile.company || 'N/A'}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                  Industry: {profile.industry || 'N/A'} • Experience: {profile.yearsOfExperience || 0} years
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 14 }}>Skills</h3>
              {profile.skills && profile.skills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {profile.skills.map(s => (
                    <span key={s} className="badge badge-primary" style={{ textTransform: 'none' }}>
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No skills listed.</p>
              )}
            </div>

            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 14 }}>Links</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem' }}>
                {profile.linkedIn && (
                  <a href={profile.linkedIn} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                    🔗 LinkedIn
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                    💻 GitHub
                  </a>
                )}
                {profile.portfolio && (
                  <a href={profile.portfolio} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                    🌐 Portfolio
                  </a>
                )}
                {!profile.linkedIn && !profile.github && !profile.portfolio && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No links listed.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
