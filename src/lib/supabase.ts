import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if valid Supabase credentials exist
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    envUrl &&
    envKey &&
    envUrl.startsWith('https://') &&
    !envUrl.includes('your-project-id') &&
    envKey.length > 20 &&
    !envKey.includes('your-anon-key')
  );
};

// Fallback placeholder URL/Key to avoid client initialization crash before user adds keys
const fallbackUrl = 'https://placeholder-nurturehood.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabaseUrl = isSupabaseConfigured() ? envUrl : fallbackUrl;
export const supabaseAnonKey = isSupabaseConfigured() ? envKey : fallbackKey;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface ConnectionTestResult {
  connected: boolean;
  message: string;
  latencyMs?: number;
  projectUrl?: string;
  error?: string;
}

/**
 * Live test connection to Supabase instance
 */
export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Supabase credentials not configured in .env file. Running in local demo mode.',
      projectUrl: envUrl || 'Not configured',
    };
  }

  const startTime = performance.now();
  try {
    const { data, error } = await supabase
      .from('hospital_network')
      .select('count', { count: 'exact', head: true });

    const latency = Math.round(performance.now() - startTime);

    if (error) {
      // If table doesn't exist yet, but connection reached Supabase
      if (error.code === '42P01') {
        return {
          connected: true,
          message: 'Connected to Supabase! (Database schema needs to be initialized with schema.sql)',
          latencyMs: latency,
          projectUrl: envUrl,
        };
      }
      return {
        connected: false,
        message: `Supabase query returned error: ${error.message}`,
        error: error.message,
        latencyMs: latency,
        projectUrl: envUrl,
      };
    }

    return {
      connected: true,
      message: 'Successfully connected to Supabase PostgreSQL database!',
      latencyMs: latency,
      projectUrl: envUrl,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${err.message || 'Network error'}`,
      error: err.message,
      projectUrl: envUrl,
    };
  }
}
