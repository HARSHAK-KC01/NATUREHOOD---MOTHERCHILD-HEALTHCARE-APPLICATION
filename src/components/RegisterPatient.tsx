import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { 
  Camera, 
  QrCode, 
  Save, 
  Baby, 
  Heart, 
  Database as DatabaseIcon, 
  Sparkles, 
  CheckCircle2, 
  Copy, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { patientService } from "../services/patientService";
import { ancService } from "../services/ancService";
import { isSupabaseConfigured } from "../lib/supabase";

interface RegisterPatientProps {
  onNavigate?: (view: string) => void;
  onViewChange?: (view: string) => void;
}

export function RegisterPatient({ onNavigate, onViewChange }: RegisterPatientProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    expectedDeliveryDate: '',
    patientType: 'pregnant' as 'pregnant' | 'child',
    district: 'Patna',
    block: 'Block 3',
    village: '',
    guardianName: '',
    rchId: '',
    abhaId: '',
    lastMenstrualPeriod: '',
    bloodGroup: 'B+',
    riskFlags: [] as string[],
    notes: ''
  });

  const navigate = (v: string) => {
    if (onNavigate) onNavigate(v);
    else if (onViewChange) onViewChange(v);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredResult, setRegisteredResult] = useState<{
    id: string;
    rchId: string;
    name: string;
    isSupabase: boolean;
  } | null>(null);

  const isCloud = isSupabaseConfigured();

  const handleRiskFlagChange = (flag: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      riskFlags: checked 
        ? [...prev.riskFlags, flag]
        : prev.riskFlags.filter(f => f !== flag)
    }));
  };

  const handleFillDemo = () => {
    const isPregnant = formData.patientType === 'pregnant';
    if (isPregnant) {
      setFormData({
        name: 'Anita Kumari',
        phone: '+91 98350 ' + Math.floor(10000 + Math.random() * 90000),
        dateOfBirth: '1998-05-14',
        expectedDeliveryDate: '2025-05-20',
        patientType: 'pregnant',
        district: 'Patna',
        block: 'Block 2',
        village: 'Rampur Khurd',
        guardianName: 'Rajesh Kumar (Husband)',
        rchId: '',
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        lastMenstrualPeriod: '2024-08-15',
        bloodGroup: 'O+',
        riskFlags: ['High BP', 'Anemia'],
        notes: 'Advised weekly iron folic acid checkup and sonography at CHC.'
      });
    } else {
      setFormData({
        name: 'Aarav Kumar',
        phone: '+91 98350 ' + Math.floor(10000 + Math.random() * 90000),
        dateOfBirth: '2024-02-10',
        expectedDeliveryDate: '',
        patientType: 'child',
        district: 'Patna',
        block: 'Block 3',
        village: 'Madhubani',
        guardianName: 'Anita Devi (Mother)',
        rchId: '',
        abhaId: `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
        lastMenstrualPeriod: '',
        bloodGroup: 'B+',
        riskFlags: [],
        notes: 'Birth weight 2.9kg, normal delivery at Sub-centre Rampur.'
      });
    }
    toast.info("Demo patient details populated!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Please enter the patient's full name");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Generate RCH ID if not provided
      const finalRchId = formData.rchId.trim() || `RCH${Math.floor(10000000 + Math.random() * 90000000)}`;

      // 2. Register into Supabase / local store
      const { patient, error } = await patientService.registerPatient({
        rch_id: finalRchId,
        abha_id: formData.abhaId.trim() || null,
        patient_type: formData.patientType,
        full_name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        date_of_birth: formData.dateOfBirth || null,
        gender: formData.patientType === 'pregnant' ? 'female' : 'male',
        blood_group: formData.bloodGroup,
        district: formData.district,
        block: formData.block,
        village: formData.village.trim() || null,
        address: `${formData.village}, ${formData.block}, ${formData.district}`,
        guardian_name: formData.guardianName.trim() || null,
        risk_flags: formData.riskFlags,
        notes: formData.notes.trim() || null,
      });

      if (error || !patient) {
        toast.error(`Registration error: ${error || 'Unknown failure'}`);
        setIsSubmitting(false);
        return;
      }

      // 3. If pregnant, automatically create a linked pregnancy record
      if (formData.patientType === 'pregnant' && (formData.expectedDeliveryDate || formData.lastMenstrualPeriod)) {
        await ancService.createPregnancy({
          patient_id: patient.id,
          pregnancy_number: 1,
          lmp: formData.lastMenstrualPeriod || new Date().toISOString().split('T')[0],
          edd: formData.expectedDeliveryDate || new Date(Date.now() + 240 * 86400000).toISOString().split('T')[0],
          gestational_weeks: 14,
          status: 'active',
          risk_level: formData.riskFlags.length > 0 ? 'high' : 'low',
          risk_factors: formData.riskFlags,
        });
      }

      setRegisteredResult({
        id: patient.id,
        rchId: patient.rch_id,
        name: patient.full_name,
        isSupabase: isCloud,
      });

      toast.success(
        isCloud 
          ? `Patient saved to Supabase Cloud! RCH ID: ${patient.rch_id}`
          : `Patient registered locally (offline mode)! RCH ID: ${patient.rch_id}`
      );
    } catch (err: any) {
      toast.error(`Unexpected error: ${err.message || 'Failed'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setRegisteredResult(null);
    setFormData({
      name: '',
      phone: '',
      dateOfBirth: '',
      expectedDeliveryDate: '',
      patientType: 'pregnant',
      district: 'Patna',
      block: 'Block 3',
      village: '',
      guardianName: '',
      rchId: '',
      abhaId: '',
      lastMenstrualPeriod: '',
      bloodGroup: 'B+',
      riskFlags: [],
      notes: ''
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("RCH ID copied to clipboard!");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header section with backend status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-card border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Register New Beneficiary</h2>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              isCloud 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              <DatabaseIcon className="w-3.5 h-3.5" />
              {isCloud ? 'Supabase Live' : 'Offline / Mock Store'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Enrolls mother or infant into RCH 2.0 & Ayushman Bharat Digital Mission (ABDM) registry
          </p>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleFillDemo}
          className="rounded-2xl border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600" />
          Fill Demo Data
        </Button>
      </div>

      {/* Success banner if just registered */}
      {registeredResult && (
        <Card className="p-6 bg-emerald-50/70 border-emerald-300 rounded-3xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-emerald-900">
                  Beneficiary Enrolled Successfully!
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-200/70 text-emerald-800">
                  {registeredResult.isSupabase ? 'Cloud Synced' : 'Stored in Local Memory'}
                </span>
              </div>
              <p className="text-sm text-emerald-700">
                Patient <strong className="font-semibold text-emerald-950">{registeredResult.name}</strong> has been assigned government RCH identifier:
              </p>
              
              <div className="flex items-center gap-3 pt-2">
                <div className="bg-white border border-emerald-300 px-4 py-2 rounded-2xl font-mono text-base font-bold text-emerald-900 shadow-xs">
                  {registeredResult.rchId}
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => copyToClipboard(registeredResult.rchId)}
                  className="rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-100/50"
                >
                  <Copy className="w-4 h-4 mr-1.5" />
                  Copy
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => navigate('unified-records')}
                  className="rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-100/50"
                >
                  View in Mother-Child Records
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleReset}
                  className="rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white ml-auto"
                >
                  Register Another Patient
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Type Selector */}
        <Card className="p-6 rounded-3xl border border-border shadow-xs">
          <h3 className="text-base font-semibold text-foreground mb-4">Select Beneficiary Category</h3>
          <RadioGroup 
            value={formData.patientType} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, patientType: value as any }))}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <label
              htmlFor="pregnant"
              className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                formData.patientType === 'pregnant'
                  ? 'border-rose-500 bg-rose-50/60 shadow-xs'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <RadioGroupItem value="pregnant" id="pregnant" className="text-rose-600" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Pregnant Woman</p>
                  <p className="text-xs text-muted-foreground">Antenatal care, EDD tracking, high-risk flags</p>
                </div>
              </div>
            </label>

            <label
              htmlFor="child"
              className={`flex items-center gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                formData.patientType === 'child'
                  ? 'border-indigo-500 bg-indigo-50/60 shadow-xs'
                  : 'border-border hover:border-muted-foreground/30'
              }`}
            >
              <RadioGroupItem value="child" id="child" className="text-indigo-600" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Baby className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Infant / Child (0 - 5 Years)</p>
                  <p className="text-xs text-muted-foreground">Mission Indradhanush, immunization card</p>
                </div>
              </div>
            </label>
          </RadioGroup>
        </Card>

        {/* Identity & Basic Details */}
        <Card className="p-6 rounded-3xl border border-border shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-foreground">Basic Information</h3>
            <span className="text-xs text-muted-foreground font-medium">* Required fields</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Full Name *
              </Label>
              <Input 
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Sunita Devi"
                className="h-12 rounded-2xl"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Primary Contact Number
              </Label>
              <Input 
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rchId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Government RCH ID (Auto-generated if blank)
              </Label>
              <Input 
                id="rchId"
                value={formData.rchId}
                onChange={(e) => setFormData(prev => ({ ...prev, rchId: e.target.value }))}
                placeholder="Leave blank for automatic RCH generation"
                className="h-12 rounded-2xl font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abhaId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ABHA ID (Ayushman Bharat Health Account)
              </Label>
              <Input 
                id="abhaId"
                value={formData.abhaId}
                onChange={(e) => setFormData(prev => ({ ...prev, abhaId: e.target.value }))}
                placeholder="e.g. 91-4455-6677-8899"
                className="h-12 rounded-2xl font-mono text-sm"
              />
            </div>

            {formData.patientType === 'pregnant' ? (
              <div className="space-y-2">
                <Label htmlFor="edd" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Expected Delivery Date (EDD)
                </Label>
                <Input 
                  id="edd"
                  type="date"
                  value={formData.expectedDeliveryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                  className="h-12 rounded-2xl"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="dob" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Date of Birth *
                </Label>
                <Input 
                  id="dob"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="h-12 rounded-2xl"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="guardian" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Guardian / Spouse Name
              </Label>
              <Input 
                id="guardian"
                value={formData.guardianName}
                onChange={(e) => setFormData(prev => ({ ...prev, guardianName: e.target.value }))}
                placeholder="Husband / Father / Mother"
                className="h-12 rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodGroup" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Blood Group
              </Label>
              <Select 
                value={formData.bloodGroup} 
                onValueChange={(val) => setFormData(prev => ({ ...prev, bloodGroup: val }))}
              >
                <SelectTrigger id="bloodGroup" className="h-12 rounded-2xl">
                  <SelectValue placeholder="Select Blood Group" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Location & Catchment Area */}
        <Card className="p-6 rounded-3xl border border-border shadow-xs">
          <h3 className="text-base font-semibold text-foreground mb-4">Location & Catchment Area</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="district" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                District *
              </Label>
              <Select 
                value={formData.district} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, district: value }))}
              >
                <SelectTrigger className="h-12 rounded-2xl">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Patna">Patna</SelectItem>
                  <SelectItem value="Madhubani">Madhubani</SelectItem>
                  <SelectItem value="Darbhanga">Darbhanga</SelectItem>
                  <SelectItem value="Sitamarhi">Sitamarhi</SelectItem>
                  <SelectItem value="Gaya">Gaya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="block" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Block *
              </Label>
              <Select 
                value={formData.block} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, block: value }))}
              >
                <SelectTrigger className="h-12 rounded-2xl">
                  <SelectValue placeholder="Select block" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="Block 1">Block 1 (Central)</SelectItem>
                  <SelectItem value="Block 2">Block 2 (North)</SelectItem>
                  <SelectItem value="Block 3">Block 3 (East)</SelectItem>
                  <SelectItem value="Block 4">Block 4 (Rural)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="village" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Village / Ward *
              </Label>
              <Input 
                id="village"
                value={formData.village}
                onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                placeholder="e.g. Rampur, Ward 4"
                className="h-12 rounded-2xl"
                required
              />
            </div>
          </div>
        </Card>

        {/* Clinical & Pregnancy Specific details */}
        {formData.patientType === 'pregnant' && (
          <Card className="p-6 rounded-3xl border border-border shadow-xs">
            <h3 className="text-base font-semibold text-foreground mb-4">Obstetric Details & Risk Evaluation</h3>
            <div className="space-y-5">
              <div className="space-y-2 max-w-sm">
                <Label htmlFor="lmp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last Menstrual Period (LMP)
                </Label>
                <Input 
                  id="lmp"
                  type="date"
                  value={formData.lastMenstrualPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastMenstrualPeriod: e.target.value }))}
                  className="h-12 rounded-2xl"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <Label className="text-sm font-semibold text-foreground">
                    High Risk Pregnancy (HRP) Screening Indicators:
                  </Label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Previous C-section', 
                    'High BP (>140/90)', 
                    'Gestational Diabetes', 
                    'Maternal Age > 35', 
                    'Previous Stillbirth / Miscarriage', 
                    'Severe Anemia (< 7 g/dL)',
                    'Twin / Multiple Gestation',
                    'Rh Negative Blood'
                  ].map((flag) => (
                    <div 
                      key={flag} 
                      className={`flex items-center space-x-2.5 p-3 rounded-2xl border transition-all ${
                        formData.riskFlags.includes(flag)
                          ? 'border-amber-400 bg-amber-50/70'
                          : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <Checkbox 
                        id={flag}
                        checked={formData.riskFlags.includes(flag)}
                        onCheckedChange={(checked) => handleRiskFlagChange(flag, checked as boolean)}
                        className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                      />
                      <Label htmlFor={flag} className="text-xs font-medium cursor-pointer leading-tight">
                        {flag}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Clinical Notes & Action */}
        <Card className="p-6 rounded-3xl border border-border shadow-xs">
          <h3 className="text-base font-semibold text-foreground mb-4">Observations & Clinical Notes</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Field Health Worker Remarks
              </Label>
              <Textarea 
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Prescribed IFA tablets, advised institutional delivery at Sub-District Hospital..."
                rows={3}
                className="rounded-2xl resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                className="rounded-2xl"
                onClick={() => toast.success("Document and Aadhaar card capture camera opened")}
              >
                <Camera className="h-4 w-4 mr-2" />
                Capture Document Photo
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="rounded-2xl"
                onClick={() => {
                  toast.info("Opening ABDM QR scanner...");
                  navigate('scan');
                }}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scan ABHA QR
              </Button>
            </div>
          </div>
        </Card>

        {/* Submission Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting}
            className="flex-1 h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-base shadow-md transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Registering & Syncing with Supabase...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Register Beneficiary to {isCloud ? 'Supabase Database' : 'System Registry'}
              </>
            )}
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            size="lg"
            onClick={handleReset}
            className="h-14 rounded-2xl border-border px-6"
          >
            Reset Form
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RegisterPatient;
