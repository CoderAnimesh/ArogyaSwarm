// ============================================================
// AROGYA-SWARM HMS — Constants & Configuration
// ============================================================

export const COMMON_DISEASES = [
  'Fever', 'Common Cold', 'Cough & Flu', 'Headache',
  'Body Pain', 'Stomach Ache', 'Diarrhea', 'Skin Rash',
  'Diabetes Checkup', 'Blood Pressure', 'Asthma', 'Allergy',
  'Eye Problem', 'Ear Infection', 'Dental Pain', 'Other'
];

export const FREQUENCIES = [
  'Once a day', 'Twice a day', 'Thrice a day',
  'Four times a day', 'Once a week', 'As needed'
];

export const FREQ_MAP: Record<string, number> = {
  'Once a day': 1,
  'Twice a day': 2,
  'Thrice a day': 3,
  'Four times a day': 4,
  'Once a week': 1 / 7,
  'As needed': 1,
};

export const SPECIALITIES = [
  'General Physician', 'Surgeon', 'Cardiologist', 'Dermatologist',
  'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist',
  'Gynecologist', 'ENT Specialist', 'Ophthalmologist', 'Dentist',
  'Radiologist', 'Anesthesiologist', 'Pulmonologist', 'Urologist',
  'Oncologist', 'Nephrologist', 'Pathologist', 'Other',
];

export const TASK_TYPES = [
  'Cleaning & Sanitation',
  'Nursing Assistance',
  'Ward Caring',
  'Patient Transport',
  'Medicine Delivery',
];

export const ADMIN_SIDEBAR = [
  { section: 'Overview', items: [
    { id: 'overview', icon: 'fas fa-chart-pie', label: 'Dashboard' },
    { id: 'appointments', icon: 'fas fa-calendar-check', label: 'Appointments' },
  ]},
  { section: 'Staff', items: [
    { id: 'doctors', icon: 'fas fa-user-md', label: 'Doctor Directory' },
    { id: 'asha-staff', icon: 'fas fa-user-nurse', label: 'Asha Staff Directory' },
    { id: 'asha-tasks', icon: 'fas fa-tasks', label: 'Asha Work Assigned' },
  ]},
  { section: 'Inventory', items: [
    { id: 'medicines', icon: 'fas fa-pills', label: 'Medicine Stocks' },
  ]},
  { section: 'Intelligence', items: [
    { id: 'environment', icon: 'fas fa-leaf', label: 'Environment' },
  ]},
];
