export type { StorageAdapter } from './storage';
export { localStorageAdapter } from './local-storage';

// Switch this import when ready for Supabase:
// export { supabaseAdapter as storage } from './supabase';
export { localStorageAdapter as storage } from './local-storage';
