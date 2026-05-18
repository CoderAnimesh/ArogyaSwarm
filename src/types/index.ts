// ============================================================
// AROGYA-SWARM HMS — TypeScript Type Definitions
// ============================================================

// ── User & Auth ──
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'doctor' | 'patient' | 'asha';
  speciality?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  expectedRole?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// ── Doctor ──
export interface Doctor {
  id: number;
  name: string;
  email: string;
  speciality?: string;
}

export interface AddDoctorPayload {
  name: string;
  email: string;
  password: string;
  speciality: string;
}

// ── Asha Worker ──
export interface AshaWorker {
  id: number;
  name: string;
  email: string;
}

export interface AddAshaPayload {
  name: string;
  email: string;
  password: string;
}

// ── Appointment ──
export interface Appointment {
  id: number;
  patientId: number;
  patientAge?: number;
  patientSex?: string;
  doctorId?: number;
  appointmentNo?: string;
  predictedTime?: string;
  problem: string;
  details?: string;
  aiSummary?: string;
  status: 'pending' | 'assigned' | 'completed';
  createdAt?: string;
  // Joined fields
  doctorName?: string;
  doctorSpeciality?: string;
  patientName?: string;
  patientEmail?: string;
}

export interface BookAppointmentPayload {
  problem: string;
  details: string;
  patientAge: number;
  patientSex: string;
  aiSummary?: string;
}

// ── Prescription ──
export interface Prescription {
  id: number;
  appointmentId: number;
  medicineId: number;
  usage: string;
  frequency?: string;
  days?: number;
  quantity?: number;
  medicineName?: string;
  prescribedAt?: string;
}

export interface PrescriptionItem {
  medicineId: number;
  usage: string;
  frequency: string;
  days: number;
}

// ── Medicine ──
export interface Medicine {
  id: number;
  name: string;
  stock: number;
  description?: string;
}

export interface AddMedicinePayload {
  name: string;
  stock: number;
}

// ── Asha Task ──
export interface AshaTask {
  id: number;
  ashaId: number;
  taskType: string;
  description: string;
  status: 'pending' | 'completed';
  createdAt?: string;
}

export interface AddAshaTaskPayload {
  ashaId: number;
  taskType: string;
  description: string;
}

// ── Admin Stats ──
export interface AdminStats {
  totalAppointments: number;
  pendingAppointments: number;
  assignedAppointments: number;
  completedAppointments: number;
  totalDoctors: number;
  totalPatients: number;
  totalAshas: number;
  totalMedicines: number;
  pendingTasks: number;
  completedTasks: number;
}

// ── Chat / AI ──
export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface TriageResponse {
  reply: string;
  isValid: boolean;
}

export interface SummarizeResponse {
  summary: string;
  condition?: string;
}

// ── Environment ──
export interface WeatherData {
  temp: number;
  feelsLike?: number;
  condition: string;
  description?: string;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
}

export interface WasteBreakdown {
  infectious: number;
  chemical: number;
  general: number;
}

export interface WasteData {
  totalPerHour: number;
  infectiousPerHour: number;
  chemicalPerHour: number;
  generalPerHour: number;
  dailyProjection: number;
  weeklyProjection: number;
  monthlyProjection: number;
  breakdown: WasteBreakdown;
}

export interface CarbonData {
  total: number;
  incineration: number;
  transport: number;
  dailyTotal: number;
}

export interface RiskData {
  alertLevel: string;
  alertColor: string;
  recommendation: string;
  tempMultiplier: number;
  humidityMultiplier: number;
  aerosolDispersion: string;
  waterContamination: string;
}

export interface TrendData {
  hours: string[];
  hourlyWaste: number[];
}

export interface EnvironmentImpact {
  weather: WeatherData;
  waste: WasteData;
  carbon: CarbonData;
  risk: RiskData;
  trends: TrendData;
  // Legacy format support
  impact?: {
    alertLevel: string;
    recommendation: string;
  };
}

// ── Navigation ──
export interface NavItem {
  id: string;
  icon: string;
  label: string;
}

export interface NavSection {
  section: string;
  items: NavItem[];
}
