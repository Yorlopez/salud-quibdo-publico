import { User as SupabaseUser } from '@supabase/supabase-js';

export type User = SupabaseUser | null;

export interface UserWithRole extends SupabaseUser {
  role?: string;
}

