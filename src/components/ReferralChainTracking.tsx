import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, Plus, ArrowRight, MapPin, Clock, AlertTriangle, CheckCircle, Phone, User, Calendar, FileText, Send } from "lucide-react";
import { toast } from "sonner";

interface ReferralRecord {
  id: string;
  patientName: string;
  patientId: string;
  patientAge: string;
  patientPhone: string;
  condition: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  fromFacility: string;
  toFacility: string;
  referredBy: string;
  referredDate: string;
  expectedArrival?: string;
  status: 'referred' | 'in-transit' | 'received' | 'treated' | 'discharged' | 'follow-up-needed';
  statusHistory: StatusUpdate[];
  notes: string;
  attachments: string[];
  followUpRequired: boolean;
  outcome?: string;
}

interface StatusUpdate {
  id: string;
  status: ReferralRecord['status'];
  timestamp: string;
  updatedBy: string;
  facility: string;
  notes?: string;
}

interface Facility {
  id: string;
  name: string;
  type: 'PHC' | 'CHC' | 'District Hospital' | 'Medical College';
  address: string;
  phone: string;
  capacity: number;
  specialties: string[];
}

const mockFacilities: Facility[] = [
  {
    id: 'fac-001',
    name: 'PHC Rampur',
    type: 'PHC',
    address: 'Village Rampur, Block A',
    phone: '+91-9876543210',
    capacity: 15,
    specialties: ['General Medicine', 'Maternal Care']
  },
  {
    id: 'fac-002',
    name: 'CHC Patliputra',
    type: 'CHC',
    address: 'Patliputra, Block A',
    phone: '+91-9876543211',
    capacity: 50,
    specialties: ['General Medicine', 'Surgery', 'Pediatrics', 'Gynecology']
  },
  {
    id: 'fac-003',
    name: 'District Hospital Patna',
    type: 'District Hospital',
    address: 'Patna City',
    phone: '+91-9876543212',
    capacity: 200,
    specialties: ['Emergency', 'ICU', 'Surgery', 'Cardiology', 'Neurology']
  }
];

const mockReferrals: ReferralRecord[] = [
  {
    id: 'ref-001',
    patientName: 'Sunita Devi',
    patientId: 'RCH202400123',
    patientAge: '26 years',
    patientPhone: '+91-9876543210',
    condition: 'Pregnancy complications - High BP',
    urgency: 'high',
    fromFacility: 'PHC Rampur',
    toFacility: 'CHC Patliputra',
    referredBy: 'Dr. Priya Sharma',
    referredDate: '2024-01-15T09:30:00Z',
    expectedArrival: '2024-01-15T12:00:00Z',
    status: 'received',
    notes: 'Patient showing signs of preeclampsia. BP 160/100. Immediate specialist consultation required.',
    attachments: ['bp_readings.pdf', 'urine_test.jpg'],
    followUpRequired: true,
    statusHistory: [
      {
        id: 'status-001',
        status: 'referred',
        timestamp: '2024-01-15T09:30:00Z',
        updatedBy: 'Dr. Priya Sharma',
        facility: 'PHC Rampur',
        notes: 'Referred due to high BP and protein in urine'
      },
      {
        id: 'status-002',
        status: 'in-transit',
        timestamp: '2024-01-15T10:15:00Z',
        updatedBy: 'ANM Sunita',
        facility: 'PHC Rampur',
        notes: 'Patient left for CHC with family'
      },
      {
        id: 'status-003',
        status: 'received',
        timestamp: '2024-01-15T11:45:00Z',
        updatedBy: 'Nurse Rekha',
        facility: 'CHC Patliputra',
        notes: 'Patient arrived and registered. Waiting for gynecologist consultation'
      }
    ]
  },
  {
    id: 'ref-002',
    patientName: 'Baby Rahul Kumar',
    patientId: 'RCH202000456',
    patientAge: '3 years',
    patientPhone: '+91-9876543210',
    condition: 'Severe pneumonia',
    urgency: 'critical',
    fromFacility: 'CHC Patliputra',
    toFacility: 'District Hospital Patna',
    referredBy: 'Dr. Amit Kumar',
    referredDate: '2024-01-14T14:20:00Z',
    status: 'treated',
    notes: 'Child showing difficulty breathing, high fever. Requires immediate pediatric care and possible oxygen support.',
    attachments: ['chest_xray.jpg', 'blood_test.pdf'],
    followUpRequired: true,
    outcome: 'Stable after 2 days treatment. Responding well to antibiotics.',
    statusHistory: [
      {
        id: 'status-004',
        status: 'referred',
        timestamp: '2024-01-14T14:20:00Z',
        updatedBy: 'Dr. Amit Kumar',
        facility: 'CHC Patliputra'
      },
      {
        id: 'status-005',
        status: 'received',
        timestamp: '2024-01-14T15:30:00Z',
        updatedBy: 'Dr. Emergency',
        facility: 'District Hospital Patna'
      },
      {
        id: 'status-006',
        status: 'treated',
        timestamp: '2024-01-16T10:00:00Z',
        updatedBy: 'Dr. Pediatrics',
        facility: 'District Hospital Patna',
        notes: 'Patient stabilized, responding to treatment'
      }
    ]
  }
];

export function ReferralChainTracking() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>(mockReferrals);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState<ReferralRecord | null>(null);
  const [newReferral, setNewReferral] = useState({
    patientName: '',
    patientId: '',
    patientAge: '',
    patientPhone: '',
    condition: '',
    urgency: 'medium' as ReferralRecord['urgency'],
    toFacility: '',
    notes: ''
  });
  const [statusUpdate, setStatusUpdate] = useState({
    status: 'received' as ReferralRecord['status'],
    notes: ''
  });

  const filteredReferrals = referrals.filter(referral => {
    const statusMatch = statusFilter === 'all' || referral.status === statusFilter;
    const urgencyMatch = urgencyFilter === 'all' || referral.urgency === urgencyFilter;
    const searchMatch = searchQuery === '' ||
      referral.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      referral.condition.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && urgencyMatch && searchMatch;
  });

  const getStatusColor = (status: ReferralRecord['status']) => {
    switch (status) {
      case 'referred': return 'bg-blue-100 text-blue-700';
      case 'in-transit': return 'bg-yellow-100 text-yellow-700';
      case 'received': return 'bg-purple-100 text-purple-700';
      case 'treated': return 'bg-green-100 text-green-700';
      case 'discharged': return 'bg-gray-100 text-gray-700';
      case 'follow-up-needed': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyColor = (urgency: ReferralRecord['urgency']) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getStatusProgress = (status: ReferralRecord['status']) => {
    const statusOrder = ['referred', 'in-transit', 'received', 'treated', 'discharged'];
    const currentIndex = statusOrder.indexOf(status);
    return currentIndex >= 0 ? ((currentIndex + 1) / statusOrder.length) * 100 : 0;
  };

  const handleCreateReferral = () => {
    if (!newReferral.patientName || !newReferral.condition || !newReferral.toFacility) {
      toast.error("Please fill in all required fields");
      return;
    }

    const referral: ReferralRecord = {
      id: `ref-${Date.now()}`,
      ...newReferral,
      fromFacility: 'PHC Rampur',
      referredBy: 'Priya Sharma (ANM)',
      referredDate: new Date().toISOString(),
      status: 'referred',
      statusHistory: [{
        id: `status-${Date.now()}`,
        status: 'referred',
        timestamp: new Date().toISOString(),
        updatedBy: 'Priya Sharma (ANM)',
        facility: 'PHC Rampur',
        notes: newReferral.notes
      }],
      attachments: [],
      followUpRequired: true
    };

    // Save to backend API & Supabase
    fetch('/api/referrals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: 'a1111111-1111-1111-1111-111111111111',
        referring_facility: 'PHC Rampur',
        receiving_hospital_name: newReferral.toFacility || 'District Hospital Patna',
        urgency: newReferral.urgency,
        reason: newReferral.condition,
        status: 'initiated'
      })
    }).catch(() => {});

    setReferrals(prev => [referral, ...prev]);
    setNewReferral({
      patientName: '',
      patientId: '',
      patientAge: '',
      patientPhone: '',
      condition: '',
      urgency: 'medium',
      toFacility: '',
      notes: ''
    });
    setIsCreateDialogOpen(false);
    toast.success("Referral chain initiated & synced with hospital network!");
  };

  const handleUpdateStatus = () => {
    if (!selectedReferral) return;

    const newStatusUpdate: StatusUpdate = {
      id: `status-${Date.now()}`,
      status: statusUpdate.status,
      timestamp: new Date().toISOString(),
      updatedBy: 'Current User',
      facility: 'Current Facility',
      notes: statusUpdate.notes
    };

    setReferrals(prev => prev.map(referral =>
      referral.id === selectedReferral.id
        ? {
            ...referral,
            status: statusUpdate.status,
            statusHistory: [...referral.statusHistory, newStatusUpdate]
          }
        : referral
    ));

    setIsUpdateDialogOpen(false);
    setSelectedReferral(null);
    setStatusUpdate({ status: 'received', notes: '' });
    toast.success("Status updated successfully!");
  };

  const openUpdateDialog = (referral: ReferralRecord) => {
    setSelectedReferral(referral);
    const nextStatus = getNextStatus(referral.status);
    setStatusUpdate({ status: nextStatus, notes: '' });
    setIsUpdateDialogOpen(true);
  };

  const getNextStatus = (currentStatus: ReferralRecord['status']): ReferralRecord['status'] => {
    const statusFlow = {
      'referred': 'in-transit',
      'in-transit': 'received',
      'received': 'treated',
      'treated': 'discharged',
      'discharged': 'follow-up-needed'
    };
    return statusFlow[currentStatus] || currentStatus;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-primary mb-2">Referral Chain Tracking</h1>
          <p className="text-foreground/70">
            Monitor high-risk cases from referral to outcome with real-time status updates
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Referral
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Referral</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient-name">Patient Name *</Label>
                  <Input
                    id="patient-name"
                    value={newReferral.patientName}
                    onChange={(e) => setNewReferral(prev => ({ ...prev, patientName: e.target.value }))}
                    placeholder="Enter patient name"
                  />
                </div>
                <div>
                  <Label htmlFor="patient-id">Patient ID</Label>
                  <Input
                    id="patient-id"
                    value={newReferral.patientId}
                    onChange={(e) => setNewReferral(prev => ({ ...prev, patientId: e.target.value }))}
                    placeholder="RCH ID or other ID"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient-age">Age</Label>
                  <Input
                    id="patient-age"
                    value={newReferral.patientAge}
                    onChange={(e) => setNewReferral(prev => ({ ...prev, patientAge: e.target.value }))}
                    placeholder="e.g., 26 years"
                  />
                </div>
                <div>
                  <Label htmlFor="patient-phone">Phone</Label>
                  <Input
                    id="patient-phone"
                    value={newReferral.patientPhone}
                    onChange={(e) => setNewReferral(prev => ({ ...prev, patientPhone: e.target.value }))}
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="condition">Medical Condition *</Label>
                <Input
                  id="condition"
                  value={newReferral.condition}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, condition: e.target.value }))}
                  placeholder="Describe the condition requiring referral"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select value={newReferral.urgency} onValueChange={(value: ReferralRecord['urgency']) =>
                    setNewReferral(prev => ({ ...prev, urgency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="to-facility">Refer To *</Label>
                  <Select value={newReferral.toFacility} onValueChange={(value) =>
                    setNewReferral(prev => ({ ...prev, toFacility: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select facility" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockFacilities.map(facility => (
                        <SelectItem key={facility.id} value={facility.name}>
                          {facility.name} ({facility.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Clinical Notes</Label>
                <Textarea
                  id="notes"
                  value={newReferral.notes}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Detailed clinical information, vitals, treatment given..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReferral}>
                  Create Referral
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-foreground/60" />
              <Input
                placeholder="Search patient, ID, or condition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="referred">Referred</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="treated">Treated</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
                <SelectItem value="follow-up-needed">Follow-up Needed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">
              {filteredReferrals.filter(r => r.status === 'referred').length}
            </div>
            <div className="text-sm text-foreground/60">Referred</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-yellow-600 mb-1">
              {filteredReferrals.filter(r => r.status === 'in-transit').length}
            </div>
            <div className="text-sm text-foreground/60">In Transit</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-purple-600 mb-1">
              {filteredReferrals.filter(r => r.status === 'received').length}
            </div>
            <div className="text-sm text-foreground/60">Received</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">
              {filteredReferrals.filter(r => r.status === 'treated').length}
            </div>
            <div className="text-sm text-foreground/60">Treated</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-red-600 mb-1">
              {filteredReferrals.filter(r => r.urgency === 'critical').length}
            </div>
            <div className="text-sm text-foreground/60">Critical</div>
          </CardContent>
        </Card>
      </div>

      {/* Referrals List */}
      <div className="space-y-4">
        {filteredReferrals.map((referral) => (
          <Card key={referral.id} className={referral.urgency === 'critical' ? 'border-red-200 bg-red-50/50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-white">
                      {referral.patientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{referral.patientName}</h3>
                      <Badge className={getUrgencyColor(referral.urgency)}>
                        {referral.urgency}
                      </Badge>
                    </div>
                    <div className="text-sm text-foreground/60">
                      {referral.patientId} • {referral.patientAge} • {referral.condition}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(referral.status)}>
                    {referral.status.replace('-', ' ')}
                  </Badge>
                  <Button size="sm" onClick={() => openUpdateDialog(referral)}>
                    Update Status
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(getStatusProgress(referral.status))}% complete</span>
                </div>
                <Progress value={getStatusProgress(referral.status)} className="h-2" />
              </div>
              
              {/* Referral Flow */}
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-foreground/60" />
                  <span>{referral.fromFacility}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-foreground/60" />
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-foreground/60" />
                  <span>{referral.toFacility}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-foreground/60">Referred by: </span>
                  {referral.referredBy}
                </div>
                <div>
                  <span className="text-foreground/60">Date: </span>
                  {new Date(referral.referredDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-foreground/60">Phone: </span>
                  {referral.patientPhone}
                </div>
                {referral.followUpRequired && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Follow-up required</span>
                  </div>
                )}
              </div>
              
              {referral.notes && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <span className="text-foreground/60">Notes: </span>
                  {referral.notes}
                </div>
              )}
              
              {referral.outcome && (
                <div className="p-3 bg-green-50 rounded-lg text-sm">
                  <span className="text-foreground/60">Outcome: </span>
                  {referral.outcome}
                </div>
              )}
              
              {/* Latest Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground/60">
                  <Clock className="h-4 w-4" />
                  <span>
                    Last updated: {new Date(referral.statusHistory[referral.statusHistory.length - 1].timestamp).toLocaleString()}
                  </span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedReferral(referral);
                    setIsUpdateDialogOpen(true);
                    toast.info(`Viewing referral timeline and status for ${referral.patientName}`);
                  }}
                >
                  View Full Timeline
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReferrals.length === 0 && (
        <Card className="p-8 text-center">
          <Send className="h-12 w-12 text-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg mb-2">No Referrals Found</h3>
          <p className="text-foreground/60">No referrals match your current filters.</p>
        </Card>
      )}

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Referral Status</DialogTitle>
          </DialogHeader>
          
          {selectedReferral && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium">{selectedReferral.patientName}</div>
                <div className="text-sm text-foreground/60">
                  {selectedReferral.condition} • Current status: {selectedReferral.status}
                </div>
              </div>
              
              <div>
                <Label htmlFor="new-status">New Status</Label>
                <Select value={statusUpdate.status} onValueChange={(value: ReferralRecord['status']) =>
                  setStatusUpdate(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referred">Referred</SelectItem>
                    <SelectItem value="in-transit">In Transit</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="treated">Treated</SelectItem>
                    <SelectItem value="discharged">Discharged</SelectItem>
                    <SelectItem value="follow-up-needed">Follow-up Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status-notes">Status Notes</Label>
                <Textarea
                  id="status-notes"
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about this status update..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateStatus}>
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ReferralChainTracking;