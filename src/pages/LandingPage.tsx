// ============================================================
// LANDING PAGE — Arogya-Swarm HMS
// ============================================================
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import '../assets/styles/landing.css';

const LandingPage: React.FC = () => {
  const particlesRef = useRef<HTMLDivElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'bot' | 'user'; text: string }[]>([
    { role: 'bot', text: 'Hello! I can help you find the right hospital portal or answer general questions. How can I assist you?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    AOS.init({ once: true });
    // Particle logic
    if (particlesRef.current) {
      for (let i = 0; i < 40; i++) {
        const p = document.createElement('div');
        p.className = 'login-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 5 + 's';
        p.style.animationDuration = (8 + Math.random() * 8) + 's';
        p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
        particlesRef.current.appendChild(p);
      }
    }
  }, []);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const sendChatMessage = () => {
    const text = chatInput.trim();
    if (!text) return;
    setChatMessages(prev => [...prev, { role: 'user', text }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'bot',
        text: 'I am an AI assistant. To get a clinical diagnosis, please login to the Patient Portal and register an appointment!'
      }]);
    }, 1000);
  };

  const toggleChat = () => setChatOpen(prev => !prev);

  return (
    <>
      {/* HERO SECTION */}
      <section className="landing-bg">
        <div className="landing-particles" ref={particlesRef}></div>
        <div className="landing-container" style={{ minHeight: '100vh' }}>
          <div className="landing-header">
            <div className="landing-logo">
              <i className="fas fa-heartbeat"></i>
              <span>Arogya<span className="accent">Swarm</span></span>
            </div>
            <nav className="landing-nav">
              <a href="#features" className="btn btn-ghost">Features</a>
              <Link to="/login" className="btn btn-ghost">Staff Login</Link>
              <Link to="/register" className="btn btn-primary">Patient Portal</Link>
            </nav>
          </div>
          <div className="landing-hero" style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <div data-aos="fade-up" data-aos-duration="1000">
              <div className="badge-pill mb-4" style={{ background: 'rgba(108,92,231,0.2)', color: 'var(--primary-light)', padding: '0.5rem 1rem', borderRadius: '50px', display: 'inline-block', fontWeight: 600, fontSize: '0.9em' }}>
                <i className="fas fa-robot"></i> Now powered by Google Gemini AI
              </div>
              <h1 className="hero-title">Next-Gen Hospital<br /><span className="accent">Intelligence</span></h1>
            </div>
            <p className="hero-subtitle" data-aos="fade-up" data-aos-delay="200" data-aos-duration="1000">
              Streamline triage with Conversational AI, track real-time climate emissions, and bridge the gap between patients and doctors intuitively.
            </p>
            <div className="hero-actions" data-aos="fade-up" data-aos-delay="400" data-aos-duration="1000">
              <Link to="/register" className="btn btn-primary btn-lg"><i className="fas fa-calendar-check"></i> Book Appointment</Link>
              <button className="btn btn-outline btn-lg" onClick={toggleChat}><i className="fas fa-comments"></i> Ask Assistant</button>
            </div>
          </div>
          <div className="scroll-indicator" data-aos="fade-in" data-aos-delay="800">
            <i className="fas fa-chevron-down bouncing"></i>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="features-section">
        <div className="container text-center section-spacing">
          <h2 data-aos="fade-up" style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>Why Choose <span className="accent">ArogyaSwarm</span>?</h2>
          <div className="features-grid">
            <div className="feature-card glass-card" data-aos="zoom-in" data-aos-delay="100">
              <i className="fas fa-brain feature-icon"></i>
              <h3>AI-Powered Triage</h3>
              <p>Integrated with Gemini API, our patient portal talks directly to patients, categorizes their pain, and summarizes it clinically for Doctors.</p>
            </div>
            <div className="feature-card glass-card" data-aos="zoom-in" data-aos-delay="200">
              <i className="fas fa-leaf feature-icon" style={{ color: '#00b894' }}></i>
              <h3>Emissions Tracking</h3>
              <p>Real-time Weather integrations predict and alert administrators on biological waste decomposition risks based on local humidity and heat.</p>
            </div>
            <div className="feature-card glass-card" data-aos="zoom-in" data-aos-delay="300">
              <i className="fas fa-chart-line feature-icon" style={{ color: '#fdcb6e' }}></i>
              <h3>Advanced Analytics</h3>
              <p>Visualize hospital traffic, doctor queues, and inventory stocks cleanly using beautifully rendered interactive charts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonials-section" style={{ background: 'var(--bg-tertiary)', padding: '5rem 0' }}>
        <div className="container text-center">
          <h2 data-aos="fade-up" style={{ marginBottom: '3rem' }}>Trusted by Medical Leaders</h2>
          <div className="feature-card glass-card" data-aos="fade-up" data-aos-delay="200" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left', position: 'relative' }}>
            <i className="fas fa-quote-left" style={{ fontSize: '3rem', color: 'var(--primary-light)', opacity: 0.2, position: 'absolute', top: '1rem', left: '1rem' }}></i>
            <p style={{ fontSize: '1.2rem', lineHeight: 1.8, marginBottom: '1.5rem', zIndex: 2, position: 'relative', paddingLeft: '2rem' }}>
              "The integration of the Gemini AI entirely reshaped our patient registration process. It summarizes complex patient ramblings into neat, actionable clinical reports."
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingLeft: '2rem' }}>
              <img src="https://i.pravatar.cc/100?img=12" alt="Dr" style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
              <div>
                <h4 style={{ margin: 0 }}>Dr. Richard Hendricks</h4>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9em' }}>Chief Medical Officer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="main-footer" style={{ background: 'rgba(10,10,26,0.9)', padding: '4rem 2rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          <div>
            <div className="landing-logo" style={{ marginBottom: '1rem' }}>
              <i className="fas fa-heartbeat"></i>
              <span>Arogya<span className="accent">Swarm</span></span>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>Innovating healthcare management with AI precision and ecological responsibility.</p>
          </div>
          <div>
            <h4>Portals</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              <li><Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Admin Login</Link></li>
              <li><Link to="/login" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Doctor Panel</Link></li>
              <li><Link to="/register" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Patient Registration</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
              <li><i className="fas fa-envelope"></i> admin@arogyaswarm.com</li>
              <li><i className="fas fa-phone"></i> +91 8000 000 000</li>
              <li><i className="fas fa-map-marker-alt"></i> New Delhi, India</li>
            </ul>
          </div>
        </div>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9em', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
          &copy; 2026 Arogya Swarm. All Rights Reserved.
        </div>
      </footer>

      {/* FLOATING CHATBOT UI */}
      <div className={`chatbot-widget ${chatOpen ? 'open' : ''}`} id="chatbot-ui">
        <div className="chatbot-header" onClick={toggleChat}>
          <i className="fas fa-robot"></i> Arogya Assistant
          <i className="fas fa-chevron-down" style={{ marginLeft: 'auto' }}></i>
        </div>
        <div className="chatbot-body" ref={chatBodyRef} style={{ display: chatOpen ? 'flex' : 'none' }}>
          {chatMessages.map((msg, i) => (
            <div key={i} className={`chat-message ${msg.role === 'bot' ? 'bot' : 'user'}`}>{msg.text}</div>
          ))}
        </div>
        <div className="chatbot-input" style={{ display: chatOpen ? 'flex' : 'none' }}>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Type a message..."
            onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
          />
          <button onClick={sendChatMessage}><i className="fas fa-paper-plane"></i></button>
        </div>
      </div>

      {!chatOpen && (
        <button className="chat-fab" onClick={toggleChat} id="chat-fab">
          <i className="fas fa-comment-dots"></i>
        </button>
      )}
    </>
  );
};

export default LandingPage;
