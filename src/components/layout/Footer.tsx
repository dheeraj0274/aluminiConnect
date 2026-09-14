'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.container}>
        <div style={styles.grid}>
          {/* Brand Info */}
          <div>
            <div style={styles.logo}>
              <div style={styles.logoShield}>AC</div>
              <div style={styles.logoText}>
                <span style={{ color: '#FFFFFF', fontWeight: 800 }}>ALUMNI</span>
                <span style={{ color: '#60A5FA', fontWeight: 500, marginLeft: 4 }}>CONNECT</span>
              </div>
            </div>
            <p style={styles.desc}>
              The official global network for university alumni and students. Connecting graduates across 95+ global companies, driving career development, mentorship, and institutional excellence.
            </p>
          </div>

          {/* Directory & Network */}
          <div>
            <h4 style={styles.heading}>Alumni Network</h4>
            <ul style={styles.list}>
              <li><Link href="/directory">Alumni Directory</Link></li>
              <li><Link href="/network">My Network & Peers</Link></li>
              <li><Link href="/mentorship">Mentorship Hub</Link></li>
              <li><Link href="/stories">Alumni Success Stories</Link></li>
            </ul>
          </div>

          {/* Careers & Events */}
          <div>
            <h4 style={styles.heading}>Opportunities & Events</h4>
            <ul style={styles.list}>
              <li><Link href="/jobs">Job & Internship Board</Link></li>
              <li><Link href="/events">Reunions & Webinars</Link></li>
              <li><Link href="/announcements">Campus Announcements</Link></li>
              <li><Link href="/donations">Giving Back & Scholarships</Link></li>
            </ul>
          </div>

          {/* Institutional Info */}
          <div>
            <h4 style={styles.heading}>Portal Services</h4>
            <ul style={styles.list}>
              <li><Link href="/login">Portal Login</Link></li>
              <li><Link href="/register">Register Account</Link></li>
              <li><Link href="/profile">Alumni Profile Manager</Link></li>
              <li><Link href="/admin">Administrator Portal</Link></li>
            </ul>
          </div>
        </div>

        <div style={styles.bottom}>
          <div>© {new Date().getFullYear()} AlumniConnect Portal. All rights reserved. Institutional Alumni Association.</div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>Contact Office</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

const styles: Record<string, React.CSSProperties> = {
  footer: {
    background: 'var(--footer-bg)',
    color: '#CBD5E1',
    borderTop: '1px solid var(--footer-border)',
    padding: '64px 0 32px',
    marginTop: 'auto',
    transition: 'var(--transition)',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 48,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: 40,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  logoShield: {
    background: 'var(--primary-blue)',
    color: '#ffffff',
    padding: '4px 8px',
    borderRadius: 4,
    fontSize: '0.85rem',
    fontWeight: 800,
  },
  logoText: {
    fontSize: '1.1rem',
    letterSpacing: '0.5px',
  },
  desc: {
    color: '#94A3B8',
    fontSize: '0.88rem',
    maxWidth: 340,
    lineHeight: 1.6,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: '0.95rem',
    fontWeight: 700,
    marginBottom: 16,
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    fontSize: '0.86rem',
    color: '#CBD5E1',
  },
  bottom: {
    paddingTop: 24,
    borderTop: '1px solid var(--footer-border)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#94A3B8',
    fontSize: '0.82rem',
    flexWrap: 'wrap',
    gap: 12,
  },
};
