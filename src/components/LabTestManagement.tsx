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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search, Plus, Upload, Download, FileText, FileImage, Bell, AlertTriangle, CheckCircle, Clock, Shield, Eye } from "lucide-react";
import { toast } from "sonner";

interface LabTest {
  id: string;
  patientName: string;
  patientId: string;
  patientAge: string;
  testType: string;
  category: 'blood' | 'urine' | 'imaging' | 'pregnancy' | 'immunization' | 'other';
  orderDate: string;
  collectionDate?: string;
  resultDate?: string;
  status: 'ordered' | 'collected' | 'processing' | 'completed' | 'abnormal' | 'critical';
  priority: 'routine' | 'urgent' | 'critical';
  orderedBy: string;
  facility: string;
  labCenter: string;
  results?: {
    file: string;
    type: 'pdf' | 'image' | 'text';
    summary: string;
    abnormalValues?: string[];
    criticalValues?: string[];
  };
  notifications: {
    patientNotified: boolean;
    caregiverNotified: boolean;
    referringDoctorNotified: boolean;
  };
  accessLog: AccessLog[];
}

interface AccessLog {
  id: string;
  accessedBy: string;
  accessDate: string;
  action: 'viewed' | 'downloaded' | 'shared';
  facility: string;
}

interface DiagnosticCenter {
  id: string;
  name: string;
  type: 'Government Lab' | 'Private Lab' | 'Hospital Lab';
  address: string;
  phone: string;
  email: string;
  services: string[];
  turnaroundTime: {
    routine: string;
    urgent: string;
  };
}

const mockDiagnosticCenters: DiagnosticCenter[] = [
  {
    id: 'lab-001',
    name: 'District Lab Patna',
    type: 'Government Lab',
    address: 'District Hospital Campus, Patna',
    phone: '+91-9876543210',
    email: 'lab.patna@gov.in',
    services: ['Blood Tests', 'Urine Tests', 'X-Ray', 'Ultrasound'],
    turnaroundTime: { routine: '24-48 hours', urgent: '2-4 hours' }
  },
  {
    id: 'lab-002',
    name: 'Medicare Diagnostics',
    type: 'Private Lab',
    address: 'Medical Complex, Patliputra',
    phone: '+91-9876543211',
    email: 'info@medicare.com',
    services: ['Blood Tests', 'Urine Tests', 'CT Scan', 'MRI', 'Pathology'],
    turnaroundTime: { routine: '12-24 hours', urgent: '1-2 hours' }
  }
];

const mockLabTests: LabTest[] = [
  {
    id: 'test-001',
    patientName: 'Sunita Devi',
    patientId: 'RCH202400123',
    patientAge: '26 years',
    testType: 'Hemoglobin Level',
    category: 'blood',
    orderDate: '2024-01-10T09:00:00Z',
    collectionDate: '2024-01-10T14:30:00Z',
    resultDate: '2024-01-11T11:00:00Z',
    status: 'abnormal',
    priority: 'routine',
    orderedBy: 'Dr. Priya Sharma',
    facility: 'PHC Rampur',
    labCenter: 'District Lab Patna',
    results: {
      file: 'hemoglobin_report.pdf',
      type: 'pdf',
      summary: 'Hemoglobin: 8.5 g/dL (Normal: 12-15 g/dL)',
      abnormalValues: ['Low Hemoglobin: 8.5 g/dL'],
      criticalValues: []
    },
    notifications: {
      patientNotified: true,
      caregiverNotified: true,
      referringDoctorNotified: true
    },
    accessLog: [
      {
        id: 'access-001',
        accessedBy: 'Dr. Priya Sharma',
        accessDate: '2024-01-11T11:15:00Z',
        action: 'viewed',
        facility: 'PHC Rampur'
      }
    ]
  },
  {
    id: 'test-002',
    patientName: 'Baby Rahul Kumar',
    patientId: 'RCH202000456',
    patientAge: '3 years',
    testType: 'Chest X-Ray',
    category: 'imaging',
    orderDate: '2024-01-14T14:00:00Z',
    collectionDate: '2024-01-14T15:00:00Z',
    resultDate: '2024-01-14T18:00:00Z',
    status: 'completed',
    priority: 'urgent',
    orderedBy: 'Dr. Amit Kumar',
    facility: 'CHC Patliputra',
    labCenter: 'Medicare Diagnostics',
    results: {
      file: 'chest_xray.jpg',
      type: 'image',
      summary: 'Chest X-Ray shows signs of pneumonia in lower right lobe',
      abnormalValues: ['Consolidation in right lower lobe'],
      criticalValues: []
    },
    notifications: {
      patientNotified: true,
      caregiverNotified: true,
      referringDoctorNotified: true
    },
    accessLog: [
      {
        id: 'access-002',
        accessedBy: 'Dr. Amit Kumar',
        accessDate: '2024-01-14T18:05:00Z',
        action: 'viewed',
        facility: 'CHC Patliputra'
      }
    ]
  },
  {
    id: 'test-003',
    patientName: 'Rekha Sharma',
    patientId: 'RCH202300789',
    patientAge: '28 years',
    testType: 'Ultrasound - Pregnancy',
    category: 'pregnancy',
    orderDate: '2024-01-15T10:00:00Z',
    collectionDate: '2024-01-15T11:00:00Z',
    status: 'processing',
    priority: 'routine',
    orderedBy: 'Dr. Meera Singh',
    facility: 'CHC Patliputra',
    labCenter: 'District Lab Patna',
    notifications: {
      patientNotified: false,
      caregiverNotified: false,
      referringDoctorNotified: false
    },
    accessLog: []
  }
];

export function LabTestManagement() {
  const [labTests, setLabTests] = useState<LabTest[]>(mockLabTests);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [newOrder, setNewOrder] = useState({
    patientName: '',
    patientId: '',
    patientAge: '',
    testType: '',
    category: 'blood' as LabTest['category'],
    priority: 'routine' as LabTest['priority'],
    labCenter: '',
    clinicalNotes: ''
  });
  const [uploadData, setUploadData] = useState({
    resultSummary: '',
    abnormalValues: '',
    criticalValues: '',
    file: null as File | null
  });

  const filteredTests = labTests.filter(test => {
    const statusMatch = statusFilter === 'all' || test.status === statusFilter;
    const categoryMatch = categoryFilter === 'all' || test.category === categoryFilter;
    const searchMatch = searchQuery === '' ||
      test.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.testType.toLowerCase().includes(searchQuery.toLowerCase());
    
    return statusMatch && categoryMatch && searchMatch;
  });

  const getStatusColor = (status: LabTest['status']) => {
    switch (status) {
      case 'ordered': return 'bg-blue-100 text-blue-700';
      case 'collected': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-purple-100 text-purple-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'abnormal': return 'bg-orange-100 text-orange-700';
      case 'critical': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: LabTest['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getStatusIcon = (status: LabTest['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'abnormal': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleOrderTest = () => {
    if (!newOrder.patientName || !newOrder.testType || !newOrder.labCenter) {
      toast.error("Please fill in all required fields");
      return;
    }

    const test: LabTest = {
      id: `test-${Date.now()}`,
      ...newOrder,
      orderDate: new Date().toISOString(),
      status: 'ordered',
      orderedBy: 'Current User',
      facility: 'Current Facility',
      notifications: {
        patientNotified: false,
        caregiverNotified: false,
        referringDoctorNotified: false
      },
      accessLog: []
    };

    setLabTests(prev => [test, ...prev]);
    setNewOrder({
      patientName: '',
      patientId: '',
      patientAge: '',
      testType: '',
      category: 'blood',
      priority: 'routine',
      labCenter: '',
      clinicalNotes: ''
    });
    setIsOrderDialogOpen(false);
    toast.success("Lab test ordered successfully!");
  };

  const handleUploadResults = () => {
    if (!selectedTest || !uploadData.resultSummary) {
      toast.error("Please fill in required fields");
      return;
    }

    const results = {
      file: uploadData.file?.name || 'uploaded_file.pdf',
      type: (uploadData.file?.type.includes('image') ? 'image' : 'pdf') as 'pdf' | 'image',
      summary: uploadData.resultSummary,
      abnormalValues: uploadData.abnormalValues ? uploadData.abnormalValues.split(',').map(v => v.trim()) : [],
      criticalValues: uploadData.criticalValues ? uploadData.criticalValues.split(',').map(v => v.trim()) : []
    };

    const newStatus: LabTest['status'] = 
      results.criticalValues.length > 0 ? 'critical' :
      results.abnormalValues.length > 0 ? 'abnormal' : 'completed';

    setLabTests(prev => prev.map(test =>
      test.id === selectedTest.id
        ? {
            ...test,
            status: newStatus,
            resultDate: new Date().toISOString(),
            results,
            notifications: {
              patientNotified: true,
              caregiverNotified: true,
              referringDoctorNotified: true
            }
          }
        : test
    ));

    setIsUploadDialogOpen(false);
    setSelectedTest(null);
    setUploadData({
      resultSummary: '',
      abnormalValues: '',
      criticalValues: '',
      file: null
    });
    toast.success("Test results uploaded successfully!");
  };

  const openUploadDialog = (test: LabTest) => {
    setSelectedTest(test);
    setIsUploadDialogOpen(true);
  };

  const sendNotification = (test: LabTest, type: 'patient' | 'caregiver' | 'doctor') => {
    setLabTests(prev => prev.map(t =>
      t.id === test.id
        ? {
            ...t,
            notifications: {
              ...t.notifications,
              [`${type === 'doctor' ? 'referringDoctor' : type}Notified`]: true
            }
          }
        : t
    ));
    toast.success(`Notification sent to ${type}`);
  };

  const logAccess = (test: LabTest, action: 'viewed' | 'downloaded' | 'shared') => {
    const accessEntry: AccessLog = {
      id: `access-${Date.now()}`,
      accessedBy: 'Current User',
      accessDate: new Date().toISOString(),
      action,
      facility: 'Current Facility'
    };

    setLabTests(prev => prev.map(t =>
      t.id === test.id
        ? { ...t, accessLog: [...t.accessLog, accessEntry] }
        : t
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-primary mb-2">Lab Test Management</h1>
          <p className="text-foreground/70">
            Secure upload, sharing, and tracking of laboratory test results with automated notifications
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <Plus className="h-4 w-4 mr-2" />
                Order Test
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Order Lab Test</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patient-name">Patient Name *</Label>
                    <Input
                      id="patient-name"
                      value={newOrder.patientName}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Enter patient name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="patient-id">Patient ID</Label>
                    <Input
                      id="patient-id"
                      value={newOrder.patientId}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, patientId: e.target.value }))}
                      placeholder="RCH ID or other ID"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="test-type">Test Type *</Label>
                  <Input
                    id="test-type"
                    value={newOrder.testType}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, testType: e.target.value }))}
                    placeholder="e.g., Hemoglobin Level, Chest X-Ray"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newOrder.category} onValueChange={(value: LabTest['category']) =>
                      setNewOrder(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="blood">Blood Tests</SelectItem>
                        <SelectItem value="urine">Urine Tests</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                        <SelectItem value="pregnancy">Pregnancy Tests</SelectItem>
                        <SelectItem value="immunization">Immunization</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newOrder.priority} onValueChange={(value: LabTest['priority']) =>
                      setNewOrder(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="lab-center">Diagnostic Center *</Label>
                  <Select value={newOrder.labCenter} onValueChange={(value) =>
                    setNewOrder(prev => ({ ...prev, labCenter: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diagnostic center" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDiagnosticCenters.map(center => (
                        <SelectItem key={center.id} value={center.name}>
                          {center.name} ({center.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="clinical-notes">Clinical Notes</Label>
                  <Textarea
                    id="clinical-notes"
                    value={newOrder.clinicalNotes}
                    onChange={(e) => setNewOrder(prev => ({ ...prev, clinicalNotes: e.target.value }))}
                    placeholder="Clinical indication for the test..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleOrderTest}>
                    Order Test
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-foreground/60" />
              <Input
                placeholder="Search patient, ID, or test type..."
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
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="abnormal">Abnormal</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="blood">Blood Tests</SelectItem>
                <SelectItem value="urine">Urine Tests</SelectItem>
                <SelectItem value="imaging">Imaging</SelectItem>
                <SelectItem value="pregnancy">Pregnancy</SelectItem>
                <SelectItem value="immunization">Immunization</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-blue-600 mb-1">
              {filteredTests.filter(t => t.status === 'ordered').length}
            </div>
            <div className="text-sm text-foreground/60">Ordered</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-yellow-600 mb-1">
              {filteredTests.filter(t => t.status === 'processing').length}
            </div>
            <div className="text-sm text-foreground/60">Processing</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-green-600 mb-1">
              {filteredTests.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-sm text-foreground/60">Completed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-orange-600 mb-1">
              {filteredTests.filter(t => t.status === 'abnormal').length}
            </div>
            <div className="text-sm text-foreground/60">Abnormal</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-red-600 mb-1">
              {filteredTests.filter(t => t.status === 'critical').length}
            </div>
            <div className="text-sm text-foreground/60">Critical</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl text-purple-600 mb-1">
              {filteredTests.filter(t => t.priority === 'urgent' || t.priority === 'critical').length}
            </div>
            <div className="text-sm text-foreground/60">Priority</div>
          </CardContent>
        </Card>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {filteredTests.map((test) => (
          <Card key={test.id} className={test.status === 'critical' ? 'border-red-200 bg-red-50/50' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-white">
                      {test.patientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{test.patientName}</h3>
                      <Badge className={getPriorityColor(test.priority)}>
                        {test.priority}
                      </Badge>
                    </div>
                    <div className="text-sm text-foreground/60">
                      {test.patientId} • {test.patientAge} • {test.testType}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(test.status)}>
                    {getStatusIcon(test.status)}
                    <span className="ml-1">{test.status}</span>
                  </Badge>
                  
                  {test.status === 'collected' || test.status === 'processing' ? (
                    <Button size="sm" onClick={() => openUploadDialog(test)}>
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Results
                    </Button>
                  ) : test.results ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => logAccess(test, 'viewed')}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Results
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-foreground/60">Ordered: </span>
                  {new Date(test.orderDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-foreground/60">Lab Center: </span>
                  {test.labCenter}
                </div>
                <div>
                  <span className="text-foreground/60">Ordered by: </span>
                  {test.orderedBy}
                </div>
                <div>
                  <span className="text-foreground/60">Category: </span>
                  <span className="capitalize">{test.category}</span>
                </div>
              </div>
              
              {test.results && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">Test Results</h4>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-green-600">Encrypted</span>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-2">{test.results.summary}</p>
                  
                  {test.results.abnormalValues && test.results.abnormalValues.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm text-orange-600 font-medium">Abnormal Values:</span>
                      {test.results.abnormalValues.map((value, index) => (
                        <Badge key={index} className="ml-1 mb-1 bg-orange-100 text-orange-700" variant="outline">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {test.results.criticalValues && test.results.criticalValues.length > 0 && (
                    <div className="mb-2">
                      <span className="text-sm text-red-600 font-medium">Critical Values:</span>
                      {test.results.criticalValues.map((value, index) => (
                        <Badge key={index} className="ml-1 mb-1 bg-red-100 text-red-700" variant="outline">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-foreground/60" />
                    <span>{test.results.file}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => logAccess(test, 'downloaded')}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className={`flex items-center gap-1 ${test.notifications.patientNotified ? 'text-green-600' : 'text-orange-600'}`}>
                    <Bell className="h-4 w-4" />
                    <span>Patient {test.notifications.patientNotified ? 'Notified' : 'Pending'}</span>
                  </div>
                  
                  {!test.notifications.patientNotified && test.results && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendNotification(test, 'patient')}
                    >
                      Notify Patient
                    </Button>
                  )}
                </div>
                
                <div className="text-xs text-foreground/60">
                  Accessed {test.accessLog.length} times
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTests.length === 0 && (
        <Card className="p-8 text-center">
          <FileText className="h-12 w-12 text-foreground/30 mx-auto mb-3" />
          <h3 className="text-lg mb-2">No Lab Tests Found</h3>
          <p className="text-foreground/60">No lab tests match your current filters.</p>
        </Card>
      )}

      {/* Upload Results Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Test Results</DialogTitle>
          </DialogHeader>
          
          {selectedTest && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium">{selectedTest.testType}</div>
                <div className="text-sm text-foreground/60">
                  {selectedTest.patientName} • {selectedTest.patientId}
                </div>
              </div>
              
              <div>
                <Label htmlFor="file-upload">Upload File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                />
                <p className="text-xs text-foreground/60 mt-1">
                  Supported formats: PDF, JPG, PNG (Max 10MB)
                </p>
              </div>
              
              <div>
                <Label htmlFor="result-summary">Result Summary *</Label>
                <Textarea
                  id="result-summary"
                  value={uploadData.resultSummary}
                  onChange={(e) => setUploadData(prev => ({ ...prev, resultSummary: e.target.value }))}
                  placeholder="Brief summary of test results..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="abnormal-values">Abnormal Values</Label>
                <Input
                  id="abnormal-values"
                  value={uploadData.abnormalValues}
                  onChange={(e) => setUploadData(prev => ({ ...prev, abnormalValues: e.target.value }))}
                  placeholder="Comma-separated list of abnormal values"
                />
              </div>
              
              <div>
                <Label htmlFor="critical-values">Critical Values</Label>
                <Input
                  id="critical-values"
                  value={uploadData.criticalValues}
                  onChange={(e) => setUploadData(prev => ({ ...prev, criticalValues: e.target.value }))}
                  placeholder="Comma-separated list of critical values"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadResults}>
                  Upload Results
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LabTestManagement;