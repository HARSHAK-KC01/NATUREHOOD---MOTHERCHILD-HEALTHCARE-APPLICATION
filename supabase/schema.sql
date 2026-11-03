-- ==============================================================================
-- NURTUREHOOD MATERNAL & CHILD HEALTHCARE PLATFORM - SUPABASE DATABASE SCHEMA
-- Compliant with: ABDM (Ayushman Bharat Digital Mission), RCH 2.0 & Mission Indradhanush
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. User Profiles Table (Linked to Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  role TEXT CHECK (role IN ('field_worker', 'supervisor', 'admin', 'parent')) DEFAULT 'field_worker',
  health_facility TEXT DEFAULT 'PHC Rampur',
  area TEXT DEFAULT 'Sector 4, Block 3',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Index for role-based lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ==============================================================================
-- 3. Patients / Beneficiaries Table (Mothers, Pregnant Women & Children)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rch_id TEXT UNIQUE NOT NULL,
  abha_id TEXT,
  patient_type TEXT CHECK (patient_type IN ('pregnant', 'child', 'mother')) NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  blood_group TEXT,
  district TEXT DEFAULT 'Patna',
  block TEXT DEFAULT 'Block 3',
  village TEXT,
  address TEXT,
  guardian_name TEXT,
  guardian_phone TEXT,
  mother_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  risk_flags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_rch_id ON public.patients(rch_id);
CREATE INDEX IF NOT EXISTS idx_patients_type ON public.patients(patient_type);
CREATE INDEX IF NOT EXISTS idx_patients_mother_id ON public.patients(mother_id);

-- ==============================================================================
-- 4. Pregnancies Table (Antenatal Registry)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.pregnancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  pregnancy_number INTEGER DEFAULT 1,
  lmp DATE NOT NULL,
  edd DATE NOT NULL,
  gestational_weeks INTEGER,
  status TEXT CHECK (status IN ('active', 'delivered', 'terminated')) DEFAULT 'active',
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')) DEFAULT 'low',
  risk_factors TEXT[] DEFAULT '{}',
  delivery_date DATE,
  delivery_type TEXT,
  delivery_facility TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pregnancies_patient_id ON public.pregnancies(patient_id);
CREATE INDEX IF NOT EXISTS idx_pregnancies_status ON public.pregnancies(status);

-- ==============================================================================
-- 5. ANC Visits Table (Antenatal Checkups)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.anc_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id UUID NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  visit_number INTEGER NOT NULL,
  visit_date DATE DEFAULT CURRENT_DATE NOT NULL,
  trimester TEXT CHECK (trimester IN ('first', 'second', 'third')),
  weight_kg NUMERIC(5,2),
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  pulse_bpm INTEGER,
  hemoglobin_g_dl NUMERIC(4,2),
  urine_albumin TEXT DEFAULT 'Negative',
  blood_sugar_mg_dl NUMERIC(5,2),
  fetal_heart_rate INTEGER,
  fundal_height_cm INTEGER,
  ifa_tablets_given INTEGER DEFAULT 0,
  calcium_tablets_given INTEGER DEFAULT 0,
  td_booster_given BOOLEAN DEFAULT false,
  danger_signs TEXT[] DEFAULT '{}',
  clinical_notes TEXT,
  next_visit_date DATE,
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_anc_visits_pregnancy_id ON public.anc_visits(pregnancy_id);
CREATE INDEX IF NOT EXISTS idx_anc_visits_patient_id ON public.anc_visits(patient_id);

-- ==============================================================================
-- 6. Vaccine Master Catalog (National Immunization Schedule / Indradhanush)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vaccine_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  due_period TEXT NOT NULL,
  due_days_min INTEGER DEFAULT 0,
  due_days_max INTEGER,
  target_group TEXT DEFAULT 'child',
  route TEXT,
  site TEXT,
  dose TEXT,
  mandatory BOOLEAN DEFAULT true
);

-- ==============================================================================
-- 7. Child Immunization Records Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.immunization_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  vaccine_code TEXT NOT NULL,
  vaccine_name TEXT NOT NULL,
  due_date DATE NOT NULL,
  administered_date DATE,
  status TEXT CHECK (status IN ('pending', 'upcoming', 'due', 'administered', 'overdue')) DEFAULT 'pending',
  batch_number TEXT,
  facility_name TEXT DEFAULT 'PHC Rampur Sub-Center',
  administered_by TEXT,
  adverse_reactions TEXT,
  parent_notified BOOLEAN DEFAULT false,
  notification_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_immunization_child_id ON public.immunization_records(child_id);
CREATE INDEX IF NOT EXISTS idx_immunization_status ON public.immunization_records(status);
CREATE INDEX IF NOT EXISTS idx_immunization_due_date ON public.immunization_records(due_date);

-- ==============================================================================
-- 8. Hospital Network & Referral Infrastructure
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hospital_network (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('Sub-Center', 'PHC', 'CHC', 'District Hospital', 'Medical College', 'Private Hospital')) NOT NULL,
  category TEXT DEFAULT 'government',
  district TEXT NOT NULL,
  block TEXT,
  phone TEXT,
  email TEXT,
  total_beds INTEGER DEFAULT 0,
  available_beds INTEGER DEFAULT 0,
  icu_beds INTEGER DEFAULT 0,
  nicu_beds INTEGER DEFAULT 0,
  maternity_beds INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  is_connected BOOLEAN DEFAULT true,
  connection_type TEXT DEFAULT 'ABDM',
  last_sync TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  referring_facility_id UUID REFERENCES public.hospital_network(id) ON DELETE SET NULL,
  receiving_facility_id UUID REFERENCES public.hospital_network(id) ON DELETE SET NULL,
  urgency TEXT CHECK (urgency IN ('routine', 'urgent', 'critical')) DEFAULT 'routine',
  reason TEXT NOT NULL,
  clinical_summary TEXT,
  status TEXT CHECK (status IN ('initiated', 'in_transit', 'accepted', 'completed', 'cancelled')) DEFAULT 'initiated',
  transport_type TEXT DEFAULT '108 Ambulance',
  referral_date TIMESTAMPTZ DEFAULT now() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- 9. Clinical Lab Tests Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clinical_lab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  test_name TEXT NOT NULL,
  test_category TEXT,
  sample_date DATE DEFAULT CURRENT_DATE NOT NULL,
  result_date DATE,
  status TEXT CHECK (status IN ('ordered', 'sample_collected', 'in_progress', 'completed', 'flagged')) DEFAULT 'ordered',
  result_value TEXT,
  reference_range TEXT,
  is_abnormal BOOLEAN DEFAULT false,
  facility_name TEXT DEFAULT 'PHC Rampur Diagnostic Unit',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- 10. Community Wall & Announcements
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- 11. Automated Triggers & Functions
-- ==============================================================================

-- Trigger to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone, role, health_facility, area)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Healthcare Worker'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'field_worker'),
    COALESCE(new.raw_user_meta_data->>'health_facility', 'PHC Rampur'),
    COALESCE(new.raw_user_meta_data->>'area', 'Sector 4, Block 3')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for auto-updating timestamps
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_pregnancies_updated_at
  BEFORE UPDATE ON public.pregnancies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER set_immunization_updated_at
  BEFORE UPDATE ON public.immunization_records
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==============================================================================
-- 12. Row Level Security (RLS)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anc_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccine_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.immunization_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_network ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_lab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to vaccine catalog & hospital directory
CREATE POLICY "Public vaccine catalog read" ON public.vaccine_catalog FOR SELECT USING (true);
CREATE POLICY "Public hospital directory read" ON public.hospital_network FOR SELECT USING (true);
CREATE POLICY "Public community posts read" ON public.community_posts FOR SELECT USING (true);

-- Allow authenticated health workers full read & write access to clinical data
CREATE POLICY "Healthcare worker profiles select" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Healthcare worker profiles update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Patients policy" ON public.patients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Pregnancies policy" ON public.pregnancies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "ANC visits policy" ON public.anc_visits FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Immunization policy" ON public.immunization_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Referrals policy" ON public.referrals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Lab tests policy" ON public.clinical_lab_tests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Community posts write" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (true);

-- Allow anonymous key select for initial demo / onboarding
CREATE POLICY "Anon patients read" ON public.patients FOR SELECT TO anon USING (true);
CREATE POLICY "Anon pregnancies read" ON public.pregnancies FOR SELECT TO anon USING (true);
CREATE POLICY "Anon anc read" ON public.anc_visits FOR SELECT TO anon USING (true);
CREATE POLICY "Anon imm read" ON public.immunization_records FOR SELECT TO anon USING (true);

-- ==============================================================================
-- 13. National Healthcare Seed Data (Mission Indradhanush & ABDM)
-- ==============================================================================

-- Vaccine Catalog (National Immunization Schedule)
INSERT INTO public.vaccine_catalog (code, name, due_period, due_days_min, due_days_max, route, site, dose) VALUES
  ('BCG', 'Bacillus Calmette–Guérin', 'At Birth', 0, 15, 'Intradermal', 'Left upper arm', '0.05 ml'),
  ('OPV-0', 'Oral Polio Vaccine 0', 'At Birth', 0, 15, 'Oral', 'Mouth', '2 drops'),
  ('HEPB-0', 'Hepatitis B Birth Dose', 'At Birth', 0, 1, 'Intramuscular', 'Anterolateral mid-thigh', '0.5 ml'),
  ('OPV-1', 'Oral Polio Vaccine 1', '6 Weeks', 42, 56, 'Oral', 'Mouth', '2 drops'),
  ('PENTA-1', 'Pentavalent 1 (DPT+HepB+Hib)', '6 Weeks', 42, 56, 'Intramuscular', 'Anterolateral mid-thigh', '0.5 ml'),
  ('ROTA-1', 'Rotavirus Vaccine 1', '6 Weeks', 42, 56, 'Oral', 'Mouth', '5 drops'),
  ('IPV-1', 'Inactivated Polio Vaccine 1', '6 Weeks', 42, 56, 'Intradermal', 'Right upper arm', '0.1 ml'),
  ('PCV-1', 'Pneumococcal Conjugate 1', '6 Weeks', 42, 56, 'Intramuscular', 'Anterolateral mid-thigh', '0.5 ml'),
  ('OPV-2', 'Oral Polio Vaccine 2', '10 Weeks', 70, 84, 'Oral', 'Mouth', '2 drops'),
  ('PENTA-2', 'Pentavalent 2 (DPT+HepB+Hib)', '10 Weeks', 70, 84, 'Intramuscular', 'Anterolateral mid-thigh', '0.5 ml'),
  ('ROTA-2', 'Rotavirus Vaccine 2', '10 Weeks', 70, 84, 'Oral', 'Mouth', '5 drops'),
  ('OPV-3', 'Oral Polio Vaccine 3', '14 Weeks', 98, 112, 'Oral', 'Mouth', '2 drops'),
  ('PENTA-3', 'Pentavalent 3 (DPT+HepB+Hib)', '14 Weeks', 98, 112, 'Intramuscular', 'Anterolateral mid-thigh', '0.5 ml'),
  ('ROTA-3', 'Rotavirus Vaccine 3', '14 Weeks', 98, 112, 'Oral', 'Mouth', '5 drops'),
  ('MR-1', 'Measles-Rubella 1', '9-12 Months', 270, 365, 'Subcutaneous', 'Right upper arm', '0.5 ml'),
  ('JE-1', 'Japanese Encephalitis 1', '9-12 Months', 270, 365, 'Subcutaneous', 'Left upper arm', '0.5 ml'),
  ('DPT-B1', 'DPT Booster 1', '16-24 Months', 480, 730, 'Intramuscular', 'Anterolateral mid-thigh', '0.5 ml'),
  ('MR-2', 'Measles-Rubella 2', '16-24 Months', 480, 730, 'Subcutaneous', 'Right upper arm', '0.5 ml'),
  ('OPV-B', 'Oral Polio Vaccine Booster', '16-24 Months', 480, 730, 'Oral', 'Mouth', '2 drops'),
  ('DPT-B2', 'DPT Booster 2', '5-6 Years', 1825, 2190, 'Intramuscular', 'Upper arm', '0.5 ml')
ON CONFLICT (code) DO NOTHING;

-- Hospital Network Facilities
INSERT INTO public.hospital_network (name, type, category, district, block, phone, total_beds, available_beds, icu_beds, nicu_beds, maternity_beds, specialties, is_connected) VALUES
  ('District Hospital Patna', 'District Hospital', 'government', 'Patna', 'Central', '+91-612-2345678', 500, 48, 24, 12, 45, ARRAY['Gynecology', 'Pediatrics', 'Cardiology', 'Emergency', 'Blood Bank'], true),
  ('CHC Patliputra', 'CHC', 'government', 'Patna', 'Block 3', '+91-612-2456789', 50, 12, 4, 2, 16, ARRAY['Obstetrics', 'Pediatrics', 'General Surgery'], true),
  ('PHC Rampur Sub-Center', 'PHC', 'government', 'Patna', 'Block 3', '+91-612-2567890', 15, 6, 0, 0, 8, ARRAY['Antenatal Care', 'Routine Immunization', 'Normal Delivery'], true),
  ('Nalanda Medical College & Hospital', 'Medical College', 'government', 'Patna', 'East Block', '+91-612-2678901', 750, 62, 35, 20, 60, ARRAY['High Risk Obstetrics', 'NICU Level 3', 'Trauma'], true)
ON CONFLICT DO NOTHING;

-- Sample Seed Patient (Mother: Sunita Devi)
INSERT INTO public.patients (id, rch_id, abha_id, patient_type, full_name, phone, date_of_birth, blood_group, district, block, village, address, risk_flags)
VALUES (
  'a1111111-1111-1111-1111-111111111111',
  'RCH12345678',
  '91-2345-6789-0123',
  'pregnant',
  'Sunita Devi',
  '+91 98765 43210',
  '1998-04-12',
  'B+',
  'Patna',
  'Block 3',
  'Madhubani',
  'House 42, Ward 3, Village Madhubani',
  ARRAY['High BP (140/92)', 'Mild Anemia (9.8 g/dL)']
) ON CONFLICT (rch_id) DO NOTHING;

-- Pregnancy Record for Sunita Devi
INSERT INTO public.pregnancies (id, patient_id, pregnancy_number, lmp, edd, gestational_weeks, status, risk_level, risk_factors)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  2,
  '2024-07-10',
  '2025-04-15',
  32,
  'active',
  'high',
  ARRAY['Gestational Hypertension', 'Anemia']
) ON CONFLICT DO NOTHING;

-- ANC Visit 3 for Sunita Devi
INSERT INTO public.anc_visits (pregnancy_id, patient_id, visit_number, visit_date, trimester, weight_kg, bp_systolic, bp_diastolic, pulse_bpm, hemoglobin_g_dl, ifa_tablets_given, calcium_tablets_given, td_booster_given, danger_signs, clinical_notes)
VALUES (
  'b1111111-1111-1111-1111-111111111111',
  'a1111111-1111-1111-1111-111111111111',
  3,
  '2025-01-10',
  'third',
  58.5,
  138,
  88,
  78,
  10.2,
  100,
  100,
  true,
  ARRAY['Mild pedal edema'],
  'Advised dietary iron intake, prescribed Iron Sucrose evaluation if Hb drops below 9.5.'
) ON CONFLICT DO NOTHING;

-- Sample Seed Patient (Child: Rahul Kumar)
INSERT INTO public.patients (id, rch_id, abha_id, patient_type, full_name, date_of_birth, gender, blood_group, district, block, guardian_name, guardian_phone, mother_id)
VALUES (
  'c1111111-1111-1111-1111-111111111111',
  'RCH87654321',
  '91-8765-4321-9876',
  'child',
  'Rahul Kumar',
  '2023-06-20',
  'male',
  'O+',
  'Patna',
  'Block 3',
  'Sunita Devi',
  '+91 98765 43210',
  'a1111111-1111-1111-1111-111111111111'
) ON CONFLICT (rch_id) DO NOTHING;

-- Immunization Records for Rahul Kumar
INSERT INTO public.immunization_records (child_id, vaccine_code, vaccine_name, due_date, administered_date, status, batch_number, facility_name, administered_by, parent_notified) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'BCG', 'Bacillus Calmette–Guérin', '2023-06-20', '2023-06-21', 'administered', 'BCG-23-441', 'PHC Rampur', 'Priya Sharma (ANM)', true),
  ('c1111111-1111-1111-1111-111111111111', 'OPV-0', 'Oral Polio Vaccine 0', '2023-06-20', '2023-06-21', 'administered', 'OPV-23-102', 'PHC Rampur', 'Priya Sharma (ANM)', true),
  ('c1111111-1111-1111-1111-111111111111', 'PENTA-1', 'Pentavalent 1 (DPT+HepB+Hib)', '2023-08-01', '2023-08-03', 'administered', 'PNT-23-908', 'PHC Rampur', 'Priya Sharma (ANM)', true),
  ('c1111111-1111-1111-1111-111111111111', 'MR-1', 'Measles-Rubella 1', '2024-03-20', '2024-03-25', 'administered', 'MR-24-311', 'PHC Rampur', 'Priya Sharma (ANM)', true),
  ('c1111111-1111-1111-1111-111111111111', 'DPT-B1', 'DPT Booster 1', '2025-01-15', NULL, 'overdue', NULL, 'PHC Rampur', NULL, false),
  ('c1111111-1111-1111-1111-111111111111', 'MR-2', 'Measles-Rubella 2', '2025-02-15', NULL, 'upcoming', NULL, 'PHC Rampur', NULL, true)
ON CONFLICT DO NOTHING;

-- Community Wall Seed Post
INSERT INTO public.community_posts (author_name, author_role, category, title, content, priority, likes_count) VALUES
  ('Dr. Amit Kumar', 'Medical Officer In-Charge', 'Campaign', 'Mission Indradhanush Special Drive in Block 3 Starting Monday', 'All ANMs and ASHA workers are requested to mobilize due-list children for MR-2 and DPT boosters. Mobile vaccine ice packs will be distributed at 8:00 AM.', 'high', 14),
  ('Priya Sharma', 'Field Worker (ANM)', 'Field Update', 'Successful Home ANC Screening in Ward 4', 'Screened 12 pregnant beneficiaries today. Identified 2 mild anemia cases and distributed IFA supplements.', 'normal', 8)
ON CONFLICT DO NOTHING;
