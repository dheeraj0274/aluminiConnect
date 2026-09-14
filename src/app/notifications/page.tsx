'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { timeAgo } from '@/lib/utils';

interface NotifItem {
  _id: string;
  title: string;
  message: string;
  type: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchNotifications();
    }
  }, [user, authLoading, router]);

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (notificationId: string, link?: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      });
      fetchNotifications();
      if (link) {
        router.push(link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading notifications...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: 760 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 4 }}>
              Notifications & Activity
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Stay updated on connection requests, messages, job postings, and event reminders.
            </p>
          </div>

          {notifications.some(n => !n.read) && (
            <button className="btn btn-secondary btn-sm" onClick={handleMarkAllRead}>
              ✓ Mark All Read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="card-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            No notifications available.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {notifications.map(n => (
              <div
                key={n._id}
                className="card-panel"
                style={{
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: n.read ? '#FFFFFF' : 'var(--light-blue)',
                  borderLeft: n.read ? '1px solid #E2E8F0' : '4px solid var(--primary-blue)',
                  cursor: n.link ? 'pointer' : 'default',
                }}
                onClick={() => handleMarkAsRead(n._id, n.link)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{n.title}</span>
                    {!n.read && <span className="badge badge-primary">New</span>}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{n.message}</p>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>

                {n.link && (
                  <span style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
                    View →
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
