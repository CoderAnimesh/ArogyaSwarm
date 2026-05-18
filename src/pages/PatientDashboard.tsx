// ============================================================
// PATIENT DASHBOARD — Arogya-Swarm HMS
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { patientAPI, aiAPI } from '../api/api';
import type { Appointment, ChatMessage, Prescription } from '../types';

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [stage, setStage] = useState<'intake' | 'chat' | 'booking' | 'history'>('intake');
  
  // App state
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('Male');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [validInteractionCount, setValidInteractionCount] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Rx state
  const [rxData, setRxData] = useState<Record<number, Prescription[]>>({});
  const [loadingRx, setLoadingRx] = useState<Record<number, boolean>>({});

  // Booking State
  const [problem, setProblem] = useState('');
  const [details, setDetails] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [bookedApt, setBookedApt] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const loadAppointments = async () => {
    try {
      const data = await patientAPI.getMyAppointments();
      setMyAppointments(data);
    } catch { /* silent */ }
  };

  const toggleRx = async (aptId: number) => {
    if (rxData[aptId]) {
      // Toggle off
      const newData = { ...rxData };
      delete newData[aptId];
      setRxData(newData);
      return;
    }
    
    setLoadingRx(prev => ({ ...prev, [aptId]: true }));
    try {
      const data = await patientAPI.getPrescriptions(aptId);
      setRxData(prev => ({ ...prev, [aptId]: data }));
    } catch {
      alert("Failed to load prescription.");
    } finally {
      setLoadingRx(prev => ({ ...prev, [aptId]: false }));
    }
  };

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStage('chat');
    setValidInteractionCount(0);
    setMessages([
      { role: 'assistant', text: `Hello ${user?.name}. I am Arogya Swarm's clinical AI. I need to ask you at least 3 medical questions before booking your appointment. What seems to be the problem today?` }
    ]);
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const newMsgs: ChatMessage[] = [...messages, { role: 'user', text: chatInput }];
    setMessages(newMsgs);
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await aiAPI.chat(newMsgs);
      setMessages(prev => [...prev, { role: 'assistant', text: res.reply }]);
      
      if (res.isValid) {
        setValidInteractionCount(prev => prev + 1);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error connecting to Gemini. Please try again or skip.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const proceedToBookingFromChat = async () => {
    setIsTyping(true);
    let summaryText = '';
    let conditionText = 'AI Triaged Condition';
    try {
      const sumRes = await aiAPI.summarize(messages);
      summaryText = sumRes.summary;
      if (sumRes.condition) conditionText = sumRes.condition;
    } catch {
      summaryText = messages.map(m => `${m.role}: ${m.text}`).join('\n'); // Fallback
    }
    setProblem(conditionText);
    setDetails(summaryText);
    setStage('booking');
    setIsTyping(false);
  };

  const skipToBooking = () => {
    setProblem('');
    setDetails('');
    setStage('booking');
  }

  const confirmBooking = async () => {
    setLoading(true);
    try {
      const apt = await patientAPI.bookAppointment({
        problem: problem || 'Manual Entry',
        details,
        patientAge: parseInt(age),
        patientSex: sex,
        aiSummary: details.length > 30 ? details : undefined
      });
      
      // We pass the details (which contains the AI summary if they went through the chat) 
      // as the booking notes. We can also optionally explicitly set the aiSummary field if we want,
      // but sending it in the details is what the user requested.
      setBookedApt({ ...apt, aiSummary: details.includes('AI Triaged Condition') || details.length > 50 ? details : '' });
      if (details && stage !== 'intake') {
        setAiSummary(details);
      }
      
      loadAppointments();
      setStage('history'); // Show completion screen
    } catch (e: any) {
      alert('Failed to book: ' + (e.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); window.location.href = '/login'; };
  const cancelFlow = () => { setStage('intake'); setMessages([]); };

  // Helper for progress bar
  const progressPercent = Math.min((validInteractionCount / 3) * 100, 100);

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* ── TOPBAR ── */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', marginBottom: '2rem', maxWidth: '1200px', margin: '0 auto 2rem auto', width: '100%', borderRadius: '16px' }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <i className="fas fa-heartbeat" style={{ color: 'var(--primary-light)' }}></i> 
          Patient Portal
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
            <button className={`btn-ghost`} style={{ padding: '0.6rem 1rem', background: stage === 'history' ? 'transparent' : 'var(--primary)', color: stage === 'history' ? 'var(--text-muted)' : '#fff', borderRadius: 0 }} onClick={() => setStage('intake')}>
              <i className="fas fa-plus"></i> New Booking
            </button>
            <button className={`btn-ghost`} style={{ padding: '0.6rem 1rem', background: stage === 'history' ? 'var(--primary)' : 'transparent', color: stage === 'history' ? '#fff' : 'var(--text-muted)', borderRadius: 0 }} onClick={() => setStage('history')}>
              <i className="fas fa-history"></i> My Records
            </button>
          </div>
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
          
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}><i className="fas fa-user-circle" style={{ marginRight: '0.5rem', color: 'var(--accent)' }}></i>{user?.name}</span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', flex: 1 }}>
        
        {/* STAGE 1: Intake */}
        {stage === 'intake' && (
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div className="glass-card" style={{ flex: '1', padding: '3rem 2rem', textAlign: 'center', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', opacity: 0.1, filter: 'blur(30px)' }}></div>
              <i className="fas fa-robot" style={{ fontSize: '4rem', color: 'var(--primary-light)', marginBottom: '1.5rem' }}></i>
              <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Start AI Triage</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>Answer a few quick questions about your symptoms to help our AI prepare a clinical brief for the doctor.</p>
              
              <form onSubmit={handleIntakeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxWidth: '350px', margin: '0 auto' }}>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Patient Age</label>
                  <input type="number" placeholder="Enter your Age" value={age} onChange={e => setAge(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-active)', color: 'white', outline: 'none', transition: '0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <label style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'block' }}>Biological Sex</label>
                  <select value={sex} onChange={e => setSex(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-active)', color: 'white', outline: 'none' }}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '1rem', borderRadius: '12px', padding: '1rem' }}>
                  Commence Triage <i className="fas fa-arrow-right" style={{ marginLeft: '0.5rem' }}></i>
                </button>
              </form>
            </div>
            
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '300px' }}>
              <div className="glass-card" style={{ padding: '2rem', borderRadius: '24px', flex: 1, background: 'linear-gradient(135deg, rgba(10,10,30,0.8), rgba(20,20,50,0.8))' }}>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent)' }}><i className="fas fa-info-circle"></i> Instructions</h3>
                <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', lineHeight: '1.8', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <li><strong>Step 1:</strong> Enter your basic demographics.</li>
                  <li><strong>Step 2:</strong> Chat with Gemini AI. You must interact at least <strong>3 times</strong> regarding your medical condition.</li>
                  <li><strong>Step 3:</strong> The AI will strictly reject non-medical chatter to save time.</li>
                  <li><strong>Step 4:</strong> Review and finalize your booking.</li>
                </ul>
                <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(0, 206, 201, 0.1)', border: '1px solid rgba(0, 206, 201, 0.3)', borderRadius: '12px', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <i className="fas fa-shield-alt" style={{ fontSize: '2rem', color: 'var(--accent)' }}></i>
                  <div style={{ fontSize: '0.9em', color: 'var(--text-primary)' }}>Your clinical data is end-to-end encrypted and safely transmitted to the doctor's queue.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: Chat */}
        {stage === 'chat' && (
          <div className="glass-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '700px', borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ background: 'linear-gradient(90deg, var(--primary-dark), var(--bg-tertiary))', padding: '1.2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.8rem', borderRadius: '12px' }}><i className="fas fa-robot" style={{ fontSize: '1.5rem', color: 'var(--primary-light)' }}></i></div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>Gemini Medical Assistant</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--success-light)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><div style={{ width: '8px', height: '8px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 8px var(--success)' }}></div> AI is listening...</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Required Interactions</div>
                  <div style={{ fontWeight: 700, color: validInteractionCount >= 3 ? 'var(--success)' : 'var(--warning)' }}>{validInteractionCount} / 3</div>
                </div>
                <div style={{ width: '60px', height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progressPercent}%`, background: validInteractionCount >= 3 ? 'var(--success)' : 'var(--warning)', transition: '0.3s' }}></div>
                </div>
                <button className="btn btn-sm btn-ghost" onClick={cancelFlow} style={{ color: 'var(--danger)' }}><i className="fas fa-times"></i> Cancel</button>
              </div>
            </div>
            
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--bg-primary)' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ 
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  display: 'flex', gap: '1rem', maxWidth: '80%',
                  flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: m.role === 'user' ? 'var(--accent)' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                    <i className={m.role === 'user' ? 'fas fa-user' : 'fas fa-robot'}></i>
                  </div>
                  <div style={{ 
                    background: m.role === 'user' ? 'var(--bg-tertiary)' : 'var(--glass-bg)',
                    border: '1px solid var(--border-light)',
                    padding: '1.2rem', borderRadius: '16px', lineHeight: 1.6,
                    borderTopRightRadius: m.role === 'user' ? 0 : '16px',
                    borderTopLeftRadius: m.role === 'assistant' ? 0 : '16px',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', gap: '1rem', maxWidth: '80%', alignSelf: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><i className="fas fa-robot"></i></div>
                  <div style={{ padding: '1.2rem', background: 'var(--glass-bg)', borderRadius: '16px', borderTopLeftRadius: 0, display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--primary-light)' }}>
                    <i className="fas fa-circle-notch fa-spin"></i> Processing medical data...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '1rem', background: 'var(--bg-secondary)' }}>
              <input 
                type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Describe your symptoms clearly (e.g. 'I have had a sharp pain in my stomach for 2 days')..." 
                disabled={isTyping}
                style={{ flex: 1, padding: '1.2rem', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-active)', color: 'white', outline: 'none', fontSize: '1rem', transition: '0.2s' }}
              />
              <button className="btn btn-primary" onClick={sendChat} disabled={isTyping || !chatInput.trim()} style={{ padding: '0 2rem', borderRadius: '12px', fontSize: '1.2rem' }}>
                <i className="fas fa-paper-plane"></i>
              </button>
              
              {validInteractionCount >= 3 ? (
                 <button className="btn btn-success" onClick={proceedToBookingFromChat} style={{ padding: '0 1.5rem', borderRadius: '12px', background: 'var(--success)', color: '#000', fontWeight: 700, boxShadow: '0 4px 15px rgba(0,184,148,0.4)', transition: '0.2s' }}>
                   Finish <i className="fas fa-check" style={{ marginLeft: '0.5rem' }}></i>
                 </button>
              ) : (
                <button className="btn btn-outline" onClick={skipToBooking} style={{ padding: '0 1.5rem', borderRadius: '12px' }}>Skip</button>
              )}
            </div>
          </div>
        )}

        {/* STAGE 3: Booking Confirmation */}
        {stage === 'booking' && (
          <div className="glass-card" style={{ padding: '3rem', maxWidth: '700px', margin: '0 auto', borderRadius: '24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(108,92,231,0.1)', color: 'var(--primary-light)', fontSize: '2.5rem', marginBottom: '1rem' }}>
                <i className="fas fa-calendar-check"></i>
              </div>
              <h2 style={{ color: 'var(--text-primary)' }}>Finalize Appointment</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Please review the gathered details before submitting to the doctor's queue.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Condition Summary</label>
                <input type="text" value={problem} onChange={e => setProblem(e.target.value)} required style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'white', fontSize: '1rem', outline: 'none' }} />
              </div>
              
              <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <label style={{ display: 'block', marginBottom: '0.8rem', color: 'var(--primary-light)', fontWeight: 600, fontSize: '0.9em', textTransform: 'uppercase', letterSpacing: '1px' }}>Detailed Notes / AI Chat Transcript</label>
                <textarea rows={6} value={details} onChange={e => setDetails(e.target.value)} style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.95rem', outline: 'none', lineHeight: '1.5' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
                <button className="btn btn-primary btn-lg" onClick={confirmBooking} disabled={loading} style={{ flex: 2, padding: '1.2rem', borderRadius: '12px', fontSize: '1.1rem' }}>
                  {loading ? <><i className="fas fa-spinner fa-spin" style={{ marginRight: '0.5rem' }}></i> Securing Appointment...</> : <><i className="fas fa-check-circle" style={{ marginRight: '0.5rem' }}></i> Confirm Appointment</>}
                </button>
                <button className="btn btn-outline btn-lg" onClick={cancelFlow} style={{ flex: 1, padding: '1.2rem', borderRadius: '12px' }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 4: History / Active Appointments */}
        {stage === 'history' && (
          <div>
            {bookedApt && (
              <div style={{ background: 'linear-gradient(135deg, rgba(0,184,148,0.2), rgba(0,206,201,0.1))', border: '1px solid var(--success)', padding: '2.5rem', width: '100%', borderRadius: '24px', marginBottom: '3rem', textAlign: 'center', boxShadow: 'var(--shadow-lg)' }}>
                <div style={{ display: 'inline-flex', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--success)', color: '#000', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(0,184,148,0.4)' }}>
                  <i className="fas fa-check"></i>
                </div>
                <h2 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Booking Successful!</h2>
                
                {bookedApt.status === 'pending' || !bookedApt.doctorName ? (
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                     Your case is under review. <strong style={{ color: 'var(--warning)', fontWeight: 600 }}>Your appointment token and doctor details will be assigned to you shortly.</strong>
                  </p>
                ) : (
                  <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
                    Your Appointment No is: <strong style={{ color: 'var(--success-light)', fontSize: '1.3em', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 1rem', borderRadius: '8px', marginLeft: '0.5rem' }}>{bookedApt.appointmentNo}</strong>
                  </p>
                )}
                
                {bookedApt.predictedTime && <div style={{ marginTop: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '0.8rem 1.5rem', borderRadius: '50px' }}><i className="fas fa-clock" style={{ color: 'var(--warning)' }}></i> Estimated Wait Time: <strong>{bookedApt.predictedTime}</strong></div>}
                
                {aiSummary && (
                  <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', borderLeft: '4px solid var(--primary-light)', textAlign: 'left', maxWidth: '600px', margin: '2rem auto 0' }}>
                    <div style={{ fontSize: '0.85em', color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: 700 }}><i className="fas fa-robot"></i> Attached AI Summary</div>
                    <p style={{ fontSize: '0.95em', color: 'var(--text-primary)', lineHeight: 1.6 }}>{aiSummary}</p>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><i className="fas fa-folder-open" style={{ color: 'var(--accent)' }}></i> Medical History</h3>
            </div>
            
            {myAppointments.length === 0 ? (
              <div className="glass-card" style={{ padding: '5rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px dashed var(--border-active)' }}>
                <div style={{ display: 'inline-flex', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-tertiary)', alignItems: 'center', justifyContent: 'center', fontSize: '3.5rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                  <i className="fas fa-file-medical"></i>
                </div>
                <h3 style={{ color: 'var(--text-secondary)' }}>No records found</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Looks like you haven't booked any appointments yet.</p>
                <button className="btn btn-primary btn-lg" onClick={() => setStage('intake')}><i className="fas fa-plus-circle" style={{ marginRight: '0.5rem' }}></i> Book New Appointment</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {myAppointments.map(a => (
                  <div key={a.id} className="glass-card" style={{ padding: '2rem', borderRadius: '16px', borderLeft: `6px solid ${a.status === 'completed' ? 'var(--success)' : a.status === 'assigned' ? 'var(--primary)' : 'var(--warning)'}`, transition: '0.3s', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem 1.5rem', background: a.status === 'completed' ? 'rgba(0,184,148,0.1)' : a.status === 'assigned' ? 'rgba(108,92,231,0.1)' : 'rgba(253,203,110,0.1)', borderBottomLeftRadius: '16px' }}>
                      <span className={`badge badge-${a.status}`} style={{ fontSize: '0.9em', padding: '0.4rem 1rem' }}>{a.status.toUpperCase()}</span>
                    </div>

                    <div style={{ paddingRight: '120px' }}>
                      <h4 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {a.doctorName && a.appointmentNo ? (
                          <span style={{ color: 'var(--accent)', background: 'rgba(0,206,201,0.1)', padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.8em', whiteSpace: 'nowrap' }}>
                            {a.appointmentNo}
                          </span> 
                        ) : null}
                        <span>{a.problem}</span>
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.95em', color: 'var(--text-muted)', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-calendar-alt" style={{ color: 'var(--primary-light)' }}></i> {new Date(a.createdAt || '').toLocaleString()}</div>
                        {a.doctorName ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fas fa-user-md" style={{ color: 'var(--accent)' }}></i> 
                            <span style={{ color: 'var(--text-primary)' }}>Dr. {a.doctorName}</span> 
                            <span style={{ fontSize: '0.85em', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{a.doctorSpeciality}</span>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
                            <i className="fas fa-hourglass-half"></i> Details will be displayed once assigned
                          </div>
                        )}
                      </div>
                    </div>

                    {a.status === 'completed' && (
                      <div style={{ marginTop: '2rem', background: 'linear-gradient(90deg, rgba(108,92,231,0.1), transparent)', borderLeft: '2px solid var(--primary)', padding: '1.2rem 1.5rem', borderRadius: '0 12px 12px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h5 style={{ color: 'var(--primary-light)', marginBottom: '0.3rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-prescription-bottle-alt"></i> Digital Prescription</h5>
                            <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Medication prescribed by Dr. {a.doctorName}</span>
                          </div>
                          <button className="btn btn-outline" style={{ borderRadius: '8px', borderColor: 'var(--primary-light)', color: 'var(--primary-light)' }} onClick={() => toggleRx(a.id)}>
                             <i className={`fas fa-${rxData[a.id] ? 'chevron-up' : 'eye'}`} style={{ marginRight: '0.5rem' }}></i> {rxData[a.id] ? 'Hide Rx' : 'View Rx'}
                          </button>
                        </div>
                        
                        {/* Prescription Inline Details */}
                        {loadingRx[a.id] && <div style={{ marginTop: '1.5rem', color: 'var(--primary-light)' }}><i className="fas fa-circle-notch fa-spin"></i> Loading metadata...</div>}
                        {rxData[a.id] && (
                          <div style={{ marginTop: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h6 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8em' }}>Prescribed Regimen</h6>
                            {rxData[a.id].length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No medications detailed.</p> : (
                              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', padding: 0, margin: 0, listStyle: 'none' }}>
                                {rxData[a.id].map(rx => (
                                  <li key={rx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--accent)' }}>
                                    <div>
                                      <strong style={{ color: 'var(--text-primary)', fontSize: '1.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <i className="fas fa-pills" style={{ color: 'var(--primary-light)', fontSize: '0.9em' }}></i> {rx.medicineName}
                                      </strong>
                                      <div style={{ fontSize: '0.85em', color: 'var(--text-muted)', marginTop: '0.3rem' }}>{rx.usage}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                      <span className="badge badge-spec" style={{ fontSize: '0.8em', background: 'rgba(108,92,231,0.2)', color: 'var(--primary-light)' }}>{rx.frequency}</span>
                                      <div style={{ marginTop: '0.4rem', color: 'var(--success-light)', fontSize: '0.85em', fontWeight: 600 }}>{rx.days} Day(s) Protocol</div>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientDashboard;
