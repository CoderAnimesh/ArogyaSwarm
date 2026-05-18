// ============================================================
// ADMIN DASHBOARD — Arogya-Swarm HMS
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI, envAPI } from '../api/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { SPECIALITIES, TASK_TYPES, ADMIN_SIDEBAR } from '../utils/constants';
import type { Doctor, AshaWorker, Appointment, Medicine, AshaTask, AdminStats, EnvironmentImpact } from '../types';
import '../assets/styles/admin.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activePanel, setActivePanel] = useState('overview');

  // Data State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [ashas, setAshas] = useState<AshaWorker[]>([]);
  const [ashaTasks, setAshaTasks] = useState<AshaTask[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [envData, setEnvData] = useState<EnvironmentImpact | null>(null);

  // Modal state
  const [modalDoc, setModalDoc] = useState<{ id: number; name: string } | null>(null);
  const [modalPatients, setModalPatients] = useState<Appointment[]>([]);

  // Form states
  const [docForm, setDocForm] = useState({ name: '', email: '', password: '', speciality: '' });
  const [ashaForm, setAshaForm] = useState({ name: '', email: '', password: '' });
  const [taskForm, setTaskForm] = useState({ ashaId: '', taskType: '', description: '' });
  const [medForm, setMedForm] = useState({ name: '', stock: '100' });

  const loadAll = useCallback(async () => {
    try {
      const [docs, ashaList] = await Promise.all([adminAPI.getDoctors(), adminAPI.getAshas()]);
      setDoctors(docs);
      setAshas(ashaList);
      const [s, apts, tasks, meds, env] = await Promise.all([
        adminAPI.getStats(), adminAPI.getAppointments(), adminAPI.getAshaTasks(),
        adminAPI.getMedicines(), envAPI.getImpact().catch(() => null)
      ]);
      setStats(s);
      setAppointments(apts);
      setAshaTasks(tasks);
      setMedicines(meds);
      if (env) setEnvData(env);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const assignDoctor = async (aptId: number, docId: string) => {
    if (!docId) return alert('Select a doctor');
    await adminAPI.assignDoctor(aptId, parseInt(docId));
    loadAll();
  };

  const showDoctorPatients = async (docId: number, docName: string) => {
    setModalDoc({ id: docId, name: docName });
    try {
      const pts = await adminAPI.getDoctorPatients(docId);
      setModalPatients(pts);
    } catch { setModalPatients([]); }
  };

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminAPI.addDoctor({ ...docForm, speciality: docForm.speciality });
    setDocForm({ name: '', email: '', password: '', speciality: '' });
    loadAll();
  };

  const handleAddAsha = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminAPI.addAsha(ashaForm);
    setAshaForm({ name: '', email: '', password: '' });
    loadAll();
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminAPI.addAshaTask({ ashaId: parseInt(taskForm.ashaId), taskType: taskForm.taskType, description: taskForm.description });
    setTaskForm({ ashaId: '', taskType: '', description: '' });
    loadAll();
  };

  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminAPI.addMedicine({ name: medForm.name, stock: parseInt(medForm.stock) });
    setMedForm({ name: '', stock: '100' });
    loadAll();
  };

  const handleLogout = () => { logout(); window.location.href = '/login'; };

  // ═══ RENDER ═══
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sb-brand"><i className="fas fa-heartbeat"></i><span>Arogya-Swarm</span></div>
        <div className="sb-user">
          <div className="sb-avatar">{(user?.name || 'A')[0].toUpperCase()}</div>
          <div><div className="sb-uname">{user?.name || 'Admin'}</div><div className="sb-urole">Administrator</div></div>
        </div>
        <nav className="sb-nav">
          {ADMIN_SIDEBAR.map(sec => (
            <div key={sec.section}>
              <div className="sb-label">{sec.section}</div>
              {sec.items.map(item => (
                <button
                  key={item.id}
                  className={`sb-link ${activePanel === item.id ? 'active' : ''}`}
                  onClick={() => setActivePanel(item.id)}
                >
                  <i className={item.icon}></i> {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sb-footer">
          <button className="sb-link" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {/* ─── OVERVIEW ─── */}
        {activePanel === 'overview' && (
          <div>
            <div className="page-title"><i className="fas fa-chart-pie"></i> Dashboard Overview</div>
            {stats && (
              <div className="stat-grid">
                <div className="stat-card"><div className="stat-val" style={{ color: 'var(--primary-light)' }}>{stats.totalAppointments}</div><div className="stat-label">Total Appointments</div></div>
                <div className="stat-card"><div className="stat-val" style={{ color: 'var(--warning)' }}>{stats.pendingAppointments}</div><div className="stat-label">Pending Queue</div></div>
                <div className="stat-card"><div className="stat-val" style={{ color: 'var(--accent)' }}>{stats.totalDoctors}</div><div className="stat-label">Doctors</div></div>
                <div className="stat-card"><div className="stat-val" style={{ color: 'var(--success)' }}>{stats.totalPatients}</div><div className="stat-label">Patients</div></div>
                <div className="stat-card"><div className="stat-val" style={{ color: 'var(--info, #74b9ff)' }}>{stats.totalAshas}</div><div className="stat-label">Asha Workers</div></div>
                <div className="stat-card"><div className="stat-val" style={{ color: 'var(--danger)' }}>{stats.totalMedicines}</div><div className="stat-label">Medicines</div></div>
              </div>
            )}
            {stats && (
              <div className="charts-row">
                <div className="glass-card" style={{ padding: '1.2rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Appointment Distribution</h4>
                  {(stats.pendingAppointments + stats.assignedAppointments + stats.completedAppointments) === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                      <i className="fas fa-calendar-times" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}></i>
                      No appointments yet
                    </div>
                  ) : (
                    <Doughnut data={{
                      labels: ['Pending', 'Assigned', 'Completed'],
                      datasets: [{ data: [stats.pendingAppointments, stats.assignedAppointments, stats.completedAppointments], backgroundColor: ['#6c5ce7', '#fdcb6e', '#00b894'], borderWidth: 0 }]
                    }} options={{ cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#a0a0b0', padding: 12 } } } }} />
                  )}
                </div>
                <div className="glass-card" style={{ padding: '1.2rem' }}>
                  <h4 style={{ marginBottom: '0.5rem' }}>Asha Task Status</h4>
                  {(stats.pendingTasks + stats.completedTasks) === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                      <i className="fas fa-clipboard-list" style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'block' }}></i>
                      No tasks assigned yet
                    </div>
                  ) : (
                    <Doughnut data={{
                      labels: ['Pending Tasks', 'Completed Tasks'],
                      datasets: [{ data: [stats.pendingTasks, stats.completedTasks], backgroundColor: ['#e17055', '#00b894'], borderWidth: 0 }]
                    }} options={{ cutout: '70%', plugins: { legend: { position: 'bottom', labels: { color: '#a0a0b0', padding: 12 } } } }} />
                  )}
                </div>
              </div>
            )}
            {envData && (
              <div className="glass-card" style={{ padding: '1.2rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}><i className="fas fa-leaf" style={{ color: '#00b894' }}></i> Environmental Impact & Waste Prediction</h4>
                <div className="env-widget">
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div><i className="fas fa-temperature-high"></i> {envData.weather.temp}°C</div>
                    <div><i className="fas fa-cloud"></i> {envData.weather.condition}</div>
                    <div><i className="fas fa-tint"></i> {envData.weather.humidity}%</div>
                  </div>
                  <div style={{ fontWeight: 600, color: envData.risk.alertColor }}>Alert: {envData.risk.alertLevel}</div>
                  <div style={{ fontSize: '0.85em' }}>Waste: <strong>{envData.waste.totalPerHour} kg/hr</strong> | CO₂: <strong>{envData.carbon.total} kg/hr</strong></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── APPOINTMENTS ─── */}
        {activePanel === 'appointments' && (
          <div>
            <div className="page-title"><i className="fas fa-calendar-check"></i> All Appointments</div>
            <table className="data-table">
              <thead><tr><th>Apt No</th><th>Patient</th><th>Condition</th><th>AI Summary</th><th>Status</th><th>Predicted Time</th><th>Action</th></tr></thead>
              <tbody>
                {appointments.map(a => (
                  <tr key={a.id}>
                    <td><strong style={{ color: 'var(--accent)' }}>{a.appointmentNo || `APT-${String(a.id).padStart(4, '0')}`}</strong><br /><span style={{ fontSize: '0.7em', color: 'var(--text-muted)' }}>#{a.id}</span></td>
                    <td>ID:{a.patientId} <span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>({a.patientAge || '?'}y, {a.patientSex || 'N/A'})</span></td>
                    <td><strong>{a.problem}</strong></td>
                    <td style={{ fontSize: '0.82em', color: 'var(--primary-light)', verticalAlign: 'top', maxWidth: '300px' }}>
                      {(a.aiSummary || a.details) ? <div style={{ whiteSpace: 'normal', wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.5 }}><i className="fas fa-robot" style={{ marginRight: '0.3rem' }}></i>{a.aiSummary || a.details}</div> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                    <td>{a.predictedTime ? <><i className="fas fa-clock" style={{ marginRight: '0.3rem', color: 'var(--warning)' }}></i><span style={{ fontSize: '0.85em' }}>{a.predictedTime}</span></> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                    <td>
                      {a.status === 'pending' ? (
                        <div className="form-inline">
                          <select id={`sel-${a.id}`} style={{ padding: '0.3rem', fontSize: '0.8rem' }} defaultValue="">
                            <option value="">--Doctor--</option>
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.speciality || 'General'})</option>)}
                          </select>
                          <button className="btn btn-sm btn-primary" onClick={() => {
                            const sel = document.getElementById(`sel-${a.id}`) as HTMLSelectElement;
                            assignDoctor(a.id, sel?.value || '');
                          }}>Assign</button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--success)', fontSize: '0.85em' }}>→ {doctors.find(d => d.id === a.doctorId)?.name || a.doctorId}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── DOCTORS ─── */}
        {activePanel === 'doctors' && (
          <div>
            <div className="page-title"><i className="fas fa-user-md"></i> Doctor Directory</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Click on a doctor's name to see their assigned patients.</p>
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Speciality</th></tr></thead>
              <tbody>
                {doctors.map(d => (
                  <tr key={d.id} className="clickable" onClick={() => showDoctorPatients(d.id, d.name)}>
                    <td>#{d.id}</td>
                    <td style={{ color: 'var(--primary-light)', fontWeight: 600 }}><i className="fas fa-user-md" style={{ marginRight: '0.4rem' }}></i>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.speciality ? <span className="badge badge-spec">{d.speciality}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h4 style={{ marginTop: '2rem' }}><i className="fas fa-plus-circle"></i> Add New Doctor</h4>
            <form className="admin-form" onSubmit={handleAddDoctor}>
              <input type="text" placeholder="Doctor Name" value={docForm.name} onChange={e => setDocForm({...docForm, name: e.target.value})} required />
              <input type="email" placeholder="Email" value={docForm.email} onChange={e => setDocForm({...docForm, email: e.target.value})} required />
              <input type="password" placeholder="Password" value={docForm.password} onChange={e => setDocForm({...docForm, password: e.target.value})} required />
              <select value={docForm.speciality} onChange={e => setDocForm({...docForm, speciality: e.target.value})} required>
                <option value="">-- Select Speciality --</option>
                {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="submit" className="btn btn-primary">Add Doctor</button>
            </form>
          </div>
        )}

        {/* ─── ASHA STAFF ─── */}
        {activePanel === 'asha-staff' && (
          <div>
            <div className="page-title"><i className="fas fa-user-nurse"></i> Asha Staff Directory</div>
            <table className="data-table">
              <thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {ashas.map(a => (
                  <tr key={a.id}><td>#{a.id}</td><td><i className="fas fa-user-nurse" style={{ marginRight: '0.4rem', color: 'var(--accent)' }}></i>{a.name}</td><td>{a.email}</td></tr>
                ))}
              </tbody>
            </table>
            <h4 style={{ marginTop: '2rem' }}><i className="fas fa-plus-circle"></i> Register New Asha Worker</h4>
            <form className="admin-form" onSubmit={handleAddAsha}>
              <input type="text" placeholder="Asha Name" value={ashaForm.name} onChange={e => setAshaForm({...ashaForm, name: e.target.value})} required />
              <input type="email" placeholder="Email" value={ashaForm.email} onChange={e => setAshaForm({...ashaForm, email: e.target.value})} required />
              <input type="password" placeholder="Password" value={ashaForm.password} onChange={e => setAshaForm({...ashaForm, password: e.target.value})} required />
              <button type="submit" className="btn btn-primary">Register Asha</button>
            </form>
          </div>
        )}

        {/* ─── ASHA TASKS ─── */}
        {activePanel === 'asha-tasks' && (
          <div>
            <div className="page-title"><i className="fas fa-tasks"></i> Asha Work Assigned</div>
            <h4><i className="fas fa-plus-circle"></i> Deploy New Task</h4>
            <form className="admin-form" onSubmit={handleAddTask} style={{ marginBottom: '2rem' }}>
              <select value={taskForm.ashaId} onChange={e => setTaskForm({...taskForm, ashaId: e.target.value})} required>
                <option value="">-- Select Asha Worker --</option>
                {ashas.map(a => <option key={a.id} value={a.id}>{a.name} (#{a.id})</option>)}
              </select>
              <select value={taskForm.taskType} onChange={e => setTaskForm({...taskForm, taskType: e.target.value})} required>
                <option value="">-- Task Type --</option>
                {TASK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="text" placeholder="Specific details (e.g. Ward 4 Bed 2)" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} required />
              <button type="submit" className="btn btn-primary">Deploy Task</button>
            </form>
            <table className="data-table">
              <thead><tr><th>Task ID</th><th>Asha Worker</th><th>Type</th><th>Details</th><th>Status</th></tr></thead>
              <tbody>
                {ashaTasks.map(t => (
                  <tr key={t.id}>
                    <td>#{t.id}</td>
                    <td><i className="fas fa-user-nurse" style={{ marginRight: '0.3rem', color: 'var(--accent)' }}></i>{ashas.find(a => a.id === t.ashaId)?.name || `#${t.ashaId}`}</td>
                    <td>{t.taskType}</td>
                    <td style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>{t.description}</td>
                    <td><span className={`badge badge-${t.status === 'completed' ? 'completed' : 'pending'}`}>{t.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── MEDICINES ─── */}
        {activePanel === 'medicines' && (
          <div>
            <div className="page-title"><i className="fas fa-pills"></i> Medicine Inventory</div>
            <table className="data-table">
              <thead><tr><th>ID</th><th>Medicine Name</th><th>Stock</th></tr></thead>
              <tbody>
                {medicines.map(m => (
                  <tr key={m.id}><td>#{m.id}</td><td>{m.name}</td><td><span style={m.stock < 10 ? { color: 'var(--danger)', fontWeight: 700 } : {}}>{m.stock}</span></td></tr>
                ))}
              </tbody>
            </table>
            <h4 style={{ marginTop: '2rem' }}><i className="fas fa-plus-circle"></i> Add Medicine</h4>
            <form className="admin-form" onSubmit={handleAddMedicine}>
              <input type="text" placeholder="Medicine Name" value={medForm.name} onChange={e => setMedForm({...medForm, name: e.target.value})} required />
              <input type="number" placeholder="Stock" value={medForm.stock} onChange={e => setMedForm({...medForm, stock: e.target.value})} required />
              <button type="submit" className="btn btn-primary">Add Medicine</button>
            </form>
          </div>
        )}

        {/* ─── ENVIRONMENT ─── */}
        {activePanel === 'environment' && envData && (
          <div>
            <div className="page-title"><i className="fas fa-leaf" style={{ color: '#00b894' }}></i> Environmental Impact Intelligence</div>
            {/* Weather Banner */}
            <div style={{ background: 'linear-gradient(135deg,rgba(0,184,148,0.15),rgba(0,206,201,0.1))', border: '1px solid rgba(0,184,148,0.3)', borderRadius: '12px', padding: '1.2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)' }}>{envData.weather.temp}°C</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Feels like {envData.weather.feelsLike || envData.weather.temp}°C</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{envData.weather.condition}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{envData.weather.description || ''}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}><i className="fas fa-tint" style={{ color: '#74b9ff' }}></i><div style={{ fontWeight: 700 }}>{envData.weather.humidity}%</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Humidity</div></div>
                  <div style={{ textAlign: 'center' }}><i className="fas fa-wind" style={{ color: '#81ecec' }}></i><div style={{ fontWeight: 700 }}>{envData.weather.windSpeed} m/s</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Wind</div></div>
                  <div style={{ textAlign: 'center' }}><i className="fas fa-tachometer-alt" style={{ color: '#dfe6e9' }}></i><div style={{ fontWeight: 700 }}>{envData.weather.pressure} hPa</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Pressure</div></div>
                  <div style={{ textAlign: 'center' }}><i className="fas fa-eye" style={{ color: '#a29bfe' }}></i><div style={{ fontWeight: 700 }}>{(envData.weather.visibility / 1000).toFixed(1)} km</div><div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Visibility</div></div>
                </div>
              </div>
            </div>
            {/* Risk Alert */}
            <div style={{ background: `linear-gradient(135deg, ${envData.risk.alertColor}22, ${envData.risk.alertColor}11)`, border: `1px solid ${envData.risk.alertColor}`, borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.5rem' }}>
                <i className="fas fa-exclamation-triangle" style={{ color: envData.risk.alertColor, fontSize: '1.2rem' }}></i>
                <strong style={{ color: envData.risk.alertColor, fontSize: '1.1rem' }}>Alert Level: {envData.risk.alertLevel}</strong>
              </div>
              <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{envData.risk.recommendation}</p>
            </div>
            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="glass-card" style={{ padding: '1.2rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}><i className="fas fa-chart-pie" style={{ color: 'var(--accent)' }}></i> Waste Type Breakdown</h4>
                {(envData.waste.breakdown.infectious + envData.waste.breakdown.chemical + envData.waste.breakdown.general) === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No data</div>
                ) : (
                  <Doughnut data={{
                    labels: ['Infectious', 'Chemical', 'General'],
                    datasets: [{ data: [envData.waste.breakdown.infectious, envData.waste.breakdown.chemical, envData.waste.breakdown.general], backgroundColor: ['#ff6b6b', '#fdcb6e', '#636e72'], borderWidth: 0 }]
                  }} options={{ cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#a0a0b0', padding: 14 } } } }} />
                )}
              </div>
              <div className="glass-card" style={{ padding: '1.2rem' }}>
                <h4 style={{ marginBottom: '0.5rem' }}><i className="fas fa-smog" style={{ color: 'var(--warning)' }}></i> Carbon Footprint Sources</h4>
                {(envData.carbon.incineration + envData.carbon.transport) === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No data</div>
                ) : (
                  <Doughnut data={{
                    labels: ['Incineration', 'Transport'],
                    datasets: [{ data: [envData.carbon.incineration, envData.carbon.transport], backgroundColor: ['#e17055', '#74b9ff'], borderWidth: 0 }]
                  }} options={{ cutout: '65%', plugins: { legend: { position: 'bottom', labels: { color: '#a0a0b0', padding: 14 } } } }} />
                )}
              </div>
            </div>
            {/* Hourly Trend */}
            <div className="glass-card" style={{ padding: '1.2rem', marginBottom: '1.5rem' }}>
              <h4 style={{ marginBottom: '0.5rem' }}><i className="fas fa-chart-area" style={{ color: 'var(--primary-light)' }}></i> 24-Hour Waste Generation Trend (kg/hr)</h4>
              <Line data={{
                labels: envData.trends.hours,
                datasets: [{ label: 'Waste (kg/hr)', data: envData.trends.hourlyWaste, borderColor: '#00b894', backgroundColor: 'rgba(0,184,148,0.1)', fill: true, tension: 0.4, pointRadius: 2, pointHoverRadius: 5, borderWidth: 2 }]
              }} options={{
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#6b6b8d' } }, x: { grid: { display: false }, ticks: { color: '#6b6b8d', maxTicksLimit: 12 } } },
                plugins: { legend: { display: false } }
              }} />
            </div>
            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="stat-card"><div className="stat-val" style={{ color: 'var(--danger)' }}>{envData.waste.totalPerHour}</div><div className="stat-label">Total Waste (kg/hr)</div></div>
              <div className="stat-card"><div className="stat-val" style={{ color: '#ff6b6b' }}>{envData.waste.infectiousPerHour}</div><div className="stat-label">Infectious Waste (kg/hr)</div></div>
              <div className="stat-card"><div className="stat-val" style={{ color: 'var(--warning)' }}>{envData.waste.chemicalPerHour}</div><div className="stat-label">Chemical Waste (kg/hr)</div></div>
              <div className="stat-card"><div className="stat-val" style={{ color: 'var(--text-muted)' }}>{envData.waste.generalPerHour}</div><div className="stat-label">General Waste (kg/hr)</div></div>
              <div className="stat-card"><div className="stat-val" style={{ color: 'var(--accent)' }}>{envData.waste.dailyProjection}</div><div className="stat-label">Daily Projection (kg)</div></div>
              <div className="stat-card"><div className="stat-val" style={{ color: 'var(--primary-light)' }}>{envData.waste.weeklyProjection}</div><div className="stat-label">Weekly Projection (kg)</div></div>
              <div className="stat-card"><div className="stat-val" style={{ color: '#fdcb6e' }}>{envData.carbon.dailyTotal}</div><div className="stat-label">Daily CO₂ (kg CO₂e)</div></div>
              <div className="stat-card"><div className="stat-val" style={{ color: '#81ecec' }}>{envData.waste.monthlyProjection}</div><div className="stat-label">Monthly Projection (kg)</div></div>
            </div>
            {/* Risk Matrix */}
            <div className="glass-card" style={{ padding: '1.2rem' }}>
              <h4 style={{ marginBottom: '0.8rem' }}><i className="fas fa-shield-alt" style={{ color: 'var(--danger)' }}></i> Risk Assessment Matrix</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.8rem' }}>
                {[
                  { name: 'Bio-Waste Decomposition', level: envData.risk.alertLevel, color: envData.risk.alertColor, factor: `Temp ×${envData.risk.tempMultiplier}`, icon: 'fa-biohazard' },
                  { name: 'Aerosol Dispersion', level: envData.risk.aerosolDispersion, color: envData.risk.aerosolDispersion === 'Critical' ? '#ee5a24' : envData.risk.aerosolDispersion === 'High' ? '#ff6b6b' : envData.risk.aerosolDispersion === 'Moderate' ? '#fdcb6e' : '#00b894', factor: `Wind ${envData.weather.windSpeed}m/s`, icon: 'fa-wind' },
                  { name: 'Water Contamination', level: envData.risk.waterContamination, color: envData.risk.waterContamination === 'High' ? '#ff6b6b' : envData.risk.waterContamination === 'Moderate' ? '#fdcb6e' : '#00b894', factor: `Humidity ×${envData.risk.humidityMultiplier}`, icon: 'fa-water' },
                  { name: 'Pathogen Multiplication', level: envData.weather.temp > 35 ? 'High' : envData.weather.temp > 28 ? 'Moderate' : 'Low', color: envData.weather.temp > 35 ? '#ff6b6b' : envData.weather.temp > 28 ? '#fdcb6e' : '#00b894', factor: `${envData.weather.temp}°C`, icon: 'fa-virus' }
                ].map((r, i) => (
                  <div key={i} style={{ background: `${r.color}11`, border: `1px solid ${r.color}44`, borderRadius: '8px', padding: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <i className={`fas ${r.icon}`} style={{ color: r.color }}></i>
                      <span style={{ fontWeight: 600, fontSize: '0.9em' }}>{r.name}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: r.color, fontWeight: 700 }}>{r.level}</span>
                      <span style={{ fontSize: '0.75em', color: 'var(--text-muted)' }}>{r.factor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Doctor Patients Modal */}
      {modalDoc && (
        <div className="modal-overlay active" onClick={() => setModalDoc(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Patients Assigned to Dr. {modalDoc.name}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setModalDoc(null)}><i className="fas fa-times"></i></button>
            </div>
            {modalPatients.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>No patients assigned to this doctor yet.</p>
            ) : (
              <table className="data-table">
                <thead><tr><th>Apt ID</th><th>Patient</th><th>Age/Sex</th><th>Condition</th><th>AI Summary</th><th>Status</th></tr></thead>
                <tbody>
                  {modalPatients.map(p => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td><strong>{p.patientName}</strong><br /><span style={{ fontSize: '0.8em', color: 'var(--text-muted)' }}>{p.patientEmail}</span></td>
                      <td>{p.patientAge || '?'}y, {p.patientSex || 'N/A'}</td>
                      <td>{p.problem}</td>
                      <td style={{ fontSize: '0.8em', color: 'var(--primary-light)' }}>{(p.aiSummary || p.details) ? (p.aiSummary || p.details)?.substring(0, 100) + '...' : '—'}</td>
                      <td><span className={`badge badge-${p.status}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
