'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { timeAgo } from '@/lib/utils';

interface ConversationItem {
  id: string;
  otherUser: {
    id: string;
    name: string;
    role: string;
    department: string;
    profilePhoto: string;
    jobTitle: string;
    company: string;
  } | null;
  lastMessage: string;
  updatedAt: string;
}

export default function MessagesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetch('/api/conversations')
        .then(res => res.json())
        .then(data => setConversations(data.conversations || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading conversations...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: 6 }}>
            Direct Messages
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Communicate securely with connected alumni and network peers.
          </p>
        </div>

        {conversations.length === 0 ? (
          <div className="card-panel" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>💬</div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: 8 }}>No active conversations</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 20 }}>
              Start chatting by viewing a connected alumnus&apos; profile or checking your connections list.
            </p>
            <Link href="/network" className="btn btn-navy">
              Go to My Connections
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {conversations.map(conv => {
              const other = conv.otherUser;
              if (!other) return null;

              return (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <div className="card-panel" style={styles.convCard}>
                    <div className="avatar" style={{ width: 52, height: 52, fontSize: '1.3rem', background: 'var(--primary-navy)' }}>
                      {other.profilePhoto ? (
                        <img src={other.profilePhoto} alt={other.name} />
                      ) : (
                        other.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{other.name}</h3>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {timeAgo(conv.updatedAt)}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.84rem', color: 'var(--primary-blue)', fontWeight: 600 }}>
                        {other.jobTitle ? `${other.jobTitle} ${other.company ? `@ ${other.company}` : ''}` : other.department}
                      </div>

                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {conv.lastMessage || 'No messages yet...'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  convCard: {
    padding: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    transition: 'var(--transition)',
  },
};
