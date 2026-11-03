import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../types/database';

export type Pregnancy = Database['public']['Tables']['pregnancies']['Row'];
export type PregnancyInsert = Database['public']['Tables']['pregnancies']['Insert'];
export type AncVisit = Database['public']['Tables']['anc_visits']['Row'];
export type AncVisitInsert = Database['public']['Tables']['anc_visits']['Insert'];

const fallbackPregnancies: Pregnancy[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    patient_id: 'a1111111-1111-1111-1111-111111111111',
    pregnancy_number: 2,
    lmp: '2024-07-10',
    edd: '2025-04-15',
    gestational_weeks: 32,
    status: 'active',
    risk_level: 'high',
    risk_factors: ['Gestational Hypertension', 'Mild Anemia'],
    delivery_date: null,
    delivery_type: null,
    delivery_facility: null,
    created_at: '2024-07-15T10:00:00Z',
    updated_at: '2024-07-15T10:00:00Z',
  }
];

const fallbackAncVisits: AncVisit[] = [
  {
    id: 'anc-001',
    pregnancy_id: 'b1111111-1111-1111-1111-111111111111',
    patient_id: 'a1111111-1111-1111-1111-111111111111',
    visit_number: 1,
    visit_date: '2024-09-15',
    trimester: 'first',
    weight_kg: 52.0,
    bp_systolic: 120,
    bp_diastolic: 80,
    pulse_bpm: 74,
    hemoglobin_g_dl: 11.2,
    urine_albumin: 'Negative',
    blood_sugar_mg_dl: 95,
    fetal_heart_rate: 140,
    fundal_height_cm: 12,
    ifa_tablets_given: 30,
    calcium_tablets_given: 30,
    td_booster_given: true,
    danger_signs: [],
    clinical_notes: 'Normal first trimester registration',
    next_visit_date: '2024-11-15',
    recorded_by: null,
    created_at: '2024-09-15T10:30:00Z',
  },
  {
    id: 'anc-002',
    pregnancy_id: 'b1111111-1111-1111-1111-111111111111',
    patient_id: 'a1111111-1111-1111-1111-111111111111',
    visit_number: 2,
    visit_date: '2024-11-15',
    trimester: 'second',
    weight_kg: 55.2,
    bp_systolic: 128,
    bp_diastolic: 84,
    pulse_bpm: 76,
    hemoglobin_g_dl: 10.6,
    urine_albumin: 'Negative',
    blood_sugar_mg_dl: 110,
    fetal_heart_rate: 142,
    fundal_height_cm: 20,
    ifa_tablets_given: 60,
    calcium_tablets_given: 60,
    td_booster_given: false,
    danger_signs: [],
    clinical_notes: 'Second trimester ultrasound advised',
    next_visit_date: '2025-01-10',
    recorded_by: null,
    created_at: '2024-11-15T10:30:00Z',
  },
  {
    id: 'anc-003',
    pregnancy_id: 'b1111111-1111-1111-1111-111111111111',
    patient_id: 'a1111111-1111-1111-1111-111111111111',
    visit_number: 3,
    visit_date: '2025-01-10',
    trimester: 'third',
    weight_kg: 58.5,
    bp_systolic: 138,
    bp_diastolic: 88,
    pulse_bpm: 78,
    hemoglobin_g_dl: 10.2,
    urine_albumin: 'Negative',
    blood_sugar_mg_dl: 118,
    fetal_heart_rate: 144,
    fundal_height_cm: 32,
    ifa_tablets_given: 100,
    calcium_tablets_given: 100,
    td_booster_given: true,
    danger_signs: ['Mild pedal edema'],
    clinical_notes: 'Advised rest and low sodium diet. Follow-up in 2 weeks.',
    next_visit_date: '2025-03-25',
    recorded_by: null,
    created_at: '2025-01-10T11:00:00Z',
  }
];

export const ancService = {
  /**
   * Get pregnancies by patient
   */
  async getPregnancies(patientId?: string): Promise<Pregnancy[]> {
    if (!isSupabaseConfigured()) {
      if (patientId) {
        return fallbackPregnancies.filter(p => p.patient_id === patientId);
      }
      return fallbackPregnancies;
    }

    try {
      let query = supabase.from('pregnancies').select('*').order('created_at', { ascending: false });
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return fallbackPregnancies;
      }
      return data;
    } catch {
      return fallbackPregnancies;
    }
  },

  /**
   * Get ANC visits for a pregnancy
   */
  async getAncVisits(pregnancyId?: string): Promise<AncVisit[]> {
    if (!isSupabaseConfigured()) {
      if (pregnancyId) {
        return fallbackAncVisits.filter(v => v.pregnancy_id === pregnancyId);
      }
      return fallbackAncVisits;
    }

    try {
      let query = supabase.from('anc_visits').select('*').order('visit_number', { ascending: true });
      if (pregnancyId) {
        query = query.eq('pregnancy_id', pregnancyId);
      }
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return fallbackAncVisits;
      }
      return data;
    } catch {
      return fallbackAncVisits;
    }
  },

  /**
   * Register a new pregnancy
   */
  async createPregnancy(pregnancy: PregnancyInsert): Promise<{ pregnancy: Pregnancy | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const newPreg: Pregnancy = {
        id: `mock-preg-${Date.now()}`,
        patient_id: pregnancy.patient_id,
        pregnancy_number: pregnancy.pregnancy_number ?? 1,
        lmp: pregnancy.lmp,
        edd: pregnancy.edd,
        gestational_weeks: pregnancy.gestational_weeks ?? 12,
        status: pregnancy.status ?? 'active',
        risk_level: pregnancy.risk_level ?? 'low',
        risk_factors: pregnancy.risk_factors || [],
        delivery_date: pregnancy.delivery_date ?? null,
        delivery_type: pregnancy.delivery_type ?? null,
        delivery_facility: pregnancy.delivery_facility ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      fallbackPregnancies.unshift(newPreg);
      return { pregnancy: newPreg, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('pregnancies')
        .insert(pregnancy)
        .select()
        .single();

      if (error) {
        return { pregnancy: null, error: error.message };
      }
      return { pregnancy: data, error: null };
    } catch (e: any) {
      return { pregnancy: null, error: e.message || 'Error registering pregnancy' };
    }
  },

  /**
   * Record a new ANC visit
   */
  async recordAncVisit(visit: AncVisitInsert): Promise<{ visit: AncVisit | null; error: string | null }> {
    if (!isSupabaseConfigured()) {
      const newVisit: AncVisit = {
        id: `mock-anc-${Date.now()}`,
        pregnancy_id: visit.pregnancy_id,
        patient_id: visit.patient_id,
        visit_number: visit.visit_number,
        visit_date: visit.visit_date || new Date().toISOString().split('T')[0],
        trimester: visit.trimester,
        weight_kg: visit.weight_kg ?? null,
        bp_systolic: visit.bp_systolic ?? null,
        bp_diastolic: visit.bp_diastolic ?? null,
        pulse_bpm: visit.pulse_bpm ?? null,
        hemoglobin_g_dl: visit.hemoglobin_g_dl ?? null,
        urine_albumin: visit.urine_albumin ?? 'Negative',
        blood_sugar_mg_dl: visit.blood_sugar_mg_dl ?? null,
        fetal_heart_rate: visit.fetal_heart_rate ?? null,
        fundal_height_cm: visit.fundal_height_cm ?? null,
        ifa_tablets_given: visit.ifa_tablets_given ?? 0,
        calcium_tablets_given: visit.calcium_tablets_given ?? 0,
        td_booster_given: visit.td_booster_given ?? false,
        danger_signs: visit.danger_signs || [],
        clinical_notes: visit.clinical_notes || null,
        next_visit_date: visit.next_visit_date || null,
        recorded_by: null,
        created_at: new Date().toISOString(),
      };
      fallbackAncVisits.push(newVisit);
      return { visit: newVisit, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('anc_visits')
        .insert(visit)
        .select()
        .single();

      if (error) {
        return { visit: null, error: error.message };
      }
      return { visit: data, error: null };
    } catch (e: any) {
      return { visit: null, error: e.message || 'Error recording ANC visit' };
    }
  },
};
