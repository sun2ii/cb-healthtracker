import type { UserProfile, Medication, MedicationLog, CheckIn } from '@/types';

export interface StorageAdapter {
  // Profile
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  deleteProfile(): Promise<void>;

  // Medications
  getMedications(): Promise<Medication[]>;
  getMedication(id: string): Promise<Medication | null>;
  addMedication(medication: Medication): Promise<void>;
  updateMedication(medication: Medication): Promise<void>;
  deleteMedication(id: string): Promise<void>;

  // Medication Logs
  getMedicationLogs(): Promise<MedicationLog[]>;
  addMedicationLog(log: MedicationLog): Promise<void>;
  updateMedicationLog(log: MedicationLog): Promise<void>;

  // Check-ins
  getCheckIns(): Promise<CheckIn[]>;
  addCheckIn(checkIn: CheckIn): Promise<void>;
  getTodayCheckIn(): Promise<CheckIn | null>;
}
