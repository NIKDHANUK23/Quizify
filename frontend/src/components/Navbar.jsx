import React from 'react';
import { Shield, GraduationCap, User, Sparkles } from 'lucide-react';

export function Navbar({ currentUser, onRoleSelect }) {
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

        <div className="nav-controls">
          <div className="role-selector">
            <button
              onClick={() => onRoleSelect('admin')}
              className={`role-btn ${currentUser.role === 'admin' ? 'active' : ''}`}
            >
              <Shield className="w-3.5 h-3.5" /> Admin
            </button>
            <button
              onClick={() => onRoleSelect('faculty')}
              className={`role-btn ${currentUser.role === 'faculty' ? 'active' : ''}`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Faculty
            </button>
            <button
              onClick={() => onRoleSelect('student')}
              className={`role-btn ${currentUser.role === 'student' ? 'active' : ''}`}
            >
              <User className="w-3.5 h-3.5" /> Student
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }}
            />
            <div style={{ display: 'none', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{currentUser.name}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
