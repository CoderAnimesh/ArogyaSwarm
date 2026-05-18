// ============================================================
// APP ENTRY & ROUTING — Arogya-Swarm HMS
// ============================================================
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import AshaDashboard from './pages/AshaDashboard';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboards */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/doctor" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/patient" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/asha" element={
            <ProtectedRoute allowedRoles={['asha']}>
              <AshaDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
