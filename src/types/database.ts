export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          phone: string | null
          role: 'field_worker' | 'supervisor' | 'admin' | 'parent'
          health_facility: string | null
          area: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: 'field_worker' | 'supervisor' | 'admin' | 'parent'
          health_facility?: string | null
          area?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          phone?: string | null
          role?: 'field_worker' | 'supervisor' | 'admin' | 'parent'
          health_facility?: string | null
          area?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          rch_id: string
          abha_id: string | null
          patient_type: 'pregnant' | 'child' | 'mother'
          full_name: string
          phone: string | null
          date_of_birth: string | null
          gender: 'male' | 'female' | 'other' | null
          blood_group: string | null
          district: string | null
          block: string | null
          village: string | null
          address: string | null
          guardian_name: string | null
          guardian_phone: string | null
          mother_id: string | null
          risk_flags: string[]
          notes: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          rch_id: string
          abha_id?: string | null
          patient_type: 'pregnant' | 'child' | 'mother'
          full_name: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          blood_group?: string | null
          district?: string | null
          block?: string | null
          village?: string | null
          address?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          mother_id?: string | null
          risk_flags?: string[]
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          rch_id?: string
          abha_id?: string | null
          patient_type?: 'pregnant' | 'child' | 'mother'
          full_name?: string
          phone?: string | null
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'other' | null
          blood_group?: string | null
          district?: string | null
          block?: string | null
          village?: string | null
          address?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          mother_id?: string | null
          risk_flags?: string[]
          notes?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      pregnancies: {
        Row: {
          id: string
          patient_id: string
          pregnancy_number: number
          lmp: string
          edd: string
          gestational_weeks: number | null
          status: 'active' | 'delivered' | 'terminated'
          risk_level: 'low' | 'medium' | 'high'
          risk_factors: string[]
          delivery_date: string | null
          delivery_type: string | null
          delivery_facility: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          pregnancy_number?: number
          lmp: string
          edd: string
          gestational_weeks?: number | null
          status?: 'active' | 'delivered' | 'terminated'
          risk_level?: 'low' | 'medium' | 'high'
          risk_factors?: string[]
          delivery_date?: string | null
          delivery_type?: string | null
          delivery_facility?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          pregnancy_number?: number
          lmp?: string
          edd?: string
          gestational_weeks?: number | null
          status?: 'active' | 'delivered' | 'terminated'
          risk_level?: 'low' | 'medium' | 'high'
          risk_factors?: string[]
          delivery_date?: string | null
          delivery_type?: string | null
          delivery_facility?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      anc_visits: {
        Row: {
          id: string
          pregnancy_id: string
          patient_id: string
          visit_number: number
          visit_date: string
          trimester: 'first' | 'second' | 'third'
          weight_kg: number | null
          bp_systolic: number | null
          bp_diastolic: number | null
          pulse_bpm: number | null
          hemoglobin_g_dl: number | null
          urine_albumin: string | null
          blood_sugar_mg_dl: number | null
          fetal_heart_rate: number | null
          fundal_height_cm: number | null
          ifa_tablets_given: number
          calcium_tablets_given: number
          td_booster_given: boolean
          danger_signs: string[]
          clinical_notes: string | null
          next_visit_date: string | null
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pregnancy_id: string
          patient_id: string
          visit_number: number
          visit_date?: string
          trimester: 'first' | 'second' | 'third'
          weight_kg?: number | null
          bp_systolic?: number | null
          bp_diastolic?: number | null
          pulse_bpm?: number | null
          hemoglobin_g_dl?: number | null
          urine_albumin?: string | null
          blood_sugar_mg_dl?: number | null
          fetal_heart_rate?: number | null
          fundal_height_cm?: number | null
          ifa_tablets_given?: number
          calcium_tablets_given?: number
          td_booster_given?: boolean
          danger_signs?: string[]
          clinical_notes?: string | null
          next_visit_date?: string | null
          recorded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pregnancy_id?: string
          patient_id?: string
          visit_number?: number
          visit_date?: string
          trimester?: 'first' | 'second' | 'third'
          weight_kg?: number | null
          bp_systolic?: number | null
          bp_diastolic?: number | null
          pulse_bpm?: number | null
          hemoglobin_g_dl?: number | null
          urine_albumin?: string | null
          blood_sugar_mg_dl?: number | null
          fetal_heart_rate?: number | null
          fundal_height_cm?: number | null
          ifa_tablets_given?: number
          calcium_tablets_given?: number
          td_booster_given?: boolean
          danger_signs?: string[]
          clinical_notes?: string | null
          next_visit_date?: string | null
          recorded_by?: string | null
          created_at?: string
        }
      }
      vaccine_catalog: {
        Row: {
          id: string
          code: string
          name: string
          due_period: string
          due_days_min: number
          due_days_max: number | null
          target_group: string
          route: string | null
          site: string | null
          dose: string | null
          mandatory: boolean
        }
        Insert: {
          id?: string
          code: string
          name: string
          due_period: string
          due_days_min?: number
          due_days_max?: number | null
          target_group?: string
          route?: string | null
          site?: string | null
          dose?: string | null
          mandatory?: boolean
        }
        Update: {
          id?: string
          code?: string
          name?: string
          due_period?: string
          due_days_min?: number
          due_days_max?: number | null
          target_group?: string
          route?: string | null
          site?: string | null
          dose?: string | null
          mandatory?: boolean
        }
      }
      immunization_records: {
        Row: {
          id: string
          child_id: string
          vaccine_code: string
          vaccine_name: string
          due_date: string
          administered_date: string | null
          status: 'pending' | 'upcoming' | 'due' | 'administered' | 'overdue'
          batch_number: string | null
          facility_name: string | null
          administered_by: string | null
          adverse_reactions: string | null
          parent_notified: boolean
          notification_sent_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          vaccine_code: string
          vaccine_name: string
          due_date: string
          administered_date?: string | null
          status?: 'pending' | 'upcoming' | 'due' | 'administered' | 'overdue'
          batch_number?: string | null
          facility_name?: string | null
          administered_by?: string | null
          adverse_reactions?: string | null
          parent_notified?: boolean
          notification_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          vaccine_code?: string
          vaccine_name?: string
          due_date?: string
          administered_date?: string | null
          status?: 'pending' | 'upcoming' | 'due' | 'administered' | 'overdue'
          batch_number?: string | null
          facility_name?: string | null
          administered_by?: string | null
          adverse_reactions?: string | null
          parent_notified?: boolean
          notification_sent_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      hospital_network: {
        Row: {
          id: string
          name: string
          type: 'Sub-Center' | 'PHC' | 'CHC' | 'District Hospital' | 'Medical College' | 'Private Hospital'
          category: string
          district: string
          block: string | null
          phone: string | null
          email: string | null
          total_beds: number
          available_beds: number
          icu_beds: number
          nicu_beds: number
          maternity_beds: number
          specialties: string[]
          is_connected: boolean
          connection_type: string
          last_sync: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'Sub-Center' | 'PHC' | 'CHC' | 'District Hospital' | 'Medical College' | 'Private Hospital'
          category?: string
          district: string
          block?: string | null
          phone?: string | null
          email?: string | null
          total_beds?: number
          available_beds?: number
          icu_beds?: number
          nicu_beds?: number
          maternity_beds?: number
          specialties?: string[]
          is_connected?: boolean
          connection_type?: string
          last_sync?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'Sub-Center' | 'PHC' | 'CHC' | 'District Hospital' | 'Medical College' | 'Private Hospital'
          category?: string
          district?: string
          block?: string | null
          phone?: string | null
          email?: string | null
          total_beds?: number
          available_beds?: number
          icu_beds?: number
          nicu_beds?: number
          maternity_beds?: number
          specialties?: string[]
          is_connected?: boolean
          connection_type?: string
          last_sync?: string
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          patient_id: string
          referring_facility_id: string | null
          receiving_facility_id: string | null
          urgency: 'routine' | 'urgent' | 'critical'
          reason: string
          clinical_summary: string | null
          status: 'initiated' | 'in_transit' | 'accepted' | 'completed' | 'cancelled'
          transport_type: string | null
          referral_date: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          referring_facility_id?: string | null
          receiving_facility_id?: string | null
          urgency?: 'routine' | 'urgent' | 'critical'
          reason: string
          clinical_summary?: string | null
          status?: 'initiated' | 'in_transit' | 'accepted' | 'completed' | 'cancelled'
          transport_type?: string | null
          referral_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          referring_facility_id?: string | null
          receiving_facility_id?: string | null
          urgency?: 'routine' | 'urgent' | 'critical'
          reason?: string
          clinical_summary?: string | null
          status?: 'initiated' | 'in_transit' | 'accepted' | 'completed' | 'cancelled'
          transport_type?: string | null
          referral_date?: string
          created_at?: string
        }
      }
      clinical_lab_tests: {
        Row: {
          id: string
          patient_id: string
          test_name: string
          test_category: string | null
          sample_date: string
          result_date: string | null
          status: 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'flagged'
          result_value: string | null
          reference_range: string | null
          is_abnormal: boolean
          facility_name: string | null
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          test_name: string
          test_category?: string | null
          sample_date?: string
          result_date?: string | null
          status?: 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'flagged'
          result_value?: string | null
          reference_range?: string | null
          is_abnormal?: boolean
          facility_name?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          test_name?: string
          test_category?: string | null
          sample_date?: string
          result_date?: string | null
          status?: 'ordered' | 'sample_collected' | 'in_progress' | 'completed' | 'flagged'
          result_value?: string | null
          reference_range?: string | null
          is_abnormal?: boolean
          facility_name?: string | null
          created_at?: string
        }
      }
      community_posts: {
        Row: {
          id: string
          author_id: string | null
          author_name: string
          author_role: string
          category: string
          title: string
          content: string
          priority: string
          likes_count: number
          created_at: string
        }
        Insert: {
          id?: string
          author_id?: string | null
          author_name: string
          author_role: string
          category?: string
          title: string
          content: string
          priority?: string
          likes_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          author_id?: string | null
          author_name?: string
          author_role?: string
          category?: string
          title?: string
          content?: string
          priority?: string
          likes_count?: number
          created_at?: string
        }
      }
    }
  }
}
