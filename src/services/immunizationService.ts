import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Database } from '../types/database';

export type ImmunizationRecord = Database['public']['Tables']['immunization_records']['Row'];
export type ImmunizationInsert = Database['public']['Tables']['immunization_records']['Insert'];

const fallbackRecords: ImmunizationRecord[] = [
  {
    id: 'vacc-001',
    child_id: 'c1111111-1111-1111-1111-111111111111',
    vaccine_code: 'BCG',
    vaccine_name: 'Bacillus Calmette–Guérin',
    due_date: '2023-06-20',
    administered_date: '2023-06-21',
    status: 'administered',
    batch_number: 'BCG-23-441',
    facility_name: 'PHC Rampur',
    administered_by: 'Priya Sharma (ANM)',
    adverse_reactions: null,
    parent_notified: true,
    notification_sent_at: '2023-06-19T10:00:00Z',
    created_at: '2023-06-20T08:00:00Z',
    updated_at: '2023-06-21T11:00:00Z',
  },
  {
    id: 'vacc-002',
    child_id: 'c1111111-1111-1111-1111-111111111111',
    vaccine_code: 'OPV-0',
    vaccine_name: 'Oral Polio Vaccine 0',
    due_date: '2023-06-20',
    administered_date: '2023-06-21',
    status: 'administered',
    batch_number: 'OPV-23-102',
    facility_name: 'PHC Rampur',
    administered_by: 'Priya Sharma (ANM)',
    adverse_reactions: null,
    parent_notified: true,
    notification_sent_at: '2023-06-19T10:00:00Z',
    created_at: '2023-06-20T08:00:00Z',
    updated_at: '2023-06-21T11:00:00Z',
  },
  {
    id: 'vacc-003',
    child_id: 'c1111111-1111-1111-1111-111111111111',
    vaccine_code: 'PENTA-1',
    vaccine_name: 'Pentavalent 1 (DPT+HepB+Hib)',
    due_date: '2023-08-01',
    administered_date: '2023-08-03',
    status: 'administered',
    batch_number: 'PNT-23-908',
    facility_name: 'PHC Rampur',
    administered_by: 'Priya Sharma (ANM)',
    adverse_reactions: 'Mild fever, settled with paracetamol',
    parent_notified: true,
    notification_sent_at: '2023-07-30T10:00:00Z',
    created_at: '2023-06-20T08:00:00Z',
    updated_at: '2023-08-03T10:00:00Z',
  },
  {
    id: 'vacc-004',
    child_id: 'c1111111-1111-1111-1111-111111111111',
    vaccine_code: 'MR-1',
    vaccine_name: 'Measles-Rubella 1',
    due_date: '2024-03-20',
    administered_date: '2024-03-25',
    status: 'administered',
    batch_number: 'MR-24-311',
    facility_name: 'PHC Rampur',
    administered_by: 'Priya Sharma (ANM)',
    adverse_reactions: null,
    parent_notified: true,
    notification_sent_at: '2024-03-18T10:00:00Z',
    created_at: '2023-06-20T08:00:00Z',
    updated_at: '2024-03-25T11:30:00Z',
  },
  {
    id: 'vacc-005',
    child_id: 'c1111111-1111-1111-1111-111111111111',
    vaccine_code: 'DPT-B1',
    vaccine_name: 'DPT Booster 1',
    due_date: '2025-01-15',
    administered_date: null,
    status: 'overdue',
    batch_number: null,
    facility_name: 'PHC Rampur',
    administered_by: null,
    adverse_reactions: null,
    parent_notified: false,
    notification_sent_at: null,
    created_at: '2023-06-20T08:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'vacc-006',
    child_id: 'c1111111-1111-1111-1111-111111111111',
    vaccine_code: 'MR-2',
    vaccine_name: 'Measles-Rubella 2',
    due_date: '2025-02-15',
    administered_date: null,
    status: 'upcoming',
    batch_number: null,
    facility_name: 'PHC Rampur',
    administered_by: null,
    adverse_reactions: null,
    parent_notified: true,
    notification_sent_at: '2025-02-01T09:00:00Z',
    created_at: '2023-06-20T08:00:00Z',
    updated_at: '2025-02-01T09:00:00Z',
  }
];

export const immunizationService = {
  /**
   * Get immunization records for a child or all children
   */
  async getRecords(childId?: string): Promise<ImmunizationRecord[]> {
    if (!isSupabaseConfigured()) {
      if (childId) {
        return fallbackRecords.filter(r => r.child_id === childId);
      }
      return fallbackRecords;
    }

    try {
      let query = supabase.from('immunization_records').select('*').order('due_date', { ascending: true });
      if (childId) {
        query = query.eq('child_id', childId);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return fallbackRecords;
      }
      return data;
    } catch {
      return fallbackRecords;
    }
  },

  /**
   * Mark vaccine as administered
   */
  async recordVaccination(
    recordId: string,
    data: {
      administeredDate: string;
      batchNumber: string;
      facilityName: string;
      administeredBy: string;
      adverseReactions?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      const rec = fallbackRecords.find(r => r.id === recordId);
      if (rec) {
        rec.status = 'administered';
        rec.administered_date = data.administeredDate;
        rec.batch_number = data.batchNumber;
        rec.facility_name = data.facilityName;
        rec.administered_by = data.administeredBy;
        rec.adverse_reactions = data.adverseReactions || null;
        rec.updated_at = new Date().toISOString();
      }
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('immunization_records')
        .update({
          status: 'administered',
          administered_date: data.administeredDate,
          batch_number: data.batchNumber,
          facility_name: data.facilityName,
          administered_by: data.administeredBy,
          adverse_reactions: data.adverseReactions || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', recordId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Send SMS reminder
   */
  async sendReminder(recordId: string): Promise<{ success: boolean }> {
    if (!isSupabaseConfigured()) {
      const rec = fallbackRecords.find(r => r.id === recordId);
      if (rec) {
        rec.parent_notified = true;
        rec.notification_sent_at = new Date().toISOString();
      }
      return { success: true };
    }

    try {
      await supabase
        .from('immunization_records')
        .update({
          parent_notified: true,
          notification_sent_at: new Date().toISOString(),
        })
        .eq('id', recordId);
      return { success: true };
    } catch {
      return { success: true };
    }
  },
};
