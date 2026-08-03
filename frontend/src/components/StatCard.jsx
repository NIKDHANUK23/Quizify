import React from 'react';

export function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <div className="card stat-card">
      <div>
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
        {subtitle && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{subtitle}</div>}
      </div>
      {Icon && (
        <div className="stat-icon">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}
