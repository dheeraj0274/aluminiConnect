'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';

interface EventDetail {
  _id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  eventType: string;
  meetingLink: string;
  registeredCount: number;
  maxParticipants: number;
  status: string;
  organizer: {
    name: string;
    email: string;
    department: string;
  };
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events?id=${eventId}`);
      const data = await res.json();
      if (res.ok) {
        setEvent(data.event);
        setIsRegistered(!!data.isRegistered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const handleRegister = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/events/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });

      if (res.ok) {
        setIsRegistered(true);
        fetchEvent();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRegistration = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/events/register?eventId=${eventId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setIsRegistered(false);
        fetchEvent();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading event details...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="section-padding" style={{ textAlign: 'center' }}>
        <h2>Event Not Found</h2>
        <Link href="/events" className="btn btn-secondary" style={{ marginTop: 16 }}>
          Return to Events
        </Link>
      </div>
    );
  }

  const isFull = event.registeredCount >= event.maxParticipants;

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: 840 }}>
        <Link href="/events" className="btn btn-secondary btn-sm" style={{ marginBottom: 20 }}>
          ← Back to All Events
        </Link>

        <div className="card-panel" style={{ padding: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span className="badge badge-primary">{event.eventType}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Organized by {event.organizer?.name || 'Alumni Committee'}
            </span>
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 16 }}>
            {event.title}
          </h1>

          {/* Event Quick Meta Bar */}
          <div style={styles.metaBar}>
            <div>
              <div style={styles.metaLabel}>DATE & TIME</div>
              <div style={styles.metaVal}>📅 {formatDate(event.date)} ({event.startTime} - {event.endTime})</div>
            </div>
            <div>
              <div style={styles.metaLabel}>LOCATION / VENUE</div>
              <div style={styles.metaVal}>📍 {event.venue || 'Online Event'}</div>
            </div>
            <div>
              <div style={styles.metaLabel}>ATTENDEES</div>
              <div style={styles.metaVal}>👥 {event.registeredCount}/{event.maxParticipants} Registered</div>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 12 }}>About This Event</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {event.description}
            </p>
          </div>

          {/* Meeting Link for registered online users */}
          {isRegistered && event.meetingLink && (
            <div style={{ padding: 16, background: 'var(--light-blue)', border: '1px solid var(--primary-blue)', borderRadius: 'var(--radius-sm)', marginBottom: 24 }}>
              <div style={{ fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 4 }}>🔗 Online Joining Link:</div>
              <a href={event.meetingLink} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', wordBreak: 'break-all', fontWeight: 600 }}>
                {event.meetingLink}
              </a>
            </div>
          )}

          {/* Action Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid #E2E8F0' }}>
            <div>
              {isRegistered ? (
                <span style={{ color: 'var(--success)', fontWeight: 600, fontSize: '0.95rem' }}>
                  ✓ You are registered for this event
                </span>
              ) : isFull ? (
                <span style={{ color: 'var(--error)', fontWeight: 600, fontSize: '0.95rem' }}>
                  ⚠️ Event is fully booked
                </span>
              ) : (
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Registration open to all alumni and students
                </span>
              )}
            </div>

            <div>
              {isRegistered ? (
                <button className="btn btn-danger" onClick={handleCancelRegistration} disabled={actionLoading}>
                  {actionLoading ? 'Cancelling...' : 'Cancel Registration'}
                </button>
              ) : (
                <button className="btn btn-navy" onClick={handleRegister} disabled={actionLoading || isFull}>
                  {actionLoading ? 'Registering...' : 'Register for Event'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  metaBar: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16,
    padding: 20,
    background: '#F8FAFC',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid #E2E8F0',
    marginBottom: 28,
  },
  metaLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    letterSpacing: '0.5px',
    marginBottom: 4,
  },
  metaVal: {
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
};
