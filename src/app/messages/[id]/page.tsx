'use client';

import React, { useEffect, useState, useRef, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { formatDateTime } from '@/lib/utils';

interface MessageItem {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  createdAt: string;
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: conversationId } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
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
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user, authLoading, conversationId, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content: text.trim() }),
      });

      if (res.ok) {
        setText('');
        fetchMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading chat...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="section-padding" style={{ paddingBottom: 20 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Link href="/messages" className="btn btn-secondary btn-sm">
            ← Back to Conversations
          </Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)' }}>Direct Chat</h2>
        </div>

        {/* Chat Window Container */}
        <div className="card-panel" style={styles.chatBox}>
          {/* Message Log */}
          <div style={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
                No messages yet. Send a greeting to start the conversation!
              </div>
            ) : (
              messages.map(msg => {
                const isMine = msg.sender._id === user.id;
                return (
                  <div
                    key={msg._id}
                    style={{
                      ...styles.msgBubbleWrapper,
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                    }}
                  >
                    {!isMine && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>
                        {msg.sender.name}
                      </span>
                    )}
                    <div
                      style={{
                        ...styles.msgBubble,
                        ...(isMine ? styles.msgBubbleMine : styles.msgBubbleOther),
                      }}
                    >
                      {msg.content}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {formatDateTime(msg.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input Bar */}
          <form onSubmit={handleSend} style={styles.inputForm}>
            <input
              type="text"
              className="form-input"
              placeholder="Type your message..."
              value={text}
              onChange={e => setText(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={sending || !text.trim()}>
              {sending ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  chatBox: {
    height: '65vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  messagesContainer: {
    flex: 1,
    padding: 24,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    background: '#F8FAFC',
  },
  msgBubbleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '70%',
  },
  msgBubble: {
    padding: '10px 16px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.92rem',
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  msgBubbleMine: {
    background: 'var(--primary-blue)',
    color: '#ffffff',
    borderBottomRightRadius: 2,
  },
  msgBubbleOther: {
    background: '#ffffff',
    color: 'var(--text-primary)',
    border: '1px solid #E2E8F0',
    borderBottomLeftRadius: 2,
  },
  inputForm: {
    padding: 16,
    background: '#ffffff',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    gap: 12,
  },
};
