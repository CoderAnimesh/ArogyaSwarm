// ============================================================
// REGISTER PAGE — Arogya-Swarm HMS
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();
  const particlesRef = useRef<HTMLDivElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({ name, email, password });
      alert('Patient registered! Please log in.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div ref={particlesRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}></div>
      <div className="login-card glass-card" style={{ maxWidth: '450px', margin: 'auto', zIndex: 1 }}>
        <h2 className="login-card-title">Patient Registration</h2>
        <p className="login-card-desc">Create your account to book an appointment</p>

        {error && (
          <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '0.75rem', marginBottom: '1rem', color: 'var(--danger)', fontSize: '0.9em' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-wrapper">
              <i className="fas fa-user"></i>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <i className="fas fa-envelope"></i>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <i className="fas fa-lock"></i>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9em', color: 'var(--text-muted)' }}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
