// ===========================================
// Types aligned with Supabase schema
// ===========================================

// User Profile (user_profiles table)
export interface UserProfile {
  id: string; // UUID, references auth.users
  name: string;
  email?: string;
  phone?: string;
  birthdate?: string; // ISO date string (YYYY-MM-DD)
  address?: string;
  timezone?: string;
  avatar?: string;
  medical_conditions?: string;
  emergency_contact?: string;
  created_at: Date;
  updated_at: Date;
}

// User Settings (user_settings table)
export interface UserSettings {
  id: string;
  user_id: string;
  font_size: 'small' | 'medium' | 'large';
  high_contrast: boolean;
  voice_enabled: boolean;
  notification_sound: boolean;
  medication_reminders: boolean;
  appointment_reminders: boolean;
  emergency_alert_sound: boolean;
  created_at: Date;
  updated_at: Date;
}

// Medication (medications table)
export interface Medication {
  id: string;
  user_id: string;
  name: string;
  dose: string;
  instructions?: string;
  frequency: string;
  time_of_day: string;
  start_date: Date;
  end_date?: Date;
  prescribing_doctor?: string;
  pharmacy?: string;
  refill_reminder_days: number;
  current_refills: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Medication Log (medication_logs table)
export interface MedicationLog {
  id: string;
  medication_id: string;
  user_id: string;
  taken_at: Date;
  status: 'taken' | 'missed' | 'skipped' | 'snoozed';
  notes?: string;
  created_at: Date;
}

// Medication Subscription (medication_subscriptions table)
// Allows caregivers to subscribe to elder's medication updates
export interface MedicationSubscription {
  id: string;
  subscriber_user_id: string;
  subscribed_to_user_id: string;
  medication_id: string;
  subscribed_at: Date;
}

// Appointment (appointments table)
export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  doctor_name?: string;
  location?: string;
  date: Date;
  time: string;
  duration_minutes: number;
  reminder_enabled: boolean;
  reminder_minutes_before: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Family Group (family_groups table)
export interface FamilyGroup {
  id: string;
  name: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// Family Member (family_members table)
export interface FamilyMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'caregiver' | 'elder';
  can_view_medications: boolean;
  can_edit_medications: boolean;
  can_view_appointments: boolean;
  can_edit_appointments: boolean;
  joined_at: Date;
}

// Emergency Log (emergency_logs table)
export interface EmergencyLog {
  id: string;
  user_id: string;
  triggered_at: Date;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  status: 'triggered' | 'responded' | 'resolved' | 'false_alarm';
  notes?: string;
  created_at: Date;
}

// Email Log (email_logs table)
export interface EmailLog {
  id: string;
  user_id?: string;
  email_type: string;
  recipient_email: string;
  resend_email_id?: string;
  sent_at: Date;
  status: 'sent' | 'failed' | 'bounced';
  error_message?: string;
  metadata?: Record<string, unknown>;
  created_at: Date;
}

// ===========================================
// Local-only types (not in Supabase yet)
// ===========================================

// Daily Check-in (could add to Supabase later)
export interface CheckIn {
  id: string;
  user_id: string;
  date: Date;
  status: 'ok' | 'not-ok';
  note?: string;
  created_at: Date;
}

// ===========================================
// Helper types for UI
// ===========================================

// Medication with related logs for display
export interface MedicationWithLogs extends Medication {
  logs: MedicationLog[];
}

// Family member with profile info
export interface FamilyMemberWithProfile extends FamilyMember {
  profile: UserProfile;
}
