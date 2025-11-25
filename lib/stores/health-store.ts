'use client';

import { create } from 'zustand';
import { storage } from '@/lib/data';
import {
  DEMO_PROFILE,
  DEMO_MEDICATIONS,
  DEMO_MEDICATION_LOGS,
  DEMO_CHECK_INS,
} from '@/lib/data/demo-data';
import type { UserProfile, Medication, MedicationLog, CheckIn } from '@/types';

interface HealthState {
  // Data
  profile: UserProfile | null;
  medications: Medication[];
  medicationLogs: MedicationLog[];
  checkIns: CheckIn[];

  // Loading states
  isLoading: boolean;

  // Demo mode
  isDemo: boolean;

  // Actions
  initialize: () => Promise<void>;
  initializeDemo: () => void;

  // Profile
  saveProfile: (profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deleteProfile: () => Promise<void>;

  // Medications
  addMedication: (medication: Omit<Medication, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateMedication: (medication: Medication) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;

  // Medication Logs
  logMedicationTaken: (medicationId: string) => Promise<void>;
  logMedicationSnoozed: (medicationId: string) => Promise<void>;

  // Check-ins
  checkIn: (status: 'ok' | 'not-ok', note?: string) => Promise<void>;
  getTodayCheckIn: () => CheckIn | null;
  getStreak: () => number;
}

function generateId(): string {
  return crypto.randomUUID();
}

const DEFAULT_USER_ID = 'local-user';

export const useHealthStore = create<HealthState>((set, get) => ({
  profile: null,
  medications: [],
  medicationLogs: [],
  checkIns: [],
  isLoading: true,
  isDemo: false,

  initialize: async () => {
    const [profile, medications, medicationLogs, checkIns] = await Promise.all([
      storage.getProfile(),
      storage.getMedications(),
      storage.getMedicationLogs(),
      storage.getCheckIns(),
    ]);
    set({ profile, medications, medicationLogs, checkIns, isLoading: false, isDemo: false });
  },

  initializeDemo: () => {
    set({
      profile: DEMO_PROFILE,
      medications: DEMO_MEDICATIONS,
      medicationLogs: DEMO_MEDICATION_LOGS,
      checkIns: DEMO_CHECK_INS,
      isLoading: false,
      isDemo: true,
    });
  },

  saveProfile: async (data) => {
    if (get().isDemo) return; // Demo mode: no-op
    const existing = get().profile;
    const now = new Date();
    const profile: UserProfile = existing
      ? { ...existing, ...data, updated_at: now }
      : { id: generateId(), ...data, created_at: now, updated_at: now };
    await storage.saveProfile(profile);
    set({ profile });
  },

  deleteProfile: async () => {
    if (get().isDemo) return; // Demo mode: no-op
    await storage.deleteProfile();
    set({ profile: null });
  },

  addMedication: async (data) => {
    if (get().isDemo) return; // Demo mode: no-op
    const now = new Date();
    const medication: Medication = {
      ...data,
      id: generateId(),
      user_id: DEFAULT_USER_ID,
      refill_reminder_days: data.refill_reminder_days ?? 7,
      current_refills: data.current_refills ?? 0,
      created_at: now,
      updated_at: now,
    };
    await storage.addMedication(medication);
    set((state) => ({ medications: [...state.medications, medication] }));
  },

  updateMedication: async (medication) => {
    if (get().isDemo) return; // Demo mode: no-op
    const updated = { ...medication, updated_at: new Date() };
    await storage.updateMedication(updated);
    set((state) => ({
      medications: state.medications.map((m) => (m.id === medication.id ? updated : m)),
    }));
  },

  deleteMedication: async (id) => {
    if (get().isDemo) return; // Demo mode: no-op
    await storage.deleteMedication(id);
    set((state) => ({ medications: state.medications.filter((m) => m.id !== id) }));
  },

  logMedicationTaken: async (medicationId) => {
    if (get().isDemo) return; // Demo mode: no-op
    const now = new Date();
    const log: MedicationLog = {
      id: generateId(),
      medication_id: medicationId,
      user_id: DEFAULT_USER_ID,
      taken_at: now,
      status: 'taken',
      created_at: now,
    };
    await storage.addMedicationLog(log);
    set((state) => ({ medicationLogs: [...state.medicationLogs, log] }));
  },

  logMedicationSnoozed: async (medicationId) => {
    if (get().isDemo) return; // Demo mode: no-op
    const now = new Date();
    const log: MedicationLog = {
      id: generateId(),
      medication_id: medicationId,
      user_id: DEFAULT_USER_ID,
      taken_at: now,
      status: 'snoozed',
      created_at: now,
    };
    await storage.addMedicationLog(log);
    set((state) => ({ medicationLogs: [...state.medicationLogs, log] }));
  },

  checkIn: async (status, note) => {
    if (get().isDemo) return; // Demo mode: no-op
    const now = new Date();
    const checkIn: CheckIn = {
      id: generateId(),
      user_id: DEFAULT_USER_ID,
      date: now,
      status,
      note,
      created_at: now,
    };
    await storage.addCheckIn(checkIn);
    set((state) => ({ checkIns: [...state.checkIns, checkIn] }));
  },

  getTodayCheckIn: () => {
    const { checkIns } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkIns.find((c) => {
      const checkInDate = new Date(c.date);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime();
    }) || null;
  },

  getStreak: () => {
    const { checkIns } = get();
    if (checkIns.length === 0) return 0;

    const sorted = [...checkIns]
      .filter((c) => c.status === 'ok')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sorted.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const checkInDate = new Date(sorted[i].date);
      checkInDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (checkInDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },
}));
