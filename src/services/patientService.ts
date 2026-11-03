import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../types/database';

export type Patient = Database['public']['Tables']['patients']['Row'];
export type PatientInsert = Database['public']['Tables']['patients']['Insert'];

// Fallback seed data in case Supabase is not connected
const fallbackPatients: Patient[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    rch_id: 'RCH12345678',
    abha_id: '91-2345-6789-0123',
    patient_type: 'pregnant',
    full_name: 'Sunita Devi',
    phone: '+91 98765 43210',
    date_of_birth: '1998-04-12',
    gender: 'female',
    blood_group: 'B+',
    district: 'Patna',
    block: 'Block 3',
    village: 'Madhubani',
    address: 'House 42, Ward 3, Village Madhubani',
    guardian_name: 'Ramesh Devi',
    guardian_phone: '+91 98765 43219',
    mother_id: null,
    risk_flags: ['High BP (140/92)', 'Mild Anemia (9.8 g/dL)'],
    notes: 'Requires iron sucrose infusion monitoring',
    created_by: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    rch_id: 'RCH87654321',
    abha_id: '91-8765-4321-9876',
    patient_type: 'child',
    full_name: 'Rahul Kumar',
    phone: '+91 98765 43210',
    date_of_birth: '2023-06-20',
    gender: 'male',
    blood_group: 'O+',
    district: 'Patna',
    block: 'Block 3',
    village: 'Madhubani',
    address: 'House 42, Ward 3, Village Madhubani',
    guardian_name: 'Sunita Devi',
    guardian_phone: '+91 98765 43210',
    mother_id: 'a1111111-1111-1111-1111-111111111111',
    risk_flags: [],
    notes: 'Healthy child, MR-2 due soon',
    created_by: null,
    created_at: '2023-06-20T08:30:00Z',
    updated_at: '2023-06-20T08:30:00Z',
  },
  {
    id: 'd1111111-1111-1111-1111-111111111111',
    rch_id: 'RCH22334455',
    abha_id: '91-3344-5566-7788',
    patient_type: 'pregnant',
    full_name: 'Priya Sharma',
    phone: '+91 87654 32109',
    date_of_birth: '1999-09-15',
    gender: 'female',
    blood_group: 'A+',
    district: 'Patna',
    block: 'Block 2',
    village: 'Benipatti',
    address: 'Village Benipatti, Sector 1',
    guardian_name: 'Amit Sharma',
    guardian_phone: '+91 87654 32108',
    mother_id: null,
    risk_flags: [],
    notes: 'First pregnancy, normal progress',
    created_by: null,
    created_at: '2024-03-01T09:15:00Z',
    updated_at: '2024-03-01T09:15:00Z',
  }
];

export const patientService = {
  /**
   * Fetch all patients with optional filtering
   */
  async getPatients(filters?: { type?: string; search?: string }): Promise<Patient[]> {
    if (!isSupabaseConfigured()) {
      let result = [...fallbackPatients];
      if (filters?.type && filters.type !== 'all') {
        result = result.filter(p => p.patient_type === filters.type);
      }
      if (filters?.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(p =>
          p.full_name.toLowerCase().includes(query) ||
          p.rch_id.toLowerCase().includes(query) ||
          (p.abha_id && p.abha_id.toLowerCase().includes(query)) ||
          (p.phone && p.phone.includes(query))
        );
      }
      return result;
    }

    try {
      let query = supabase.from('patients').select('*').order('created_at', { ascending: false });

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('patient_type', filters.type as any);
      }

      if (filters?.search) {
        const term = `%${filters.search}%`;
        query = query.or(`full_name.ilike.${term},rch_id.ilike.${term},phone.ilike.${term}`);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Supabase fetch error, fallback to local:', error.message);
        return fallbackPatients;
      }
      return data && data.length > 0 ? data : fallbackPatients;
    } catch (e) {
      console.error('Error fetching patients:', e);
      return fallbackPatients;
    }
  },

  /**
   * Search patient by RCH ID or ABHA ID
   */
  async getPatientByRchId(rchId: string): Promise<Patient | null> {
    const cleanId = rchId.trim().toUpperCase();

    if (!isSupabaseConfigured()) {
      return fallbackPatients.find(p => p.rch_id.toUpperCase() === cleanId) || null;
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('rch_id', cleanId)
        .maybeSingle();

      if (error || !data) {
        return fallbackPatients.find(p => p.rch_id.toUpperCase() === cleanId) || null;
      }
      return data;
    } catch {
      return fallbackPatients.find(p => p.rch_id.toUpperCase() === cleanId) || null;
    }
  },

  /**
   * Register a new patient
   */
  async registerPatient(patient: PatientInsert): Promise<{ patient: Patient | null; error: string | null }> {
    // Generate RCH ID if not provided
    const newRchId = patient.rch_id || `RCH${Math.floor(10000000 + Math.random() * 90000000)}`;
    const patientData = { ...patient, rch_id: newRchId };

    if (!isSupabaseConfigured()) {
      const newPatient: Patient = {
        id: `mock-${Date.now()}`,
        ...patientData,
        abha_id: patientData.abha_id || null,
        phone: patientData.phone || null,
        date_of_birth: patientData.date_of_birth || null,
        gender: (patientData.gender as any) || null,
        blood_group: patientData.blood_group || null,
        district: patientData.district || 'Patna',
        block: patientData.block || 'Block 3',
        village: patientData.village || null,
        address: patientData.address || null,
        guardian_name: patientData.guardian_name || null,
        guardian_phone: patientData.guardian_phone || null,
        mother_id: patientData.mother_id || null,
        risk_flags: patientData.risk_flags || [],
        notes: patientData.notes || null,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      fallbackPatients.unshift(newPatient);
      return { patient: newPatient, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert(patientData)
        .select()
        .single();

      if (error) {
        return { patient: null, error: error.message };
      }
      return { patient: data, error: null };
    } catch (e: any) {
      return { patient: null, error: e.message || 'Registration failed' };
    }
  },
};
