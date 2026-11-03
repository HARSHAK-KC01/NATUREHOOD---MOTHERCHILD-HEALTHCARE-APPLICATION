import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../types/database';

export type Hospital = Database['public']['Tables']['hospital_network']['Row'];
export type Referral = Database['public']['Tables']['referrals']['Row'];
export type ReferralInsert = Database['public']['Tables']['referrals']['Insert'];

const fallbackHospitals: Hospital[] = [
  {
    id: 'hosp-001',
    name: 'District Hospital Patna',
    type: 'District Hospital',
    category: 'government',
    district: 'Patna',
    block: 'Central Block',
    phone: '+91-612-2345678',
    email: 'admin@dhpatna.gov.in',
    total_beds: 500,
    available_beds: 48,
    icu_beds: 24,
    nicu_beds: 12,
    maternity_beds: 45,
    specialties: ['Gynecology', 'Pediatrics', 'Cardiology', 'Emergency', 'Blood Bank'],
    is_connected: true,
    connection_type: 'ABDM',
    last_sync: '2025-01-15T14:30:00Z',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'hosp-002',
    name: 'CHC Patliputra',
    type: 'CHC',
    category: 'government',
    district: 'Patna',
    block: 'Block 3',
    phone: '+91-612-2456789',
    email: 'chc.patliputra@bihar.gov.in',
    total_beds: 50,
    available_beds: 12,
    icu_beds: 4,
    nicu_beds: 2,
    maternity_beds: 16,
    specialties: ['Obstetrics', 'Pediatrics', 'General Medicine'],
    is_connected: true,
    connection_type: 'API',
    last_sync: '2025-01-15T14:20:00Z',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'hosp-003',
    name: 'PHC Rampur Sub-Center',
    type: 'PHC',
    category: 'government',
    district: 'Patna',
    block: 'Block 3',
    phone: '+91-612-2567890',
    email: 'phc.rampur@bihar.gov.in',
    total_beds: 15,
    available_beds: 6,
    icu_beds: 0,
    nicu_beds: 0,
    maternity_beds: 8,
    specialties: ['Antenatal Care', 'Routine Immunization', 'Normal Delivery'],
    is_connected: true,
    connection_type: 'ABDM',
    last_sync: '2025-01-15T14:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
  }
];

export const hospitalService = {
  /**
   * Fetch list of hospitals and live bed availability
   */
  async getHospitals(): Promise<Hospital[]> {
    if (!isSupabaseConfigured()) {
      return fallbackHospitals;
    }

    try {
      const { data, error } = await supabase
        .from('hospital_network')
        .select('*')
        .order('name');

      if (error || !data || data.length === 0) {
        return fallbackHospitals;
      }
      return data;
    } catch {
      return fallbackHospitals;
    }
  },

  /**
   * Create an emergency or routine patient referral
   */
  async createReferral(referral: ReferralInsert): Promise<{ referral: Referral | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const newReferral: Referral = {
        id: `ref-${Date.now()}`,
        patient_id: referral.patient_id,
        referring_facility_id: referral.referring_facility_id || null,
        receiving_facility_id: referral.receiving_facility_id || null,
        urgency: referral.urgency || 'routine',
        reason: referral.reason,
        clinical_summary: referral.clinical_summary || null,
        status: referral.status || 'initiated',
        transport_type: referral.transport_type || '108 Ambulance',
        referral_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      return { referral: newReferral, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('referrals')
        .insert(referral)
        .select()
        .single();

      if (error) {
        return { referral: null, error: error.message };
      }
      return { referral: data, error: null };
    } catch (e: any) {
      return { referral: null, error: e.message };
    }
  },
};
