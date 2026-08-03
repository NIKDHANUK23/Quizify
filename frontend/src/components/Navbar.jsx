import React from 'react';
import { Shield, GraduationCap, User, Sparkles, LogOut, Lock } from 'lucide-react';
import { Badge } from './Badge';

export function Navbar({ currentUser, onLogout }) {
  const roleBadgeVariants = {
    student: 'gold',
    faculty: 'success',
    admin: 'danger',
  };

  const portalLabels = {
    student: 'Student Portal',
    faculty: 'Faculty Portal',
    admin: 'Admin Control Center',
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="#" className="brand-logo">
          <div className="brand-icon">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="brand-title">QuizMaster Pro</div>
            <div className="brand-tag">MERN Stack • Vite + Express</div>
          </div>
        </a>

        {currentUser ? (
          <div className="nav-controls">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant={roleBadgeVariants[currentUser.role] || 'neutral'}>
                {portalLabels[currentUser.role] || currentUser.role}
              </Badge>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-card)', padding: '4px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                alt={currentUser.name}
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>{currentUser.name}</span>
                <span style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>{currentUser.email}</span>
              </div>
            </div>

            <button onClick={onLogout} className="btn btn-secondary" title="Logout & Return to Login Screen">
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        ) : (
          <div className="nav-controls">
            <Badge variant="neutral"><Lock className="w-3 h-3 mr-1" /> Not Authenticated</Badge>
          </div>
        )}
      </div>
    </nav>
  );
}

