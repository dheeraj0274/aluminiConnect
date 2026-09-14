'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      login(data.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div className="card-panel" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>INSTITUTIONAL LOGIN</div>
          <h1 style={styles.title}>Sign in to AlumniConnect</h1>
          <p style={styles.subtitle}>Enter your account credentials to continue</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-navy"
            style={{ width: '100%', marginTop: 12, padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Don&apos;t have an account? </span>
          <Link href="/register" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: 'calc(100vh - 140px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: 'var(--bg-primary)',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    padding: 36,
  },
  header: {
    textAlign: 'center',
    marginBottom: 28,
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 4,
    background: 'var(--light-blue)',
    color: 'var(--primary-blue)',
    fontSize: '0.75rem',
    fontWeight: 700,
    marginBottom: 10,
    letterSpacing: '0.5px',
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: 800,
    color: 'var(--primary-navy)',
    marginBottom: 6,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.88rem',
  },
  errorBox: {
    padding: '10px 14px',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: 'var(--error)',
    borderRadius: 6,
    fontSize: '0.85rem',
    marginBottom: 20,
  },
  footer: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: '0.88rem',
    color: 'var(--text-secondary)',
  },
};
