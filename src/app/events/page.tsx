'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';

interface EventItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  eventType: string;
  registeredCount: number;
  maxParticipants: number;
  status: string;
  organizer: {
    name: string;
    department: string;
  };
}

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedType) params.append('eventType', selectedType);

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data.events || []);
      setRegisteredIds(data.registeredEventIds || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className="section-padding">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px' }}>
          <span style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1.5px' }}>
            CAMPUS & GLOBAL REUNIONS
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '8px 0 12px' }}>
            Upcoming Events & Summits
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Participate in annual reunions, technical summits, and career workshops.
          </p>
        </div>

        {/* Filter & Action Bar */}
        <div className="card-panel" style={{ padding: 16, marginBottom: 32, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flex: 1, flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search events by title, venue..."
              style={{ flex: 1, minWidth: 240 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <select
              className="form-select"
              style={{ width: 160 }}
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              <option value="">All Event Types</option>
              <option value="online">Online / Virtual</option>
              <option value="offline">Offline / In-Person</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {(user?.role === 'alumni' || user?.role === 'admin') && (
            <Link href="/admin/events" className="btn btn-navy">
              + Host Event
            </Link>
          )}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="card-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            No upcoming events match your search criteria.
          </div>
        ) : (
          <div className="grid-3">
            {events.map(event => {
              const isRegistered = registeredIds.includes(event._id);
              return (
                <div key={event._id} className="card-panel" style={styles.card}>
                  <div style={styles.cardHeader}>
                    <span className={`badge ${event.eventType === 'online' ? 'badge-info' : 'badge-primary'}`}>
                      {event.eventType}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      👥 {event.registeredCount}/{event.maxParticipants} Seats
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', margin: '8px 0' }}>
                    {event.title}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5, flex: 1 }}>
                    {event.description.substring(0, 120)}{event.description.length > 120 ? '...' : ''}
                  </p>

                  <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 4, marginTop: 12 }}>
                    <div>📅 {formatDate(event.date)} ({event.startTime} - {event.endTime})</div>
                    <div>📍 {event.venue || 'Online Event'}</div>
                  </div>

                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isRegistered && <span className="badge badge-success">✓ Registered</span>}
                    <Link href={`/events/${event._id}`} className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }}>
                      Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: 24,
    display: 'flex',
    flexDirection: 'column',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
};
