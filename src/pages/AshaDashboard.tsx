// ============================================================
// ASHA WORKER DASHBOARD — Arogya-Swarm HMS
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { ashaAPI } from '../api/api';
import type { AshaTask } from '../types';

const AshaDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<AshaTask[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ashaAPI.getTasks();
      setTasks(data);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const handleComplete = async (taskId: number) => {
    try {
      await ashaAPI.completeTask(taskId);
      loadTasks();
    } catch (e: any) {
      alert('Error: ' + (e.response?.data?.error || 'Failed to update task'));
    }
  };

  const handleLogout = () => { logout(); window.location.href = '/login'; };

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2><i className="fas fa-user-nurse" style={{ color: 'var(--accent)', marginRight: '1rem' }}></i>Asha Operations Portal</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 600 }}>{user?.name} (ID: #{user?.id})</span>
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        
        {/* Pending Tasks */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--warning)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <i className="fas fa-clock"></i> Pending Duties ({pendingTasks.length})
          </h3>
          {loading ? <p>Loading...</p> : pendingTasks.length === 0 ? <p className="text-muted">No pending tasks. Great job!</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingTasks.map(t => (
                <div key={t.id} style={{ padding: '1rem', background: 'rgba(253, 203, 110, 0.05)', border: '1px solid var(--warning)', borderRadius: '8px', borderLeft: '4px solid var(--warning)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 0.3rem 0' }}>{t.taskType}</h4>
                      <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>Task #{t.id} • {new Date(t.createdAt || '').toLocaleString()}</div>
                      <p style={{ marginTop: '0.5rem', fontSize: '0.95em' }}>{t.description}</p>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ marginTop: '1rem', width: '100%' }} onClick={() => handleComplete(t.id)}>
                    <i className="fas fa-check-circle"></i> Mark Completed
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Tasks */}
        <div className="glass-card" style={{ padding: '1.5rem', opacity: 0.8 }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--success)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <i className="fas fa-check-double"></i> Completed Duties ({completedTasks.length})
          </h3>
          {loading ? <p>Loading...</p> : completedTasks.length === 0 ? <p className="text-muted">No completed tasks yet.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {completedTasks.map(t => (
                <div key={t.id} style={{ padding: '1rem', background: 'rgba(0, 184, 148, 0.05)', border: '1px solid var(--border-color)', borderRadius: '8px', borderLeft: '4px solid var(--success)' }}>
                  <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--text-secondary)' }}>{t.taskType}</h4>
                  <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>Task #{t.id}</div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9em', color: 'var(--text-muted)' }}>{t.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AshaDashboard;
