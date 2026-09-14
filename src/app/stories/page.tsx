'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

interface StoryItem {
  _id: string;
  title: string;
  story: string;
  profilePhoto: string;
  company: string;
  designation: string;
  graduationYear: number;
  category: string;
  author: {
    name: string;
    department: string;
  };
}

export default function StoriesPage() {
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stories')
      .then(res => res.json())
      .then(data => setStories(data.stories || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="section-padding">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px' }}>
          <span style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1.5px' }}>
            ALUMNI SPOTLIGHT
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '8px 0 12px' }}>
            Success Stories & Milestones
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Inspiring career journeys, startup founding stories, and achievements shared by our alumni network.
          </p>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
          <Link href={user ? '/stories/submit' : '/login'} className="btn btn-navy">
            ✍️ Share Your Story
          </Link>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading success stories...
          </div>
        ) : stories.length === 0 ? (
          <div className="card-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            No stories published yet. Be the first alumnus to submit your story!
          </div>
        ) : (
          <div className="grid-2">
            {stories.map(item => (
              <div key={item._id} className="card-panel" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.4rem', background: 'var(--primary-navy)' }}>
                    {item.profilePhoto ? (
                      <img src={item.profilePhoto} alt={item.author?.name} />
                    ) : (
                      (item.author?.name || 'A').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.author?.name}
                    </h4>
                    <div style={{ color: 'var(--primary-blue)', fontSize: '0.88rem', fontWeight: 600 }}>
                      {item.designation} {item.company ? `@ ${item.company}` : ''}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                      🎓 Class of {item.graduationYear}
                    </div>
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>
                    {item.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {item.story}
                  </p>
                </div>

                <div style={{ paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
                  <span className="badge badge-info">{item.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
