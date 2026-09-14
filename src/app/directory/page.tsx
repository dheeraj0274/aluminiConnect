'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface ProfileItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    role: string;
    graduationYear: number;
    department: string;
    currentLocation: string;
  };
  fullName: string;
  profilePhoto: string;
  jobTitle: string;
  company: string;
  industry: string;
  currentCity: string;
  currentCountry: string;
  skills: string[];
  graduationYear: number;
  department: string;
}

interface FilterOptions {
  departments: string[];
  graduationYears: number[];
  locations: string[];
  industries: string[];
  companies: string[];
}

export default function DirectoryPage() {
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    departments: [],
    graduationYears: [],
    locations: [],
    industries: [],
    companies: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDirectory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedDepartment) params.append('department', selectedDepartment);
      if (selectedYear) params.append('graduationYear', selectedYear);
      if (selectedLocation) params.append('location', selectedLocation);
      if (selectedIndustry) params.append('industry', selectedIndustry);
      if (selectedCompany) params.append('company', selectedCompany);
      if (roleFilter) params.append('role', roleFilter);

      const res = await fetch(`/api/alumni?${params.toString()}`);
      const data = await res.json();
      setProfiles(data.profiles || []);
      if (data.filterOptions) {
        setFilterOptions(data.filterOptions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedDepartment, selectedYear, selectedLocation, selectedIndustry, selectedCompany, roleFilter]);

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDepartment('');
    setSelectedYear('');
    setSelectedLocation('');
    setSelectedIndustry('');
    setSelectedCompany('');
    setRoleFilter('');
  };

  return (
    <div className="section-padding">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px' }}>
          <span style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1.5px' }}>
            VERIFIED DIRECTORY
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 12px' }}>
            Alumni & Graduate Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Search verified graduates working across global corporations, research labs, and startups.
          </p>
        </div>

        {/* Search Bar */}
        <div className="card-panel" style={{ padding: 16, marginBottom: 32, background: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, company, title, skill, or city..."
              style={{ flex: 1, minWidth: 260 }}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-navy" onClick={fetchDirectory} style={{ padding: '0 24px' }}>
              🔍 Search Directory
            </button>
            {(searchQuery || selectedDepartment || selectedYear || selectedLocation || selectedIndustry || selectedCompany || roleFilter) && (
              <button className="btn btn-secondary" onClick={clearFilters} style={{ padding: '0 16px' }}>
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Directory Layout: Filters Sidebar + Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 28 }}>
          {/* Filters Sidebar */}
          <div className="card-panel" style={{ padding: 24, height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: 20 }}>
              Filter Directory
            </h3>

            {/* Role Filter */}
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="alumni">Alumni Only</option>
                <option value="student">Students Only</option>
              </select>
            </div>

            {/* Department */}
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={selectedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
                <option value="">All Departments</option>
                {filterOptions.departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Graduation Year */}
            <div className="form-group">
              <label className="form-label">Graduation Year</label>
              <select className="form-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                <option value="">All Years</option>
                {filterOptions.graduationYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div className="form-group">
              <label className="form-label">Location</label>
              <select className="form-select" value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}>
                <option value="">All Locations</option>
                {filterOptions.locations.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Industry */}
            <div className="form-group">
              <label className="form-label">Industry</label>
              <select className="form-select" value={selectedIndustry} onChange={e => setSelectedIndustry(e.target.value)}>
                <option value="">All Industries</option>
                {filterOptions.industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* Company */}
            <div className="form-group">
              <label className="form-label">Company</label>
              <select className="form-select" value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
                <option value="">All Companies</option>
                {filterOptions.companies.map(comp => (
                  <option key={comp} value={comp}>{comp}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Alumni Profiles Cards Grid */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Showing <strong style={{ color: 'var(--primary-navy)' }}>{profiles.length}</strong> profile{profiles.length === 1 ? '' : 's'}
              </span>
            </div>

            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading profiles...
              </div>
            ) : profiles.length === 0 ? (
              <div className="card-panel" style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                No alumni match your current search and filter parameters.
              </div>
            ) : (
              <div className="grid-2">
                {profiles.map(profile => {
                  const user = profile.userId;
                  const name = profile.fullName || user?.name || 'Alumnus';
                  const job = profile.jobTitle || 'Professional';
                  const company = profile.company ? `@ ${profile.company}` : '';
                  const year = profile.graduationYear || user?.graduationYear;
                  const dept = profile.department || user?.department;
                  const location = profile.currentCity || user?.currentLocation;

                  return (
                    <div key={profile._id} className="card-panel" style={styles.card}>
                      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                        <div className="avatar" style={{ width: 56, height: 56, fontSize: '1.3rem', background: 'var(--primary-navy)' }}>
                          {profile.profilePhoto ? (
                            <img src={profile.profilePhoto} alt={name} />
                          ) : (
                            name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                            {name}
                          </h3>
                          <div style={{ color: 'var(--primary-blue)', fontSize: '0.88rem', fontWeight: 600 }}>
                            {job} {company}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 4 }}>
                            🎓 {dept} ({year})
                          </div>
                          {location && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                              📍 {location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Skills Badges */}
                      {profile.skills && profile.skills.length > 0 && (
                        <div style={styles.skillList}>
                          {profile.skills.slice(0, 4).map(skill => (
                            <span key={skill} className="badge badge-primary" style={{ textTransform: 'none', fontSize: '0.72rem' }}>
                              {skill}
                            </span>
                          ))}
                          {profile.skills.length > 4 && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              +{profile.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}

                      <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #E2E8F0' }}>
                        <Link href={`/profile/${user?._id || profile._id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                          View Profile →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  skillList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
    marginTop: 4,
  },
};
