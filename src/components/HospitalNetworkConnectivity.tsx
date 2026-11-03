import { useState, useEffect } from "react";
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
import { Search, Plus, Network, Hospital, MapPin, Users, Bed, Activity, ArrowRight, Link2, Share2, Shield, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface Hospital {
  id: string;
  name: string;
  type: 'PHC' | 'CHC' | 'District Hospital' | 'Medical College' | 'Private Hospital';
  category: 'government' | 'private' | 'autonomous';
  address: string;
  district: string;
  phone: string;
  email: string;
  website?: string;
  capacity: {
    totalBeds: number;
    availableBeds: number;
    icuBeds: number;
    nicu: number;
    maternity: number;
  };
  specialties: string[];
  services: string[];
  connectivity: {
    isConnected: boolean;
    connectionType: 'API' | 'ABDM' | 'Manual' | 'Hybrid';
    lastSync: string;
    dataShareLevel: 'full' | 'partial' | 'emergency-only';
  };
  networkLevel: number; // 1-5, higher means better connectivity
  performanceMetrics: {
    referralResponseTime: number; // in hours
    dataAccuracy: number; // percentage
    uptimePercentage: number;
  };
  contacts: {
    administrator: string;
    emergencyContact: string;
    dataOfficer: string;
  };
}

interface DataTransfer {
  id: string;
  type: 'patient-referral' | 'medical-records' | 'lab-results' | 'discharge-summary';
  patientId: string;
  patientName: string;
  fromHospital: string;
  toHospital: string;
  transferDate: string;
  status: 'initiated' | 'in-progress' | 'completed' | 'failed' | 'rejected';
  dataSize: string;
  securityLevel: 'standard' | 'high' | 'critical';
  verificationStatus: 'pending' | 'verified' | 'rejected';
  notes?: string;
}

interface NetworkStats {
  totalHospitals: number;
  connectedHospitals: number;
  dataTransfersToday: number;
  avgResponseTime: number;
  networkUptime: number;
}

const mockHospitals: Hospital[] = [
  {
    id: 'hosp-001',
    name: 'District Hospital Patna',
    type: 'District Hospital',
    category: 'government',
    address: 'Patna Medical Campus, Patna',
    district: 'Patna',
    phone: '+91-612-2345678',
    email: 'admin@dhpatna.gov.in',
    website: 'www.dhpatna.gov.in',
    capacity: {
      totalBeds: 500,
      availableBeds: 45,
      icuBeds: 20,
      nicu: 10,
      maternity: 25
    },
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'Gynecology', 'Pediatrics'],
    services: ['Emergency', 'Surgery', 'Radiology', 'Pathology', 'Blood Bank'],
    connectivity: {
      isConnected: true,
      connectionType: 'ABDM',
      lastSync: '2024-01-15T14:30:00Z',
      dataShareLevel: 'full'
    },
    networkLevel: 5,
    performanceMetrics: {
      referralResponseTime: 2.5,
      dataAccuracy: 98.5,
      uptimePercentage: 99.2
    },
    contacts: {
      administrator: 'Dr. Rajesh Kumar',
      emergencyContact: '+91-612-2345679',
      dataOfficer: 'IT Officer Sharma'
    }
  },
  {
    id: 'hosp-002',
    name: 'CHC Patliputra',
    type: 'CHC',
    category: 'government',
    address: 'Patliputra Block, Patna',
    district: 'Patna',
    phone: '+91-612-3456789',
    email: 'chc.patliputra@gov.in',
    capacity: {
      totalBeds: 100,
      availableBeds: 12,
      icuBeds: 4,
      nicu: 2,
      maternity: 8
    },
    specialties: ['General Medicine', 'Gynecology', 'Pediatrics', 'Surgery'],
    services: ['OPD', 'Emergency', 'Delivery', 'Laboratory'],
    connectivity: {
      isConnected: true,
      connectionType: 'API',
      lastSync: '2024-01-15T13:15:00Z',
      dataShareLevel: 'partial'
    },
    networkLevel: 4,
    performanceMetrics: {
      referralResponseTime: 4.2,
      dataAccuracy: 95.8,
      uptimePercentage: 97.5
    },
    contacts: {
      administrator: 'Dr. Priya Singh',
      emergencyContact: '+91-612-3456780',
      dataOfficer: 'ANM Supervisor'
    }
  },
  {
    id: 'hosp-003',
    name: 'Apollo Hospitals Patna',
    type: 'Private Hospital',
    category: 'private',
    address: 'Bailey Road, Patna',
    district: 'Patna',
    phone: '+91-612-4567890',
    email: 'info@apollopatna.com',
    website: 'www.apollohospitals.com/patna',
    capacity: {
      totalBeds: 200,
      availableBeds: 18,
      icuBeds: 15,
      nicu: 8,
      maternity: 12
    },
    specialties: ['Cardiology', 'Neurology', 'Oncology', 'Transplant', 'Emergency Medicine'],
    services: ['24x7 Emergency', 'Advanced Surgery', 'Diagnostic Imaging', 'Intensive Care'],
    connectivity: {
      isConnected: true,
      connectionType: 'Hybrid',
      lastSync: '2024-01-15T14:45:00Z',
      dataShareLevel: 'emergency-only'
    },
    networkLevel: 4,
    performanceMetrics: {
      referralResponseTime: 1.8,
      dataAccuracy: 99.2,
      uptimePercentage: 99.8
    },
    contacts: {
      administrator: 'Dr. Amit Verma',
      emergencyContact: '+91-612-4567891',
      dataOfficer: 'IT Manager'
    }
  },
  {
    id: 'hosp-004',
    name: 'PHC Rampur',
    type: 'PHC',
    category: 'government',
    address: 'Village Rampur, Block A',
    district: 'Patna',
    phone: '+91-612-5678901',
    email: 'phc.rampur@gov.in',
    capacity: {
      totalBeds: 15,
      availableBeds: 3,
      icuBeds: 0,
      nicu: 0,
      maternity: 2
    },
    specialties: ['General Medicine', 'Maternal Care'],
    services: ['OPD', 'Immunization', 'ANC', 'Basic Laboratory'],
    connectivity: {
      isConnected: false,
      connectionType: 'Manual',
      lastSync: '2024-01-10T10:00:00Z',
      dataShareLevel: 'emergency-only'
    },
    networkLevel: 2,
    performanceMetrics: {
      referralResponseTime: 8.5,
      dataAccuracy: 85.2,
      uptimePercentage: 75.0
    },
    contacts: {
      administrator: 'Dr. Sunita Devi',
      emergencyContact: '+91-612-5678902',
      dataOfficer: 'ANM Incharge'
    }
  }
];

const mockDataTransfers: DataTransfer[] = [
  {
    id: 'transfer-001',
    type: 'patient-referral',
    patientId: 'RCH202400123',
    patientName: 'Sunita Devi',
    fromHospital: 'PHC Rampur',
    toHospital: 'CHC Patliputra',
    transferDate: '2024-01-15T09:30:00Z',
    status: 'completed',
    dataSize: '2.5 MB',
    securityLevel: 'high',
    verificationStatus: 'verified',
    notes: 'High-risk pregnancy referral completed successfully'
  },
  {
    id: 'transfer-002',
    type: 'lab-results',
    patientId: 'RCH202000456',
    patientName: 'Baby Rahul Kumar',
    fromHospital: 'CHC Patliputra',
    toHospital: 'District Hospital Patna',
    transferDate: '2024-01-15T11:20:00Z',
    status: 'in-progress',
    dataSize: '5.8 MB',
    securityLevel: 'critical',
    verificationStatus: 'pending'
  }
];

const mockNetworkStats: NetworkStats = {
  totalHospitals: 45,
  connectedHospitals: 38,
  dataTransfersToday: 127,
  avgResponseTime: 3.2,
  networkUptime: 98.7
};

export function HospitalNetworkConnectivity() {
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals);
  const [dataTransfers, setDataTransfers] = useState<DataTransfer[]>(mockDataTransfers);
  const [networkStats] = useState<NetworkStats>(mockNetworkStats);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [connectivityFilter, setConnectivityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [connectionData, setConnectionData] = useState({
    connectionType: 'API' as Hospital['connectivity']['connectionType'],
    dataShareLevel: 'partial' as Hospital['connectivity']['dataShareLevel'],
    adminContact: '',
    technicalContact: '',
    notes: ''
  });

  useEffect(() => {
    // Fetch live hospital data from backend API
    fetch('/api/hospitals')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data && res.data.length > 0) {
          const mapped = res.data.map((h: any, idx: number) => ({
            id: h.id || `hosp-${idx}`,
            name: h.name,
            type: h.type || 'District Hospital',
            category: h.category || 'government',
            address: `${h.name}, ${h.district || 'Patna'}`,
            district: h.district || 'Patna',
            phone: h.phone || '+91-612-2345678',
            email: 'admin@health.gov.in',
            capacity: {
              totalBeds: h.total_beds || 100,
              availableBeds: h.available_beds || 10,
              icuBeds: h.icu_beds || 4,
              nicu: h.nicu_beds || 2,
              maternity: h.maternity_beds || 15
            },
            specialties: h.specialties || ['Gynecology', 'Pediatrics'],
            services: ['Emergency', 'Maternity', 'Inpatient'],
            connectivity: {
              isConnected: h.is_connected ?? true,
              connectionType: 'ABDM',
              lastSync: h.updated_at || new Date().toISOString(),
              dataShareLevel: 'full'
            },
            networkLevel: 4,
            performanceMetrics: {
              referralResponseTime: 2.5,
              dataAccuracy: 96.5,
              uptimePercentage: 99.2
            },
            contacts: {
              administrator: 'Medical Superintendent',
              emergencyContact: h.phone || '+91-612-2345678',
              dataOfficer: 'IT Cell'
            }
          }));
          setHospitals(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const filteredHospitals = hospitals.filter(hospital => {
    const typeMatch = typeFilter === 'all' || hospital.type === typeFilter;
    const connectivityMatch = connectivityFilter === 'all' || 
      (connectivityFilter === 'connected' && hospital.connectivity.isConnected) ||
      (connectivityFilter === 'disconnected' && !hospital.connectivity.isConnected);
    const searchMatch = searchQuery === '' ||
      hospital.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hospital.district.toLowerCase().includes(searchQuery.toLowerCase());
    
    return typeMatch && connectivityMatch && searchMatch;
  });

  const getConnectivityColor = (isConnected: boolean) => {
    return isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700';
  };

  const getTypeColor = (type: Hospital['type']) => {
    switch (type) {
      case 'Medical College': return 'bg-purple-100 text-purple-700';
      case 'District Hospital': return 'bg-blue-100 text-blue-700';
      case 'CHC': return 'bg-green-100 text-green-700';
      case 'PHC': return 'bg-orange-100 text-orange-700';
      case 'Private Hospital': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getNetworkLevelColor = (level: number) => {
    if (level >= 4) return 'text-green-600';
    if (level >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleConnectHospital = () => {
    if (!selectedHospital) return;

    setHospitals(prev => prev.map(hospital =>
      hospital.id === selectedHospital.id
        ? {
            ...hospital,
            connectivity: {
              ...hospital.connectivity,
              isConnected: true,
              connectionType: connectionData.connectionType,
              dataShareLevel: connectionData.dataShareLevel,
              lastSync: new Date().toISOString()
            }
          }
        : hospital
    ));

    setIsConnectDialogOpen(false);
    setSelectedHospital(null);
    setConnectionData({
      connectionType: 'API',
      dataShareLevel: 'partial',
      adminContact: '',
      technicalContact: '',
      notes: ''
    });
    toast.success("Hospital connected to network successfully!");
  };

  const openConnectDialog = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setIsConnectDialogOpen(true);
  };

  const syncHospitalData = (hospital: Hospital) => {
    setHospitals(prev => prev.map(h =>
      h.id === hospital.id
        ? {
            ...h,
            connectivity: {
              ...h.connectivity,
              lastSync: new Date().toISOString()
            }
          }
        : h
    ));
    toast.success(`Data synchronized with ${hospital.name}`);
  };

  const getDataShareIcon = (level: Hospital['connectivity']['dataShareLevel']) => {
    switch (level) {
      case 'full': return <Share2 className="h-4 w-4 text-green-600" />;
      case 'partial': return <Share2 className="h-4 w-4 text-yellow-600" />;
      case 'emergency-only': return <Share2 className="h-4 w-4 text-red-600" />;
      default: return <Share2 className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-primary mb-2">Hospital Network Connectivity</h1>
          <p className="text-foreground/70">
            Interlink hospitals for seamless data sharing and patient referrals across the healthcare network
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            className="bg-accent hover:bg-accent/90"
            onClick={() => {
              if (hospitals.length > 0) {
                setSelectedHospital(hospitals[0]);
              }
              setIsConnectDialogOpen(true);
              toast.info("ABDM Hospital Gateway connection initiated");
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Hospital
          </Button>
          <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Network className="h-4 w-4 mr-2" />
                Network Status
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Network Health Dashboard</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl text-primary mb-1">{networkStats.totalHospitals}</div>
                      <div className="text-sm text-foreground/60">Total Hospitals</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl text-green-600 mb-1">{networkStats.connectedHospitals}</div>
                      <div className="text-sm text-foreground/60">Connected</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl text-blue-600 mb-1">{networkStats.dataTransfersToday}</div>
                      <div className="text-sm text-foreground/60">Transfers Today</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl text-yellow-600 mb-1">{networkStats.avgResponseTime}h</div>
                      <div className="text-sm text-foreground/60">Avg Response</div>
                    </CardContent>
                  </Card>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Network Uptime</span>
                    <span>{networkStats.networkUptime}%</span>
                  </div>
                  <Progress value={networkStats.networkUptime} className="h-3" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="hospitals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hospitals">Hospitals ({hospitals.length})</TabsTrigger>
          <TabsTrigger value="transfers">Data Transfers ({dataTransfers.length})</TabsTrigger>
          <TabsTrigger value="analytics">Network Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="hospitals" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-foreground/60" />
                  <Input
                    placeholder="Search hospitals or districts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Hospital Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="PHC">PHC</SelectItem>
                    <SelectItem value="CHC">CHC</SelectItem>
                    <SelectItem value="District Hospital">District Hospital</SelectItem>
                    <SelectItem value="Medical College">Medical College</SelectItem>
                    <SelectItem value="Private Hospital">Private Hospital</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={connectivityFilter} onValueChange={setConnectivityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Connectivity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hospitals</SelectItem>
                    <SelectItem value="connected">Connected</SelectItem>
                    <SelectItem value="disconnected">Disconnected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Hospitals Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredHospitals.map((hospital) => (
              <Card key={hospital.id} className={!hospital.connectivity.isConnected ? 'border-orange-200 bg-orange-50/30' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Hospital className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{hospital.name}</h3>
                          <Badge className={getTypeColor(hospital.type)}>
                            {hospital.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-foreground/60">
                          {hospital.address}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getConnectivityColor(hospital.connectivity.isConnected)}>
                        {hospital.connectivity.isConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                      <div className={`text-sm ${getNetworkLevelColor(hospital.networkLevel)}`}>
                        Network Level {hospital.networkLevel}/5
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Capacity Overview */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Bed className="h-4 w-4 text-foreground/60" />
                      <span className="text-sm">Bed Availability</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">{hospital.capacity.availableBeds}/{hospital.capacity.totalBeds}</div>
                        <div className="text-foreground/60">General</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">{hospital.capacity.icuBeds}</div>
                        <div className="text-foreground/60">ICU</div>
                      </div>
                      <div className="text-center p-2 bg-muted rounded">
                        <div className="font-medium">{hospital.capacity.maternity}</div>
                        <div className="text-foreground/60">Maternity</div>
                      </div>
                    </div>
                  </div>

                  {/* Connectivity Details */}
                  {hospital.connectivity.isConnected && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Connection Details</span>
                        {getDataShareIcon(hospital.connectivity.dataShareLevel)}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-foreground/60">Type: </span>
                          {hospital.connectivity.connectionType}
                        </div>
                        <div>
                          <span className="text-foreground/60">Data Level: </span>
                          {hospital.connectivity.dataShareLevel}
                        </div>
                        <div className="col-span-2">
                          <span className="text-foreground/60">Last Sync: </span>
                          {new Date(hospital.connectivity.lastSync).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Performance Metrics */}
                  <div>
                    <h4 className="text-sm font-medium mb-2">Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Response Time</span>
                        <span>{hospital.performanceMetrics.referralResponseTime}h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Data Accuracy</span>
                        <span>{hospital.performanceMetrics.dataAccuracy}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Uptime</span>
                        <span>{hospital.performanceMetrics.uptimePercentage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-foreground/60">
                      <Users className="h-4 w-4" />
                      <span>{hospital.contacts.administrator}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {hospital.connectivity.isConnected ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => syncHospitalData(hospital)}
                        >
                          <Activity className="h-4 w-4 mr-1" />
                          Sync
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => openConnectDialog(hospital)}
                        >
                          <Link2 className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredHospitals.length === 0 && (
            <Card className="p-8 text-center">
              <Hospital className="h-12 w-12 text-foreground/30 mx-auto mb-3" />
              <h3 className="text-lg mb-2">No Hospitals Found</h3>
              <p className="text-foreground/60">No hospitals match your current filters.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="transfers" className="space-y-6">
          <div className="space-y-4">
            {dataTransfers.map((transfer) => (
              <Card key={transfer.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary text-white">
                          {transfer.patientName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h3 className="font-medium">{transfer.patientName}</h3>
                        <div className="text-sm text-foreground/60">
                          {transfer.patientId} • {transfer.type.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                    
                    <Badge className={
                      transfer.status === 'completed' ? 'bg-green-100 text-green-700' :
                      transfer.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      transfer.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }>
                      {transfer.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-foreground/60" />
                        <span>{transfer.fromHospital}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-foreground/60" />
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-foreground/60" />
                        <span>{transfer.toHospital}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-foreground/60">
                      <div className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        <span>{transfer.securityLevel}</span>
                      </div>
                      <div>{transfer.dataSize}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-foreground/60">
                      {new Date(transfer.transferDate).toLocaleString()}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {transfer.verificationStatus === 'verified' ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Verified</span>
                        </div>
                      ) : transfer.verificationStatus === 'pending' ? (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Pending</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">Rejected</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {transfer.notes && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      {transfer.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Connected Hospitals</span>
                    <span>{Math.round((networkStats.connectedHospitals / networkStats.totalHospitals) * 100)}%</span>
                  </div>
                  <Progress value={(networkStats.connectedHospitals / networkStats.totalHospitals) * 100} />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl text-green-600">{networkStats.connectedHospitals}</div>
                      <div className="text-foreground/60">Connected</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded">
                      <div className="text-2xl text-red-600">{networkStats.totalHospitals - networkStats.connectedHospitals}</div>
                      <div className="text-foreground/60">Pending</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Data Transfer Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl text-primary mb-1">{networkStats.dataTransfersToday}</div>
                    <div className="text-sm text-foreground/60">Transfers Today</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Patient Referrals</span>
                      <span>45 (35%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lab Results</span>
                      <span>38 (30%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Medical Records</span>
                      <span>28 (22%)</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Discharge Summaries</span>
                      <span>16 (13%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Connect Hospital Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Connect Hospital to Network</DialogTitle>
          </DialogHeader>
          
          {selectedHospital && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium">{selectedHospital.name}</div>
                <div className="text-sm text-foreground/60">
                  {selectedHospital.type} • {selectedHospital.district}
                </div>
              </div>
              
              <div>
                <Label htmlFor="connection-type">Connection Type</Label>
                <Select value={connectionData.connectionType} onValueChange={(value: Hospital['connectivity']['connectionType']) =>
                  setConnectionData(prev => ({ ...prev, connectionType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="API">Direct API Integration</SelectItem>
                    <SelectItem value="ABDM">ABDM Health ID</SelectItem>
                    <SelectItem value="Manual">Manual Data Entry</SelectItem>
                    <SelectItem value="Hybrid">Hybrid System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="data-share-level">Data Sharing Level</Label>
                <Select value={connectionData.dataShareLevel} onValueChange={(value: Hospital['connectivity']['dataShareLevel']) =>
                  setConnectionData(prev => ({ ...prev, dataShareLevel: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Access</SelectItem>
                    <SelectItem value="partial">Partial Access</SelectItem>
                    <SelectItem value="emergency-only">Emergency Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admin-contact">Admin Contact</Label>
                  <Input
                    id="admin-contact"
                    value={connectionData.adminContact}
                    onChange={(e) => setConnectionData(prev => ({ ...prev, adminContact: e.target.value }))}
                    placeholder="Administrator name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="tech-contact">Technical Contact</Label>
                  <Input
                    id="tech-contact"
                    value={connectionData.technicalContact}
                    onChange={(e) => setConnectionData(prev => ({ ...prev, technicalContact: e.target.value }))}
                    placeholder="IT officer name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="connection-notes">Connection Notes</Label>
                <Textarea
                  id="connection-notes"
                  value={connectionData.notes}
                  onChange={(e) => setConnectionData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any specific requirements or notes..."
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConnectHospital}>
                  Connect Hospital
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default HospitalNetworkConnectivity;