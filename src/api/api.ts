// ============================================================
// AROGYA-SWARM HMS — Centralized API Layer
// ============================================================
import axios from 'axios';
import type {
  AuthResponse, LoginPayload, RegisterPayload,
  AdminStats, Appointment, Doctor, AshaWorker, Medicine,
  AshaTask, AddDoctorPayload, AddAshaPayload, AddMedicinePayload,
  AddAshaTaskPayload, PrescriptionItem, Prescription,
  ChatMessage, TriageResponse, SummarizeResponse,
  EnvironmentImpact, BookAppointmentPayload,
} from '../types';

const api = axios.create({
  // Vite proxy (vite.config.ts) forwards /api/* → https://arogyaswarm-backend.onrender.com
  // This avoids CORS since the browser sees it as a same-origin request
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Auth Interceptor ──
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════
export const authAPI = {
  login: (data: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),

  register: (data: RegisterPayload) =>
    api.post('/auth/register', data).then(r => r.data),
};

// ════════════════════════════════════════════
// ADMIN
// ════════════════════════════════════════════
export const adminAPI = {
  getStats: () =>
    api.get<AdminStats>('/admin/stats').then(r => r.data),

  getAppointments: () =>
    api.get<Appointment[]>('/admin/appointments').then(r => r.data),

  assignDoctor: (aptId: number, doctorId: number) =>
    api.post(`/admin/appointments/${aptId}/assign`, { doctorId }).then(r => r.data),

  getDoctors: () =>
    api.get<Doctor[]>('/admin/doctors').then(r => r.data),

  addDoctor: (data: AddDoctorPayload) =>
    api.post('/admin/doctors', data).then(r => r.data),

  getDoctorPatients: (docId: number) =>
    api.get<Appointment[]>(`/admin/doctors/${docId}/patients`).then(r => r.data),

  getAshas: () =>
    api.get<AshaWorker[]>('/admin/ashas').then(r => r.data),

  addAsha: (data: AddAshaPayload) =>
    api.post('/admin/ashas', data).then(r => r.data),

  getAshaTasks: () =>
    api.get<AshaTask[]>('/admin/asha-tasks').then(r => r.data),

  addAshaTask: (data: AddAshaTaskPayload) =>
    api.post('/admin/asha-tasks', data).then(r => r.data),

  getMedicines: () =>
    api.get<Medicine[]>('/admin/medicines').then(r => r.data),

  addMedicine: (data: AddMedicinePayload) =>
    api.post('/admin/medicines', data).then(r => r.data),
};

// ════════════════════════════════════════════
// DOCTOR
// ════════════════════════════════════════════
export const doctorAPI = {
  getAppointments: () =>
    api.get<Appointment[]>('/doctor/appointments').then(r => r.data),

  prescribe: (aptId: number, items: PrescriptionItem[]) =>
    api.post(`/doctor/appointments/${aptId}/prescribe`, { items }).then(r => r.data),
};

// ════════════════════════════════════════════
// PATIENT
// ════════════════════════════════════════════
export const patientAPI = {
  bookAppointment: (data: BookAppointmentPayload) =>
    api.post<Appointment>('/appointments/book', data).then(r => r.data),

  getMyAppointments: () =>
    api.get<Appointment[]>('/appointments').then(r => r.data),

  getPrescriptions: (aptId: number) =>
    api.get<Prescription[]>(`/appointments/${aptId}/prescriptions`).then(r => r.data),
};

// ════════════════════════════════════════════
// AI
// ════════════════════════════════════════════
export const aiAPI = {
  chat: (messages: ChatMessage[]) =>
    api.post<TriageResponse>('/ai/chat', { messages }).then(r => r.data),

  summarize: (messages: ChatMessage[], appointmentId?: number) =>
    api.post<SummarizeResponse>('/ai/summarize', { messages, appointmentId }).then(r => r.data),
};

// ════════════════════════════════════════════
// ENVIRONMENT
// ════════════════════════════════════════════
export const envAPI = {
  getImpact: () =>
    api.get<EnvironmentImpact>('/environment/impact').then(r => r.data),
};

// ════════════════════════════════════════════
// ASHA
// ════════════════════════════════════════════
export const ashaAPI = {
  getTasks: () =>
    api.get<AshaTask[]>('/asha/tasks').then(r => r.data),

  completeTask: (taskId: number) =>
    api.post(`/asha/tasks/${taskId}/complete`).then(r => r.data),
};

export default api;
