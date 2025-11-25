import type { UserProfile, Medication, MedicationLog, CheckIn } from '@/types';

// Helper to get date X days ago at midnight
const daysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(0, 0, 0, 0);
  return date;
};

// Helper to get date X days ago at specific hour
const daysAgoAt = (days: number, hour: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

export const DEMO_PROFILE: UserProfile = {
  id: 'demo-user',
  name: 'Margaret',
  email: 'margaret@example.com',
  phone: '(555) 123-4567',
  birthdate: '1952-03-15',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  avatar: '/margaret-avatar.webp',
  medical_conditions: 'Type 2 Diabetes, Hypertension',
  emergency_contact: 'Son: David (555) 987-6543',
  created_at: new Date('2024-10-01'),
  updated_at: new Date('2024-11-20'),
};

export const DEMO_MEDICATIONS: Medication[] = [
  {
    id: 'demo-med-1',
    user_id: 'demo-user',
    name: 'Metformin',
    dose: '500mg',
    instructions: 'Take with breakfast to reduce stomach upset',
    frequency: 'Twice daily',
    time_of_day: 'Morning',
    start_date: new Date('2024-06-15'),
    refill_reminder_days: 7,
    current_refills: 2,
    active: true,
    created_at: new Date('2024-06-15'),
    updated_at: new Date('2024-11-01'),
  },
  {
    id: 'demo-med-2',
    user_id: 'demo-user',
    name: 'Lisinopril',
    dose: '10mg',
    instructions: 'Take in the morning for blood pressure',
    frequency: 'Daily',
    time_of_day: 'Morning',
    start_date: new Date('2024-03-10'),
    refill_reminder_days: 7,
    current_refills: 1,
    active: true,
    created_at: new Date('2024-03-10'),
    updated_at: new Date('2024-10-15'),
  },
  {
    id: 'demo-med-3',
    user_id: 'demo-user',
    name: 'Vitamin D3',
    dose: '2000 IU',
    instructions: 'Take with a meal for better absorption',
    frequency: 'Daily',
    time_of_day: 'With meals',
    start_date: new Date('2024-01-05'),
    refill_reminder_days: 14,
    current_refills: 3,
    active: true,
    created_at: new Date('2024-01-05'),
    updated_at: new Date('2024-09-20'),
  },
  {
    id: 'demo-med-4',
    user_id: 'demo-user',
    name: 'Baby Aspirin',
    dose: '81mg',
    instructions: 'Take with food to protect stomach',
    frequency: 'Daily',
    time_of_day: 'Morning',
    start_date: new Date('2024-04-20'),
    refill_reminder_days: 30,
    current_refills: 5,
    active: true,
    created_at: new Date('2024-04-20'),
    updated_at: new Date('2024-08-10'),
  },
];

// Generate check-ins for the past 8 days (showing streak)
export const DEMO_CHECK_INS: CheckIn[] = Array.from({ length: 8 }, (_, i) => ({
  id: `demo-checkin-${i + 1}`,
  user_id: 'demo-user',
  date: daysAgo(i),
  status: 'ok' as const,
  note: i === 0 ? 'Feeling good today!' : i === 3 ? 'Had a great walk this morning' : undefined,
  created_at: daysAgoAt(i, 9),
}));

// Generate medication logs for the past 7 days
export const DEMO_MEDICATION_LOGS: MedicationLog[] = [
  // Metformin - morning doses
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `demo-log-met-${i + 1}`,
    medication_id: 'demo-med-1',
    user_id: 'demo-user',
    taken_at: daysAgoAt(i, 8),
    status: 'taken' as const,
    created_at: daysAgoAt(i, 8),
  })),
  // Lisinopril - morning doses
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `demo-log-lis-${i + 1}`,
    medication_id: 'demo-med-2',
    user_id: 'demo-user',
    taken_at: daysAgoAt(i, 8),
    status: 'taken' as const,
    created_at: daysAgoAt(i, 8),
  })),
  // Vitamin D3 - with lunch
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `demo-log-vitd-${i + 1}`,
    medication_id: 'demo-med-3',
    user_id: 'demo-user',
    taken_at: daysAgoAt(i, 12),
    status: 'taken' as const,
    created_at: daysAgoAt(i, 12),
  })),
  // Baby Aspirin - morning doses
  ...Array.from({ length: 7 }, (_, i) => ({
    id: `demo-log-asp-${i + 1}`,
    medication_id: 'demo-med-4',
    user_id: 'demo-user',
    taken_at: daysAgoAt(i, 8),
    status: 'taken' as const,
    created_at: daysAgoAt(i, 8),
  })),
];
