'use client';

import React, { useEffect, useState } from 'react';

interface CampaignItem {
  _id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  category: string;
  donorsCount: number;
  status: string;
}

export default function DonationsPage() {
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/donations')
      .then(res => res.json())
      .then(data => setCampaigns(data.campaigns || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDonateClick = (campaignTitle: string) => {
    alert(`Thank you for your generosity! Payment gateway integration for "${campaignTitle}" will be enabled in the upcoming portal release.`);
  };

  return (
    <div className="section-padding">
      <div className="container">
        {/* Header */}
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto 40px' }}>
          <span style={{ color: 'var(--primary-blue)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1.5px' }}>
            GIVING BACK TO ALMA MATER
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-navy)', margin: '8px 0 12px' }}>
            Alumni Giving & Support Initiatives
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            Empower future generations by supporting merit scholarships, campus research labs, and emergency student aid funds.
          </p>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading donation campaigns...
          </div>
        ) : (
          <div className="grid-3">
            {campaigns.map(camp => {
              const percent = Math.min(Math.round((camp.currentAmount / camp.targetAmount) * 100), 100);

              return (
                <div key={camp._id} className="card-panel" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-primary" style={{ textTransform: 'capitalize' }}>
                      {camp.category.replace('-', ' ')}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      🙌 {camp.donorsCount} Donors
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                    {camp.title}
                  </h3>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.5, flex: 1 }}>
                    {camp.description}
                  </p>

                  {/* Financial Progress Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: 6 }}>
                      <span style={{ color: 'var(--text-primary)' }}>Raised: ₹{camp.currentAmount.toLocaleString()}</span>
                      <span style={{ color: 'var(--primary-blue)' }}>Goal: ₹{camp.targetAmount.toLocaleString()} ({percent}%)</span>
                    </div>
                    <div style={{ width: '100%', height: 8, background: '#E2E8F0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: 'var(--primary-blue)' }} />
                    </div>
                  </div>

                  <div style={{ paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
                    <button className="btn btn-navy" style={{ width: '100%' }} onClick={() => handleDonateClick(camp.title)}>
                      🎁 Contribute & Support
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
