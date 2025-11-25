import type { StorageAdapter } from './storage';
import type { UserProfile, Medication, MedicationLog, CheckIn } from '@/types';

const KEYS = {
  profile: 'cb_profile',
  medications: 'cb_medications',
  medicationLogs: 'cb_medication_logs',
  checkIns: 'cb_check_ins',
} as const;

// Date fields that need to be revived from JSON
const DATE_FIELDS = [
  'created_at',
  'updated_at',
  'date',
  'start_date',
  'end_date',
  'taken_at',
  'subscribed_at',
  'joined_at',
  'triggered_at',
  'sent_at',
];

function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const item = localStorage.getItem(key);
  if (!item) return null;
  try {
    return JSON.parse(item, (k, v) => {
      if (DATE_FIELDS.includes(k) && v) {
        return new Date(v);
      }
      return v;
    });
  } catch (error) {
    console.error(`[Storage] Failed to parse ${key}:`, error);
    return null;
  }
}

function setItem<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to save ${key}:`, error);
    // QuotaExceededError - storage is full
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn('[Storage] Storage quota exceeded. Consider clearing old data.');
    }
    return false;
  }
}

export const localStorageAdapter: StorageAdapter = {
  // Profile
  async getProfile() {
    return getItem<UserProfile>(KEYS.profile);
  },

  async saveProfile(profile) {
    setItem(KEYS.profile, profile);
  },

  async deleteProfile() {
    localStorage.removeItem(KEYS.profile);
  },

  // Medications
  async getMedications() {
    return getItem<Medication[]>(KEYS.medications) || [];
  },

  async getMedication(id) {
    const meds = await this.getMedications();
    return meds.find((m) => m.id === id) || null;
  },

  async addMedication(medication) {
    const meds = await this.getMedications();
    meds.push(medication);
    setItem(KEYS.medications, meds);
  },

  async updateMedication(medication) {
    const meds = await this.getMedications();
    const index = meds.findIndex((m) => m.id === medication.id);
    if (index !== -1) {
      meds[index] = medication;
      setItem(KEYS.medications, meds);
    }
  },

  async deleteMedication(id) {
    const meds = await this.getMedications();
    setItem(KEYS.medications, meds.filter((m) => m.id !== id));
  },

  // Medication Logs
  async getMedicationLogs() {
    return getItem<MedicationLog[]>(KEYS.medicationLogs) || [];
  },

  async addMedicationLog(log) {
    const logs = await this.getMedicationLogs();
    logs.push(log);
    setItem(KEYS.medicationLogs, logs);
  },

  async updateMedicationLog(log) {
    const logs = await this.getMedicationLogs();
    const index = logs.findIndex((l) => l.id === log.id);
    if (index !== -1) {
      logs[index] = log;
      setItem(KEYS.medicationLogs, logs);
    }
  },

  // Check-ins
  async getCheckIns() {
    return getItem<CheckIn[]>(KEYS.checkIns) || [];
  },

  async addCheckIn(checkIn) {
    const checkIns = await this.getCheckIns();
    checkIns.push(checkIn);
    setItem(KEYS.checkIns, checkIns);
  },

  async getTodayCheckIn() {
    const checkIns = await this.getCheckIns();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkIns.find((c) => {
      const checkInDate = new Date(c.date);
      checkInDate.setHours(0, 0, 0, 0);
      return checkInDate.getTime() === today.getTime();
    }) || null;
  },
};
