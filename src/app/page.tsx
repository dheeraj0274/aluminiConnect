'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface Stat {
  totalAlumni: number;
  totalStudents: number;
  totalEvents: number;
  totalJobs: number;
  totalCompanies: number;
}

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stat>({
    totalAlumni: 1250,
    totalStudents: 840,
    totalEvents: 42,
    totalJobs: 118,
    totalCompanies: 95,
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
      return;
    }

    fetch('/api/admin?section=stats')
      .then(res => res.json())
      .then(data => {
        if (data.stats) {
          setStats({
            totalAlumni: data.stats.totalAlumni || 1250,
            totalStudents: data.stats.totalStudents || 840,
            totalEvents: data.stats.totalEvents || 42,
            totalJobs: data.stats.totalJobs || 118,
            totalCompanies: data.stats.totalCompanies || 95,
          });
        }
      })
      .catch(() => {});
  }, [user, authLoading, router]);

  if (user) return null;

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      {/* SECTION 1: LARGE HERO (650-750px tall on desktop) */}
      <section style={styles.heroSection}>
        <div className="container hero-container-split">
          <div style={styles.heroTextContent}>
            <div style={styles.heroBadge}>
              🏛️ Official Institutional Alumni Network
            </div>
            <h1 style={styles.heroHeading}>
              Connecting Leaders, Innovators, and Graduates Worldwide
            </h1>
            <p style={styles.heroSubheading}>
              The official global platform for alumni and students. Discover career opportunities at top tier companies, connect with department peers, participate in annual reunions, and mentor the next generation.
            </p>
            <div style={styles.heroCtaGroup}>
              {user ? (
                <Link href="/dashboard" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                  Go to Dashboard →
                </Link>
              ) : (
                <Link href="/register" className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '1rem' }}>
                  Join Alumni Network
                </Link>
              )}
              <Link href="/directory" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1rem', background: 'transparent', color: '#fff', borderColor: '#334155' }}>
                Browse Directory
              </Link>
            </div>
          </div>

          {/* Hero Right Preview UI */}
          <div style={styles.heroPreviewWindow}>
            <div style={styles.windowHeader}>
              <span style={{ ...styles.dot, background: '#EF4444' }} />
              <span style={{ ...styles.dot, background: '#F59E0B' }} />
              <span style={{ ...styles.dot, background: '#10B981' }} />
              <span style={styles.windowTitle}>AlumniConnect Verified Portal</span>
            </div>
            <div style={styles.windowBody}>
              <div className="card-panel" style={{ padding: 16, marginBottom: 16 }}>
                <input className="form-input" placeholder="🔍 Search alumni by company, title, skill, or location..." disabled style={{ background: 'var(--bg-muted)', fontSize: '0.82rem' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div className="card-panel" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.9rem', background: 'var(--primary-blue)' }}>PA</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Priya Ananth</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Senior Product Manager @ Microsoft</div>
                  </div>
                  <span className="badge badge-success">Available Mentor</span>
                </div>

                <div className="card-panel" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="avatar" style={{ width: 40, height: 40, fontSize: '0.9rem', background: '#10B981' }}>PP</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>Pankaj Patel</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Staff Cloud Architect @ Amazon Web Services</div>
                  </div>
                  <span className="badge badge-primary">Class of &apos;18</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: STATS BAR */}
      <section style={styles.statsBarSection}>
        <div className="container">
          <div className="card-panel grid-4" style={{ padding: '12px 24px' }}>
            <div style={styles.statBox}>
              <div style={styles.statNum}>{stats.totalAlumni.toLocaleString()}+</div>
              <div style={styles.statLbl}>Registered Alumni</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statNum}>{stats.totalCompanies.toLocaleString()}+</div>
              <div style={styles.statLbl}>Global Employers</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statNum}>{stats.totalJobs.toLocaleString()}+</div>
              <div style={styles.statLbl}>Exclusive Postings</div>
            </div>
            <div style={styles.statBox}>
              <div style={styles.statNum}>{stats.totalEvents.toLocaleString()}+</div>
              <div style={styles.statLbl}>Annual Events</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CORE VALUE PROPOSITION */}
      <section className="section-padding">
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>PORTAL CAPABILITIES</span>
            <h2 style={styles.sectionTitle}>
              Designed for Lifetime Professional Connection
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              Everything you need to find mentors, post career openings, network with batchmates, and advance institutional leadership.
            </p>
          </div>

          <div className="grid-3">
            <div className="card-panel" style={styles.introCard}>
              <div style={styles.introIcon}>🔍</div>
              <h3 style={styles.introTitle}>Global Alumni Directory</h3>
              <p style={styles.introDesc}>
                Filter verified graduates by company, job title, department, graduation year, and skill sets with direct messaging capabilities.
              </p>
            </div>

            <div className="card-panel" style={styles.introCard}>
              <div style={styles.introIcon}>🤝</div>
              <h3 style={styles.introTitle}>Structured Mentorship</h3>
              <p style={styles.introDesc}>
                Connect senior alumni with undergraduates for 1-on-1 career guidance, resume reviews, and interview preparation.
              </p>
            </div>

            <div className="card-panel" style={styles.introCard}>
              <div style={styles.introIcon}>💼</div>
              <h3 style={styles.introTitle}>Exclusive Job Postings</h3>
              <p style={styles.introDesc}>
                Discover job opportunities and internships posted directly by alumni hiring managers at global corporations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: ALUMNI DIRECTORY PREVIEW */}
      <section className="section-padding" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={styles.sectionTag}>DIRECTORY PREVIEW</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                Explore Global Alumni Profiles
              </h2>
            </div>
            <Link href="/directory" className="btn btn-navy btn-sm">
              Search Full Directory →
            </Link>
          </div>

          {/* Search/Filter UI Preview */}
          <div className="card-panel" style={{ padding: 16, marginBottom: 24, background: 'var(--bg-muted)' }}>
            <div className="mobile-stack-grid">
              <input className="form-input" placeholder="Search by name, company, skill..." disabled value="" readOnly />
              <select className="form-select" disabled><option>Computer Science</option></select>
              <select className="form-select" disabled><option>Batch of 2021</option></select>
              <select className="form-select" disabled><option>Technology</option></select>
            </div>
          </div>

          {/* Realistic Alumni Cards */}
          <div className="grid-3">
            <div className="card-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className="avatar" style={{ width: 52, height: 52, fontSize: '1.2rem', background: '#0F2747' }}>RS</div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Rahul Sharma</h4>
                  <div style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 600 }}>Senior Software Engineer @ Google</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>🎓 Computer Science (2021)</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>📍 Bengaluru, India</div>
                </div>
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-primary">React</span>
                <span className="badge badge-primary">System Design</span>
                <span className="badge badge-primary">Go</span>
              </div>
            </div>

            <div className="card-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className="avatar" style={{ width: 52, height: 52, fontSize: '1.2rem', background: '#16805A' }}>PP</div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Priya Patel</h4>
                  <div style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 600 }}>Staff Product Manager @ Meta</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>🎓 Information Tech (2020)</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>📍 San Francisco, USA</div>
                </div>
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-primary">Product Strategy</span>
                <span className="badge badge-primary">Analytics</span>
              </div>
            </div>

            <div className="card-panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className="avatar" style={{ width: 52, height: 52, fontSize: '1.2rem', background: '#C98A16' }}>AG</div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ananya Gupta</h4>
                  <div style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 600 }}>Investment Associate @ Goldman Sachs</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>🎓 Business Admin (2019)</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>📍 London, UK</div>
                </div>
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #E2E8F0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge-primary">Venture Capital</span>
                <span className="badge badge-primary">Fintech</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CONNECTIONS / NETWORK PREVIEW */}
      <section className="section-padding">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center' }}>
            <div>
              <span style={styles.sectionTag}>PEER CONNECTIVITY</span>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '8px 0 16px' }}>
                Stay Connected with Department Peers & Colleagues
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6, marginBottom: 24 }}>
                Build meaningful professional connections with batchmates and department alumni. Send direct connection requests, engage in secure 1-on-1 messaging, and request career guidance.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/network" className="btn btn-navy">
                  View My Network →
                </Link>
              </div>
            </div>

            <div className="card-panel" style={{ padding: 24 }}>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
                Recent Peer Connection Requests
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--bg-muted)', borderRadius: 6, border: '1px solid var(--card-border)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Amit Verma</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Electronics & Comm &apos;22 • RoboTech</div>
                  </div>
                  <button className="btn btn-primary btn-sm">Accept Request</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'var(--bg-muted)', borderRadius: 6, border: '1px solid var(--card-border)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Dr. Vikram Sen</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Research Director &apos;17 • AI Lab</div>
                  </div>
                  <button className="btn btn-primary btn-sm">Accept Request</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: CAREER OPPORTUNITIES / JOB BOARD PREVIEW */}
      <section className="section-padding" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={styles.sectionTag}>ALUMNI CAREER BOARD</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                Featured Job & Internship Openings
              </h2>
            </div>
            <Link href="/jobs" className="btn btn-navy btn-sm">
              Explore All Openings →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card-panel" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Full Stack React & Node.js Developer
                  </h3>
                  <span className="badge badge-primary">Full-Time</span>
                </div>
                <div style={{ color: 'var(--primary-blue)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>
                  🏢 RoboTech Solutions • 📍 Noida / Remote
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Posted by Amit Verma &apos;22 • 2 days ago
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success)' }}>₹14L - ₹20L / yr</span>
                <Link href="/jobs" className="btn btn-secondary btn-sm">
                  View & Apply
                </Link>
              </div>
            </div>

            <div className="card-panel" style={{ padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Product Management Intern (Summer 2026)
                  </h3>
                  <span className="badge badge-info">Internship</span>
                </div>
                <div style={{ color: 'var(--primary-blue)', fontSize: '0.9rem', fontWeight: 600, marginTop: 4 }}>
                  🏢 Fintech Global • 📍 Bengaluru, India
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Posted by Ananya Gupta &apos;19 • 3 days ago
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--success)' }}>₹40,000 / mo</span>
                <Link href="/jobs" className="btn btn-secondary btn-sm">
                  View & Apply
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: MENTORSHIP SECTION */}
      <section className="section-padding">
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>CAREER GUIDANCE</span>
            <h2 style={styles.sectionTitle}>1-on-1 Alumni Mentorship Hub</h2>
            <p style={styles.sectionSubtitle}>
              Experienced graduates offering 1-on-1 time for resume reviews, coding interview prep, and career strategy.
            </p>
          </div>

          <div className="grid-3">
            <div className="card-panel" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.6rem', marginBottom: 12 }}>RS</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Rahul Sharma</h3>
              <div style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 600 }}>Senior Software Engineer @ Google</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 12px' }}>5+ Years Experience</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
                <span className="badge badge-primary">System Design</span>
                <span className="badge badge-primary">Coding Interview</span>
              </div>
              <Link href="/mentorship" className="btn btn-navy btn-sm" style={{ width: '100%' }}>
                Request Mentorship
              </Link>
            </div>

            <div className="card-panel" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.6rem', background: '#16805A', marginBottom: 12 }}>PP</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Priya Patel</h3>
              <div style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 600 }}>Staff Product Manager @ Meta</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 12px' }}>6+ Years Experience</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
                <span className="badge badge-primary">Product Management</span>
                <span className="badge badge-primary">Resume Review</span>
              </div>
              <Link href="/mentorship" className="btn btn-navy btn-sm" style={{ width: '100%' }}>
                Request Mentorship
              </Link>
            </div>

            <div className="card-panel" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.6rem', background: '#C98A16', marginBottom: 12 }}>AG</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ananya Gupta</h3>
              <div style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 600 }}>Investment Associate @ Goldman Sachs</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '4px 0 12px' }}>7+ Years Experience</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
                <span className="badge badge-primary">Finance & VC</span>
                <span className="badge badge-primary">Higher Studies</span>
              </div>
              <Link href="/mentorship" className="btn btn-navy btn-sm" style={{ width: '100%' }}>
                Request Mentorship
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: UPCOMING EVENTS */}
      <section className="section-padding" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--card-border)', borderBottom: '1px solid var(--card-border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <div>
              <span style={styles.sectionTag}>CAMPUS & GLOBAL SUMMITS</span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                Upcoming Alumni Events & Webinars
              </h2>
            </div>
            <Link href="/events" className="btn btn-navy btn-sm">
              View All Events →
            </Link>
          </div>

          <div className="grid-2">
            <div className="card-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="badge badge-primary">Hybrid Summit</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>142 Registered</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                Global Alumni Tech Summit 2026
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1, marginBottom: 16 }}>
                Join over 500+ global alumni leaders for a full-day summit covering AI innovation, startup funding trends, and cloud engineering best practices.
              </p>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: 16, marginBottom: 16 }}>
                <div>📅 Sept 28, 2026 (10:00 AM)</div>
                <div>📍 Auditorium Hall A & Online</div>
              </div>
              <Link href="/events" className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}>
                Register for Summit
              </Link>
            </div>

            <div className="card-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="badge badge-info">Online Workshop</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>88 Registered</span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 8 }}>
                Resume Review & Crack Technical Interviews
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, flex: 1, marginBottom: 16 }}>
                Interactive live workshop led by Google & Meta alumni. Get your resume live-critiqued and practice mock coding problems.
              </p>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', gap: 16, marginBottom: 16 }}>
                <div>📅 Sept 21, 2026 (06:00 PM)</div>
                <div>📍 Google Meet Video</div>
              </div>
              <Link href="/events" className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}>
                Register for Workshop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9: ALUMNI SUCCESS STORIES */}
      <section className="section-padding">
        <div className="container">
          <div style={styles.sectionHeader}>
            <span style={styles.sectionTag}>ALUMNI SPOTLIGHT</span>
            <h2 style={styles.sectionTitle}>Inspiring Career Journeys & Milestones</h2>
            <p style={styles.sectionSubtitle}>
              Real stories of graduates breaking new ground across technology, research, and entrepreneurship.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28 }}>
            {/* Featured Large Story */}
            <div className="card-panel" style={{ padding: 32, background: 'var(--nav-bg)', color: '#FFFFFF' }}>
              <span className="badge badge-warning" style={{ marginBottom: 12 }}>Featured Founder Story</span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 12 }}>
                Building a $50M AI Startup: Lessons from my Campus Days
              </h3>
              <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: 20 }}>
                &quot;When I graduated in 2019, I started working in a small apartment with two batchmates. Our college incubator gave us our first server grant. Today we serve over 1 Million active enterprise users worldwide!&quot;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                <div className="avatar" style={{ width: 44, height: 44, fontSize: '1rem', background: 'var(--primary-blue)' }}>PA</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>Portal Administrator</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Co-Founder & CEO @ RoboTech • Class of &apos;19</div>
                </div>
              </div>
            </div>

            {/* Side Story Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card-panel" style={{ padding: 20 }}>
                <span className="badge badge-primary" style={{ marginBottom: 6 }}>Career Milestone</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  From Junior Dev to Staff Engineer at Meta in 5 Years
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Priya Patel &apos;20 • Information Technology
                </div>
              </div>

              <div className="card-panel" style={{ padding: 20 }}>
                <span className="badge badge-primary" style={{ marginBottom: 6 }}>Global Studies</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                  Securing Full Scholarship for Master&apos;s at Stanford University
                </h4>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Ananya Gupta &apos;19 • Business Admin
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 10: COMMUNITY CTA BANNER */}
      <section className="section-padding" style={{ background: 'var(--nav-bg)', color: '#FFFFFF', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>
            Ready to Connect with Your Alumni Community?
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '1.05rem', marginBottom: 32, lineHeight: 1.6 }}>
            Join thousands of alumni and students expanding their professional network, mentoring juniors, and advancing institutional growth.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {user ? (
              <Link href="/dashboard" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                  Create Account Now
                </Link>
                <Link href="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem', background: 'transparent', color: '#fff', borderColor: '#334155' }}>
                  Sign In to Profile
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  heroSection: {
    background: 'var(--primary-navy)',
    color: '#FFFFFF',
    padding: '80px 0 90px',
    minHeight: 680,
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #1E293B',
  },
  heroContainer: {
    display: 'grid',
    gridTemplateColumns: '1.1fr 0.9fr',
    gap: 48,
    alignItems: 'center',
  },
  heroTextContent: {},
  heroBadge: {
    display: 'inline-block',
    padding: '6px 14px',
    borderRadius: 4,
    background: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    color: '#93C5FD',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginBottom: 20,
  },
  heroHeading: {
    fontSize: '2.8rem',
    fontWeight: 800,
    color: '#FFFFFF',
    lineHeight: 1.18,
    letterSpacing: '-0.5px',
    marginBottom: 16,
  },
  heroSubheading: {
    fontSize: '1.05rem',
    color: '#CBD5E1',
    lineHeight: 1.6,
    marginBottom: 32,
  },
  heroCtaGroup: {
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
  },
  heroPreviewWindow: {
    background: '#FFFFFF',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    border: '1px solid #334155',
  },
  windowHeader: {
    background: '#1E293B',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
  },
  windowTitle: {
    color: '#94A3B8',
    fontSize: '0.78rem',
    fontWeight: 600,
    marginLeft: 8,
  },
  windowBody: {
    padding: 20,
  },
  statsBarSection: {
    padding: '40px 0',
    marginTop: -40,
    position: 'relative',
    zIndex: 10,
  },
  statBox: {
    padding: '24px 16px',
    textAlign: 'center',
  },
  statNum: {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: 'var(--primary-blue)',
    marginBottom: 4,
  },
  statLbl: {
    color: 'var(--text-secondary)',
    fontSize: '0.88rem',
    fontWeight: 600,
  },
  sectionHeader: {
    textAlign: 'center',
    maxWidth: 680,
    margin: '0 auto 48px',
  },
  sectionTag: {
    color: 'var(--primary-blue)',
    fontSize: '0.8rem',
    fontWeight: 700,
    letterSpacing: '1.5px',
  },
  sectionTitle: {
    fontSize: '2.2rem',
    fontWeight: 800,
    color: 'var(--primary-navy)',
    margin: '8px 0 12px',
  },
  sectionSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
  },
  introCard: {
    padding: 32,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  introIcon: {
    fontSize: '2.2rem',
  },
  introTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--primary-navy)',
  },
  introDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
};
