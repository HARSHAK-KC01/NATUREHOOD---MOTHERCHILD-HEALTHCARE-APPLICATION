import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { 
  Calendar, 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Syringe, 
  Baby, 
  MessageSquare, 
  Bell,
  Check,
  Send,
  Phone,
  ShieldCheck,
  Database as DatabaseIcon
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import { immunizationService } from "../services/immunizationService";
import { isSupabaseConfigured } from "../lib/supabase";

interface VaccineRecord {
  id: string;
  childId: string;
  childName: string;
  childAge: string;
  vaccine: string;
  scheduledDate: string;
  administeredDate?: string;
  status: 'pending' | 'administered' | 'overdue' | 'upcoming';
  batch?: string;
  facility?: string;
  administrator?: string;
  nextDose?: string;
  reactions?: string;
  parentNotified: boolean;
}

interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  rchId: string;
  parentName: string;
  parentPhone: string;
}

const mockChildren: Child[] = [
  {
    id: 'child-001',
    name: 'Rahul Kumar',
    dateOfBirth: '2022-10-15',
    rchId: 'RCH202000456',
    parentName: 'Sunita Devi',
    parentPhone: '+91-9876543210'
  },
  {
    id: 'child-002',
    name: 'Priya Sharma',
    dateOfBirth: '2023-03-20',
    rchId: 'RCH202300789',
    parentName: 'Rekha Sharma',
    parentPhone: '+91-9876543211'
  }
];

const mockVaccineRecords: VaccineRecord[] = [
  {
    id: 'vacc-001',
    childId: 'child-001',
    childName: 'Rahul Kumar',
    childAge: '2 years 4 months',
    vaccine: 'DPT Booster 1',
    scheduledDate: '2025-01-20',
    status: 'upcoming',
    nextDose: 'DPT Booster 2 (at 5 yrs)',
    parentNotified: true
  },
  {
    id: 'vacc-002',
    childId: 'child-001',
    childName: 'Rahul Kumar',
    childAge: '2 years 4 months',
    vaccine: 'Measles-Rubella (MR-2)',
    scheduledDate: '2025-01-15',
    status: 'overdue',
    parentNotified: false
  },
  {
    id: 'vacc-003',
    childId: 'child-001',
    childName: 'Rahul Kumar',
    childAge: '2 years 4 months',
    vaccine: 'Oral Polio Vaccine (OPV Booster)',
    scheduledDate: '2024-09-10',
    administeredDate: '2024-09-12',
    status: 'administered',
    batch: 'POL2024-09B',
    facility: 'PHC Rampur',
    administrator: 'Priya Sharma (ANM)',
    parentNotified: true
  },
  {
    id: 'vacc-004',
    childId: 'child-002',
    childName: 'Priya Sharma',
    childAge: '1 year 10 months',
    vaccine: 'Pentavalent-3 & Rota-3',
    scheduledDate: '2024-05-18',
    administeredDate: '2024-05-18',
    status: 'administered',
    batch: 'PENT-7841',
    facility: 'District Hospital',
    administrator: 'Dr. Amit Kumar',
    parentNotified: true
  }
];

export function VaccinationTimeline() {
  const { t } = useLanguage();
  const [vaccineRecords, setVaccineRecords] = useState<VaccineRecord[]>(mockVaccineRecords);
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<VaccineRecord | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    administeredDate: new Date().toISOString().split('T')[0],
    batch: '',
    facility: 'PHC Rampur',
    administrator: 'Priya Sharma (ANM)',
    reactions: ''
  });

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    const months = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (years === 0) return `${months} months`;
    return `${years} yr ${remainingMonths} mo`;
  };

  const filteredRecords = vaccineRecords.filter(record => {
    const matchesChild = selectedChild === 'all' || record.childId === selectedChild;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesSearch = searchQuery === '' || 
      record.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.vaccine.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChild && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: VaccineRecord['status']) => {
    switch (status) {
      case 'administered':
        return <Badge variant="success">Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive" className="animate-pulse">Overdue</Badge>;
      case 'upcoming':
        return <Badge variant="default">Upcoming</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: VaccineRecord['status']) => {
    switch (status) {
      case 'administered':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-rose-600" />;
      default:
        return <Clock className="h-5 w-5 text-primary" />;
    }
  };

  const handleUpdateVaccination = (record: VaccineRecord) => {
    setSelectedRecord(record);
    setUpdateData({
      administeredDate: new Date().toISOString().split('T')[0],
      batch: `BATCH-${Math.floor(1000 + Math.random() * 9000)}`,
      facility: 'PHC Rampur Sub-Center',
      administrator: 'Priya Sharma (ANM)',
      reactions: 'None observed after 30 min observation'
    });
    setIsUpdateDialogOpen(true);
  };

  const confirmAdministered = async () => {
    if (!selectedRecord) return;

    try {
      await immunizationService.recordVaccination(selectedRecord.id, {
        administeredDate: updateData.administeredDate,
        batchNumber: updateData.batch,
        facilityName: updateData.facility,
        administeredBy: updateData.administrator,
        adverseReactions: updateData.reactions,
      });

      setVaccineRecords(prev => prev.map(record =>
        record.id === selectedRecord.id
          ? {
              ...record,
              status: 'administered' as const,
              administeredDate: updateData.administeredDate,
              batch: updateData.batch,
              facility: updateData.facility,
              administrator: updateData.administrator,
              reactions: updateData.reactions,
              parentNotified: true
            }
          : record
      ));

      setIsUpdateDialogOpen(false);
      setSelectedRecord(null);
      const isCloud = isSupabaseConfigured();
      toast.success(
        isCloud 
          ? "Vaccine administration saved to Supabase Cloud & RCH Registry!" 
          : "Vaccine administration logged to local RCH registry!"
      );
    } catch {
      toast.error("Failed to update vaccination record");
    }
  };

  const sendReminder = async (record: VaccineRecord) => {
    const child = mockChildren.find(c => c.id === record.childId);
    if (child) {
      await immunizationService.sendReminder(record.id);
      setVaccineRecords(prev => prev.map(r => 
        r.id === record.id ? { ...r, parentNotified: true } : r
      ));
      toast.success(`Reminder SMS dispatched to ${child.parentName} for ${record.vaccine}`);
    }
  };

  const groupedRecords = filteredRecords.reduce((acc, record) => {
    if (!acc[record.childId]) {
      acc[record.childId] = [];
    }
    acc[record.childId].push(record);
    return acc;
  }, {} as { [key: string]: VaccineRecord[] });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t('nav.timeline')}
            </h2>
            <Badge variant="primary" className="text-xs">
              U-WIN / Indradhanush
            </Badge>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              isSupabaseConfigured()
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              <DatabaseIcon className="w-3 h-3" />
              {isSupabaseConfigured() ? 'Supabase Connected' : 'Offline Store'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Age-wise milestone immunization tracker, batch verification & SMS alerts
          </p>
        </div>

        <Button 
          onClick={() => toast.info("Opening Add Child beneficiary")}
          className="rounded-xl shadow-sm"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Add Child Record
        </Button>
      </div>

      {/* Filter Toolbar */}
      <Card className="p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              placeholder="Search child name or vaccine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl text-xs"
            />
          </div>

          <Select value={selectedChild} onValueChange={setSelectedChild}>
            <SelectTrigger className="w-48 h-10 rounded-xl text-xs">
              <SelectValue placeholder="All Children" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Children</SelectItem>
              {mockChildren.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 h-10 rounded-xl text-xs">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
              <SelectItem value="administered">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 rounded-2xl text-center">
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {filteredRecords.filter(r => r.status === 'administered').length}
          </p>
          <p className="text-xs font-semibold text-muted-foreground mt-0.5">Doses Given</p>
        </Card>

        <Card className="p-4 rounded-2xl text-center">
          <p className="text-2xl sm:text-3xl font-extrabold text-primary">
            {filteredRecords.filter(r => r.status === 'upcoming').length}
          </p>
          <p className="text-xs font-semibold text-muted-foreground mt-0.5">Upcoming Doses</p>
        </Card>

        <Card className="p-4 rounded-2xl text-center border-l-4 border-l-rose-500">
          <p className="text-2xl sm:text-3xl font-extrabold text-rose-600">
            {filteredRecords.filter(r => r.status === 'overdue').length}
          </p>
          <p className="text-xs font-semibold text-muted-foreground mt-0.5">Overdue / Dropout</p>
        </Card>

        <Card className="p-4 rounded-2xl text-center">
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600">
            {filteredRecords.filter(r => !r.parentNotified).length}
          </p>
          <p className="text-xs font-semibold text-muted-foreground mt-0.5">Pending Reminders</p>
        </Card>
      </div>

      {/* Children Timeline Group */}
      <div className="space-y-6">
        {Object.entries(groupedRecords).map(([childId, records]) => {
          const child = mockChildren.find(c => c.id === childId);
          if (!child) return null;

          return (
            <Card key={childId} className="p-6 rounded-3xl">
              {/* Child Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-border/60 mb-6">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/15 to-blue-500/15 text-primary flex items-center justify-center font-bold">
                    <Baby className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg text-foreground">{child.name}</h3>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {calculateAge(child.dateOfBirth)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      RCH Beneficiary ID: {child.rchId}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs bg-muted/40 px-3.5 py-2 rounded-xl border border-border/50">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground">Parent: </span>
                    <span className="font-bold text-foreground">{child.parentName}</span>
                    <span className="text-muted-foreground ml-1.5 font-mono">({child.parentPhone})</span>
                  </div>
                </div>
              </div>

              {/* Vaccine Milestone Rows */}
              <div className="space-y-4">
                {records.map((record, index) => (
                  <div key={record.id} className="flex items-start gap-4">
                    {/* Timeline Node */}
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs ${
                        record.status === 'administered' 
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 text-emerald-600'
                          : record.status === 'overdue'
                          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 text-rose-600'
                          : 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 text-primary'
                      }`}>
                        {getStatusIcon(record.status)}
                      </div>
                      {index < records.length - 1 && (
                        <div className="w-0.5 h-14 bg-border/70 my-1" />
                      )}
                    </div>

                    {/* Vaccine Dose Card */}
                    <div className="flex-1 p-4 rounded-2xl bg-muted/30 border border-border/70 hover:bg-muted/50 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <h4 className="font-bold text-sm text-foreground">{record.vaccine}</h4>
                          {getStatusBadge(record.status)}
                        </div>

                        <div className="flex items-center gap-2">
                          {!record.parentNotified && record.status !== 'administered' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendReminder(record)}
                              className="h-8 rounded-xl text-xs font-semibold"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Send SMS
                            </Button>
                          )}

                          {record.status !== 'administered' && (
                            <Button
                              size="sm"
                              onClick={() => handleUpdateVaccination(record)}
                              className="h-8 rounded-xl text-xs font-semibold shadow-xs"
                            >
                              <Syringe className="h-3.5 w-3.5 mr-1" />
                              Mark Given
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-border/50 text-muted-foreground">
                        <div>
                          <span>Due Date: </span>
                          <span className="font-bold text-foreground">{record.scheduledDate}</span>
                        </div>
                        {record.administeredDate && (
                          <div>
                            <span>Given Date: </span>
                            <span className="font-bold text-emerald-600">{record.administeredDate}</span>
                          </div>
                        )}
                        {record.batch && (
                          <div>
                            <span>Batch No: </span>
                            <span className="font-mono text-foreground">{record.batch}</span>
                          </div>
                        )}
                        {record.facility && (
                          <div>
                            <span>Facility: </span>
                            <span className="font-medium text-foreground">{record.facility}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Record Administration Modal */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="rounded-3xl p-6 sm:p-7 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Record Vaccine Administration</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4 py-2">
              <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                <p className="font-bold text-sm text-foreground">{selectedRecord.vaccine}</p>
                <p className="text-xs text-muted-foreground">{selectedRecord.childName} ({selectedRecord.childAge})</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Administration Date</Label>
                <Input 
                  type="date"
                  value={updateData.administeredDate}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, administeredDate: e.target.value }))}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Vaccine Batch / Lot Number</Label>
                <Input 
                  value={updateData.batch}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, batch: e.target.value }))}
                  placeholder="e.g., BCG-2024-X"
                  className="rounded-xl font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Administering Healthcare Facility</Label>
                <Input 
                  value={updateData.facility}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, facility: e.target.value }))}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold">Adverse Reaction Observations (AEFI)</Label>
                <Input 
                  value={updateData.reactions}
                  onChange={(e) => setUpdateData(prev => ({ ...prev, reactions: e.target.value }))}
                  placeholder="e.g. Mild redness at site, no fever"
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <Button 
                  variant="outline"
                  onClick={() => setIsUpdateDialogOpen(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmAdministered}
                  className="flex-1 rounded-xl font-bold"
                >
                  Confirm & Sync
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default VaccinationTimeline;
