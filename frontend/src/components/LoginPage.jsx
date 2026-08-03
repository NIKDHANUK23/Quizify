import React, { useState } from 'react';
import { Sparkles, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    setError('');

    onLogin({ email, password })
      .catch((err) => {
        setError(err.message || 'Invalid email or password. Authentication failed.');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="login-container">
      <div className="login-card card" style={{ maxWidth: '460px', width: '100%' }}>
        <div className="login-header">
          <div className="brand-logo" style={{ justifyContent: 'center', marginBottom: '0.75rem' }}>
            <div className="brand-icon" style={{ width: '48px', height: '48px' }}>
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <h1 className="login-title font-title">QuizMaster Pro</h1>
          <p className="login-subtitle">
            Sign in with your credentials to access your dedicated role dashboard.
          </p>
        </div>

        {error && (
          <div className="error-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form" style={{ maxWidth: '100%' }}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="input"
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock className="w-4 h-4" style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center', padding: '12px', fontSize: '0.9rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
