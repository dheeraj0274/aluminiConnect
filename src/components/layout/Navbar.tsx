'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize theme from localStorage or document attribute
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => setUnreadNotifications(data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user, pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard', authRequired: true },
    { href: '/directory', label: 'Directory' },
    { href: '/network', label: 'Network', authRequired: true },
    { href: '/events', label: 'Events' },
    { href: '/jobs', label: 'Jobs' },
    { href: '/mentorship', label: 'Mentorship', authRequired: true },
    { href: '/announcements', label: 'Announcements' },
    { href: '/stories', label: 'Stories' },
    { href: '/donations', label: 'Giving' },
  ];

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.navContainer}>
        {/* Brand Logo */}
        <Link href={user ? '/dashboard' : '/'} style={styles.logo}>
          <div style={styles.logoShield}>AC</div>
          <div style={styles.logoText}>
            <span style={{ color: '#FFFFFF', fontWeight: 800 }}>ALUMNI</span>
            <span style={{ color: '#60A5FA', fontWeight: 500, marginLeft: 4 }}>CONNECT</span>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button
          className="mobile-toggle-btn"
          style={styles.mobileToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Links & Auth Section */}
        <div className={`nav-menu-wrapper ${mobileMenuOpen ? 'open' : ''}`} style={styles.navMenu}>
          <div className="nav-desktop-links" style={styles.linkGroup}>
            {navLinks.map(link => {
              if (user && link.href === '/') return null; // Hide Home when logged in
              if (!user && link.authRequired) return null; // Hide authRequired links when logged out
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link-item"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    ...styles.link,
                    ...(isActive ? styles.activeLink : {}),
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Utility Menu / Auth Section */}
          <div className="nav-auth-section" style={styles.authSection}>
            {/* Theme Switcher Button Outside */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                  <span>Light</span>
                </>
              )}
            </button>

            {user ? (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                {/* Unified User Menu Trigger Badge */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={styles.userMenuTrigger}
                  aria-label="User account menu"
                >
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.85rem', background: 'var(--primary-blue)' }}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={styles.userName}>{user.name.split(' ')[0]}</span>
                  {unreadNotifications > 0 && (
                    <span style={styles.notifBadge}>{unreadNotifications}</span>
                  )}
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>▼</span>
                </button>

                {/* Sleek Profile & Utility Dropdown Card */}
                {userDropdownOpen && (
                  <div style={styles.dropdownCard}>
                    {/* User Info Header */}
                    <div style={styles.dropdownUserHeader}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {user.email}
                      </div>
                      <span className="badge badge-primary" style={{ marginTop: 6, width: 'fit-content' }}>
                        {user.role}
                      </span>
                    </div>

                    <div style={styles.dropdownDivider} />

                    {/* Menu Items */}
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      style={styles.dropdownItem}
                    >
                      <span>👤</span>
                      <span>My Profile</span>
                    </Link>

                    <Link
                      href="/notifications"
                      onClick={() => setUserDropdownOpen(false)}
                      style={styles.dropdownItem}
                    >
                      <span>🔔</span>
                      <span style={{ flex: 1 }}>Notifications</span>
                      {unreadNotifications > 0 && (
                        <span style={styles.dropdownNotifBadge}>{unreadNotifications}</span>
                      )}
                    </Link>

                    <Link
                      href="/messages"
                      onClick={() => setUserDropdownOpen(false)}
                      style={styles.dropdownItem}
                    >
                      <span>💬</span>
                      <span>Messages</span>
                    </Link>

                    {user?.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        style={{ ...styles.dropdownItem, color: '#FBBF24', fontWeight: 700 }}
                      >
                        <span>🔑</span>
                        <span>Admin Panel</span>
                      </Link>
                    )}

                    <div style={styles.dropdownDivider} />

                    {/* Logout Button */}
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      style={{ ...styles.dropdownItemBtn, color: 'var(--error)', fontWeight: 600 }}
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Theme Switcher for Logged Out User */}
                <button
                  onClick={toggleTheme}
                  className="theme-toggle-btn"
                  title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                      <span>Dark</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                      <span>Light</span>
                    </>
                  )}
                </button>

                <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={styles.loginBtn}>
                  Log In
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary btn-sm">
                  Join Network
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

const styles: Record<string, React.CSSProperties> = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'var(--nav-bg)',
    borderBottom: '1px solid var(--nav-border)',
    boxShadow: '0 2px 8px rgba(11, 31, 56, 0.15)',
    transition: 'var(--transition)',
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 72,
    maxWidth: 1380,
    margin: '0 auto',
    padding: '0 28px',
    position: 'relative',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  logoShield: {
    background: 'var(--primary-blue)',
    color: '#ffffff',
    padding: '5px 10px',
    borderRadius: 6,
    fontSize: '0.88rem',
    fontWeight: 800,
    letterSpacing: '0.5px',
  },
  logoText: {
    fontSize: '1.15rem',
    letterSpacing: '0.5px',
  },
  mobileToggle: {
    display: 'none',
    fontSize: '1.4rem',
    color: '#ffffff',
    background: 'transparent',
    padding: '4px 8px',
  },
  navMenu: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
  },
  linkGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'nowrap',
  },
  link: {
    fontSize: '0.88rem',
    fontWeight: 500,
    color: '#CBD5E1',
    transition: 'var(--transition)',
    whiteSpace: 'nowrap',
    paddingTop: 6,
    paddingBottom: 6,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 4,
  },
  activeLink: {
    color: '#FFFFFF',
    fontWeight: 700,
    borderBottom: '2px solid var(--primary-blue)',
  },
  authSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginLeft: 8,
    paddingLeft: 20,
    borderLeft: '1px solid rgba(255, 255, 255, 0.15)',
    flexShrink: 0,
  },
  themeToggleBtn: {
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '6px 12px',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.8rem',
    fontWeight: 600,
    transition: 'var(--transition)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  loginBtn: {
    color: '#FFFFFF',
    fontSize: '0.88rem',
    fontWeight: 600,
    padding: '6px 14px',
    whiteSpace: 'nowrap',
  },
  userMenuTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 12px 4px 6px',
    borderRadius: 'var(--radius-full)',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'var(--transition)',
  },
  dropdownCard: {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    right: 0,
    width: 230,
    background: 'var(--card-bg)',
    border: '1px solid var(--card-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-md)',
    padding: 10,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  dropdownUserHeader: {
    padding: '6px 8px 8px',
  },
  dropdownDivider: {
    height: 1,
    background: 'var(--card-border)',
    margin: '6px 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.86rem',
    color: 'var(--text-primary)',
    fontWeight: 500,
    transition: 'var(--transition)',
  },
  dropdownItemBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 10px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '0.86rem',
    color: 'var(--text-primary)',
    fontWeight: 500,
    width: '100%',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'var(--transition)',
  },
  dropdownNotifBadge: {
    background: 'var(--error)',
    color: '#fff',
    fontSize: '0.68rem',
    fontWeight: 700,
    borderRadius: 99,
    padding: '1px 6px',
  },
  userName: {
    fontSize: '0.84rem',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  notifBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    background: 'var(--error)',
    color: '#fff',
    fontSize: '0.62rem',
    fontWeight: 700,
    borderRadius: 99,
    padding: '2px 5px',
  },
};

