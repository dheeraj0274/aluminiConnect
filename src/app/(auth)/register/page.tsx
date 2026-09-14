'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'alumni',
    graduationYear: new Date().getFullYear(),
    department: 'Computer Science',
    currentLocation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration',
    'Data Science',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
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
          <div style={styles.badge}>INSTITUTIONAL REGISTRATION</div>
          <h1 style={styles.title}>Join AlumniConnect</h1>
          <p style={styles.subtitle}>Connect with 10,000+ verified graduates and students</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Account Type Selector */}
          <div className="form-group">
            <label className="form-label">I am registering as a</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                style={{
                  ...styles.roleBtn,
                  ...(formData.role === 'alumni' ? styles.roleBtnActive : {}),
                }}
                onClick={() => setFormData({ ...formData, role: 'alumni' })}
              >
                🎓 Alumni / Graduate
              </button>
              <button
                type="button"
                style={{
                  ...styles.roleBtn,
                  ...(formData.role === 'student' ? styles.roleBtnActive : {}),
                }}
                onClick={() => setFormData({ ...formData, role: 'student' })}
              >
                📚 Current Student
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Rahul Sharma"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="rahul@example.com"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <input
                type="number"
                className="form-input"
                min="1960"
                max="2030"
                required
                value={formData.graduationYear}
                onChange={e => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value })}
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Current Location (City, Country)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Noida, India"
              value={formData.currentLocation}
              onChange={e => setFormData({ ...formData, currentLocation: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                minLength={6}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                required
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-navy"
            style={{ width: '100%', marginTop: 16, padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already registered? </span>
          <Link href="/login" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
            Sign in
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
    maxWidth: 540,
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
  roleBtn: {
    padding: '10px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--card-border)',
    background: '#FFFFFF',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'var(--transition)',
  },
  roleBtnActive: {
    background: 'var(--light-blue)',
    borderColor: 'var(--primary-blue)',
    color: 'var(--primary-blue)',
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
