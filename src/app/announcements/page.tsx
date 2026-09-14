'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { formatDate } from '@/lib/utils';

interface AnnouncementItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  author: {
    name: string;
  };
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { key: '', label: 'All Categories' },
    { key: 'college-news', label: 'College News' },
    { key: 'alumni-news', label: 'Alumni News' },
    { key: 'events', label: 'Events' },
    { key: 'career', label: 'Career Updates' },
    { key: 'general', label: 'General' },
  ];

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedCategory
        ? `/api/announcements?category=${selectedCategory}`
        : '/api/announcements';
      const res = await fetch(url);
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px' }}>
          <span style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1.5px' }}>
            CAMPUS BULLETIN
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '8px 0 12px' }}>
            Official Announcements & News
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Stay updated with academic news, campus developments, research breakthroughs, and alumni achievements.
          </p>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: 600,
                background: selectedCategory === cat.key ? 'var(--primary-navy)' : '#FFFFFF',
                color: selectedCategory === cat.key ? '#FFFFFF' : 'var(--text-secondary)',
                border: '1px solid #E2E8F0',
                transition: 'var(--transition)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Announcements List */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading announcements...
          </div>
        ) : announcements.length === 0 ? (
          <div className="card-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            No announcements in this category yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {announcements.map(item => (
              <div key={item._id} className="card-panel" style={{ padding: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span className="badge badge-primary">{item.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    📅 {formatDate(item.date)}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 10 }}>
                  {item.title}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.96rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {item.description}
                </p>

                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #E2E8F0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Posted by {item.author?.name || 'College Administration'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
