// ============================================================
// LOGIN PAGE — Arogya-Swarm HMS
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { key: 'admin', icon: 'fas fa-user-shield', label: 'Admin' },
  { key: 'doctor', icon: 'fas fa-user-md', label: 'Doctor' },
  { key: 'asha', icon: 'fas fa-user-nurse', label: 'Asha' },
  { key: 'patient', icon: 'fas fa-user', label: 'Patient' },
] as const;

const LoginPage: React.FC = () => {
  const [currentRole, setCurrentRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigateByRole(user.role);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (particlesRef.current && particlesRef.current.children.length === 0) {
      for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'login-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 8 + 's';
        p.style.animationDuration = (6 + Math.random() * 6) + 's';
        p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
        particlesRef.current.appendChild(p);
      }
    }
  }, []);

  const navigateByRole = (role: string) => {
    switch (role) {
      case 'admin': navigate('/admin'); break;
      case 'doctor': navigate('/doctor'); break;
      case 'patient': navigate('/patient'); break;
      case 'asha': navigate('/asha'); break;
      default: navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login({ email, password, expectedRole: currentRole });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>
      <div className="login-card glass-card" style={{ maxWidth: '480px', margin: 'auto', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <i className="fas fa-heartbeat" style={{ fontSize: '3rem', color: 'var(--primary-light)' }}></i>
          <h2 className="login-card-title" style={{ marginTop: '1rem' }}>Login</h2>
        </div>

        <div className="role-selector" id="role-selector">
          {ROLES.map(r => (
            <button
              key={r.key}
              className={`role-btn ${currentRole === r.key ? 'active' : ''}`}
              onClick={() => setCurrentRole(r.key)}
              type="button"
            >
              <div className="role-icon"><i className={r.icon}></i></div>
              <span>{r.label}</span>
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.9em' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9em', color: 'var(--text-muted)' }}>
          New Patient? <Link to="/register">Register Here</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
