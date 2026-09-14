'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { calculateProfileCompletion } from '@/lib/utils';

interface ProfileData {
  fullName: string;
  profilePhoto: string;
  email: string;
  phone: string;
  graduationYear: number;
  department: string;
  course: string;
  currentCity: string;
  currentCountry: string;
  jobTitle: string;
  company: string;
  industry: string;
  yearsOfExperience: number;
  skills: string[];
  linkedIn: string;
  github: string;
  portfolio: string;
  degree: string;
  additionalEducation: string;
  bio: string;
  professionalSummary: string;
  availableForMentorship: boolean;
  mentorshipAreas: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetch('/api/profile')
        .then(res => res.json())
        .then(data => setProfile(data.profile))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading profile...</div>
      </div>
    );
  }

  if (!user || !profile) return null;

  const completion = calculateProfileCompletion((profile as unknown) as Record<string, unknown>);

  return (
    <div className="section-padding">
      <div className="container" style={{ maxWidth: 900 }}>
        {/* Top Header Card */}
        <div className="card-panel" style={{ padding: 32, marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div className="avatar" style={{ width: 88, height: 88, fontSize: '2.2rem', background: 'var(--primary-blue)' }}>
              {profile.profilePhoto ? (
                <img src={profile.profilePhoto} alt={profile.fullName} />
              ) : (
                (profile.fullName || user.name).charAt(0).toUpperCase()
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {profile.fullName || user.name}
                </h1>
                <span className="badge badge-primary">{user.role}</span>
                {profile.availableForMentorship && (
                  <span className="badge badge-success">Available Mentor</span>
                )}
              </div>

              <div style={{ color: 'var(--primary-blue)', fontSize: '1.05rem', fontWeight: 600, marginBottom: 6 }}>
                {profile.jobTitle || 'Job Title'} {profile.company ? `@ ${profile.company}` : ''}
              </div>

              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                🎓 {profile.department || user.department} ({profile.graduationYear || user.graduationYear})
              </div>

              {(profile.currentCity || profile.currentCountry) && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
                  📍 {[profile.currentCity, profile.currentCountry].filter(Boolean).join(', ')}
                </div>
              )}
            </div>

            <Link href="/profile/edit" className="btn btn-navy btn-sm">
              ✏️ Edit Profile
            </Link>
          </div>

          {/* Completion Bar */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--card-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
              <span style={{ color: 'var(--text-primary)' }}>Profile Strength</span>
              <span style={{ color: 'var(--primary-blue)' }}>{completion}%</span>
            </div>
            <div style={{ width: '100%', height: 6, background: 'var(--card-border)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${completion}%`, height: '100%', background: 'var(--primary-blue)' }} />
            </div>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="responsive-split-grid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* About / Bio */}
            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>About</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                {profile.bio || profile.professionalSummary || 'No bio added yet. Click Edit Profile to add a summary of your experience.'}
              </p>
            </div>

            {/* Experience */}
            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Professional Experience</h3>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{profile.jobTitle || 'Not specified'}</div>
                <div style={{ color: 'var(--primary-blue)', fontSize: '0.9rem', fontWeight: 600 }}>{profile.company || 'Not specified'}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>
                  Industry: {profile.industry || 'N/A'} • Experience: {profile.yearsOfExperience || 0} years
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>Education</h3>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{profile.degree || 'Bachelor of Technology'}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 2 }}>
                {profile.department || user.department} ({profile.graduationYear || user.graduationYear})
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Skills */}
            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Skills & Expertise</h3>
              {profile.skills && profile.skills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {profile.skills.map(s => (
                    <span key={s} className="badge badge-primary" style={{ textTransform: 'none' }}>
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No skills listed.</p>
              )}
            </div>

            {/* Links */}
            <div className="card-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>Links</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.9rem' }}>
                {profile.linkedIn && (
                  <a href={profile.linkedIn} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                    🔗 LinkedIn Profile
                  </a>
                )}
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                    💻 GitHub Profile
                  </a>
                )}
                {profile.portfolio && (
                  <a href={profile.portfolio} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-blue)', fontWeight: 600 }}>
                    🌐 Portfolio Website
                  </a>
                )}
                {!profile.linkedIn && !profile.github && !profile.portfolio && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No links added.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
