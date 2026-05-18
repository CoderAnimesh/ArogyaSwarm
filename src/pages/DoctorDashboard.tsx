// ============================================================
// DOCTOR DASHBOARD — Arogya-Swarm HMS
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { doctorAPI, adminAPI, envAPI } from '../api/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { FREQUENCIES, FREQ_MAP } from '../utils/constants';
import type { Appointment, Medicine, EnvironmentImpact, PrescriptionItem } from '../types';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface RxRow {
  medId: string;
  freq: string;
  days: string;
}

const DoctorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [envData, setEnvData] = useState<EnvironmentImpact | null>(null);
  const [rxMap, setRxMap] = useState<Record<number, RxRow[]>>({});

  const loadData = useCallback(async () => {
    try {
      const [meds, apts] = await Promise.all([
        adminAPI.getMedicines(),
        doctorAPI.getAppointments(),
      ]);
      setMedicines(meds);
      setAppointments(apts);
      // Init rx rows for pending appointments
      const map: Record<number, RxRow[]> = {};
      apts.filter(a => a.status !== 'completed').forEach(a => {
        map[a.id] = [{ medId: '', freq: 'Once a day', days: '5' }];
      });
      setRxMap(map);
    } catch (e) { console.error(e); }
  }, []);

  const loadEnv = useCallback(async () => {
    try {
      const data = await envAPI.getImpact();
      setEnvData(data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { loadData(); loadEnv(); }, [loadData, loadEnv]);

  const addMedRow = (aptId: number) => {
    setRxMap(prev => ({
      ...prev,
      [aptId]: [...(prev[aptId] || []), { medId: '', freq: 'Once a day', days: '5' }]
    }));
  };

  const removeMedRow = (aptId: number, idx: number) => {
    setRxMap(prev => ({
      ...prev,
      [aptId]: prev[aptId].filter((_, i) => i !== idx)
    }));
  };

  const updateRxRow = (aptId: number, idx: number, field: keyof RxRow, value: string) => {
    setRxMap(prev => ({
      ...prev,
      [aptId]: prev[aptId].map((r, i) => i === idx ? { ...r, [field]: value } : r)
    }));
  };

  const calcQty = (freq: string, days: string) => {
    const perDay = FREQ_MAP[freq] || 1;
    return Math.ceil(perDay * (parseInt(days) || 0));
  };

  const submitPrescription = async (aptId: number) => {
    const rows = rxMap[aptId] || [];
    if (rows.length === 0) return alert('Please add at least one medicine');
    const items: PrescriptionItem[] = [];
    for (const row of rows) {
      if (!row.medId || !row.freq || !row.days) return alert('Please fill all fields for each medicine');
      const medName = medicines.find(m => m.id === parseInt(row.medId))?.name || '';
      items.push({
        medicineId: parseInt(row.medId),
        usage: `${medName} - ${row.freq} for ${row.days} days`,
        frequency: row.freq,
        days: parseInt(row.days),
      });
    }
    try {
      await doctorAPI.prescribe(aptId, items);
      alert(`${items.length} medicine(s) prescribed successfully!`);
      loadData();
    } catch (e: any) {
      alert('Error: ' + (e.response?.data?.error || 'Connection error'));
    }
  };

  const handleLogout = () => { logout(); window.location.href = '/login'; };

  const pendingApts = appointments.filter(a => a.status !== 'completed');
  const completedApts = appointments.filter(a => a.status === 'completed');

  return (
    <div style={{ padding: '2rem' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2>Doctor Analytics & Action Queue</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>Dr. {user?.name}</span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* LEFT: Patient Queue */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Assigned Patients (Action Required)</h3>
          {appointments.length === 0 ? (
            <p>Your queue is clear.</p>
          ) : (
            <>
              {/* Completed */}
              {completedApts.map(a => (
                <div key={a.id} className="apt-item-doc" style={{ opacity: 0.6, borderLeft: '4px solid var(--success)' }}>
                  <h4>Patient ID: #{a.patientId}</h4>
                  {(a.patientAge || a.patientSex) && (
                    <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>
                      <i className="fas fa-user"></i> {a.patientAge || '?'}y, {a.patientSex || 'N/A'}
                    </div>
                  )}
                  <p>Problem: {a.problem}</p>
                  <div style={{ marginTop: '0.5rem', color: 'var(--success)' }}>
                    <i className="fas fa-check-circle"></i> Resolved & Prescribed
                  </div>
                </div>
              ))}
              {/* Pending */}
              {pendingApts.map(a => (
                <div key={a.id} className="apt-item-doc" style={{ borderLeft: '4px solid var(--warning)' }}>
                  <h4 style={{ fontSize: '1.2em' }}>
                    Patient ID: #{a.patientId}
                    {a.appointmentNo && <span style={{ fontSize: '0.7em', color: 'var(--accent)', marginLeft: '0.5rem' }}>{a.appointmentNo}</span>}
                  </h4>
                  {(a.patientAge || a.patientSex) && (
                    <div style={{ display: 'inline-flex', gap: '1rem', background: 'rgba(108,92,231,0.05)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85em', marginTop: '0.3rem' }}>
                      <span><i className="fas fa-birthday-cake"></i> {a.patientAge || '?'} years</span>
                      <span><i className="fas fa-venus-mars"></i> {a.patientSex || 'N/A'}</span>
                    </div>
                  )}
                  <p style={{ fontSize: '1.1em', marginTop: '0.3rem' }}><strong>Condition:</strong> {a.problem}</p>
                  {(a.aiSummary || a.details) ? (
                    <div style={{ background: 'rgba(108,92,231,0.1)', borderLeft: '3px solid var(--primary-light)', padding: '0.8rem', borderRadius: '0 4px 4px 0', margin: '1rem 0' }}>
                      <strong style={{ color: 'var(--primary-light)' }}><i className="fas fa-robot"></i> {a.aiSummary ? 'Gemini AI Summary' : 'Detailed Notes'}:</strong>
                      <p style={{ marginTop: '0.3rem', fontSize: '0.9em' }}>{a.aiSummary || a.details}</p>
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.85em', color: 'var(--text-muted)', margin: '1rem 0' }}>Notes: None</p>
                  )}

                  {/* Prescription Form */}
                  <div className="rx-zone">
                    <label style={{ fontSize: '0.85em', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span><i className="fas fa-prescription-bottle-alt"></i> Prescription (add up to 20 medicines)</span>
                    </label>
                    <div className="rx-row rx-header" style={{ marginTop: '0.5rem' }}>
                      <span>Medicine</span><span>Frequency</span><span>Days</span><span>Qty</span><span></span>
                    </div>
                    {(rxMap[a.id] || []).map((row, idx) => (
                      <div key={idx} className="rx-row">
                        <select className="rx-med" value={row.medId} onChange={e => updateRxRow(a.id, idx, 'medId', e.target.value)} required>
                          <option value="">-- Medicine --</option>
                          {medicines.filter(m => m.stock > 0).map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.stock})</option>
                          ))}
                        </select>
                        <select className="rx-freq" value={row.freq} onChange={e => updateRxRow(a.id, idx, 'freq', e.target.value)} required>
                          {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <input type="number" className="rx-days" placeholder="Days" min={1} value={row.days} onChange={e => updateRxRow(a.id, idx, 'days', e.target.value)} required />
                        <div className="rx-calc">Qty: {calcQty(row.freq, row.days)}</div>
                        <button type="button" className="rx-remove" onClick={() => removeMedRow(a.id, idx)}><i className="fas fa-trash"></i></button>
                      </div>
                    ))}
                    <button type="button" className="rx-add" onClick={() => addMedRow(a.id)}>
                      <i className="fas fa-plus"></i> Add Medicine
                    </button>
                    <button className="btn btn-primary" style={{ marginTop: '0.7rem', width: '100%' }} onClick={() => submitPrescription(a.id)}>
                      <i className="fas fa-file-medical"></i> Issue Prescription
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* RIGHT Column */}
        <div>
          {/* Chart */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3><i className="fas fa-chart-line"></i> Patient Volume</h3>
            <Bar data={{
              labels: ['Pending Queue', 'Completed'],
              datasets: [{ label: 'Patients', data: [pendingApts.length, completedApts.length], backgroundColor: ['#fdcb6e', '#00b894'] }]
            }} options={{ scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } }} />
          </div>

          {/* Env Widget */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}><i className="fas fa-leaf" style={{ color: '#00b894' }}></i> Environment Risk</h3>
            <div className="env-widget-doc">
              {envData ? (
                <>
                  <div style={{ fontSize: '1.2em', marginBottom: '0.5rem' }}>{envData.weather.temp}°C, {envData.weather.condition}</div>
                  <div style={{ fontWeight: 600, color: envData.risk?.alertLevel?.includes('High') ? 'var(--danger)' : 'var(--success)' }}>
                    Waste Alert: {envData.risk?.alertLevel || envData.impact?.alertLevel || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.85em', marginTop: '0.5rem', color: 'var(--text-muted)' }}>
                    <i className="fas fa-exclamation-triangle"></i> Recommendation: {envData.risk?.recommendation || envData.impact?.recommendation || 'N/A'}
                  </div>
                </>
              ) : <em>Loading local bio-hazard weather data...</em>}
            </div>
          </div>

          {/* Pharmacy Stock */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Pharmacy Stock</h3>
            <table className="list-tbl">
              <thead><tr><th>Medicine</th><th>Stock</th></tr></thead>
              <tbody>
                {medicines.map(m => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td><span style={m.stock < 10 ? { color: 'var(--danger)' } : {}}>{m.stock}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
