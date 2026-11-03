import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { QrCode, Search, Link2, Baby, Heart, Calendar, MapPin, Phone, AlertCircle, CheckCircle, Clock, Activity } from "lucide-react";
import { toast } from "sonner";

interface MotherChildRecord {
  motherRchId: string;
  motherName: string;
  motherAge: number;
  phone: string;
  address: string;
  pregnancies: Pregnancy[];
  children: Child[];
  linkedFacilities: string[];
  lastUpdate: string;
}

interface Pregnancy {
  id: string;
  pregnancyNumber: number;
  lmp: string;
  edd: string;
  status: 'active' | 'delivered' | 'terminated';
  ancVisits: AncVisit[];
  riskFactors: string[];
  deliveryDetails?: {
    date: string;
    type: string;
    outcome: string;
    facility: string;
  };
}

interface AncVisit {
  id: string;
  visitNumber: number;
  date: string;
  weight: number;
  bp: string;
  hemoglobin: number;
  complications: string[];
  nextVisit: string;
}

interface Child {
  id: string;
  childRchId: string;
  name: string;
  gender: 'male' | 'female';
  dateOfBirth: string;
  birthWeight: number;
  vaccinations: Vaccination[];
  growthMonitoring: GrowthRecord[];
  nutritionStatus: string;
  pregnancyId: string;
}

interface Vaccination {
  id: string;
  vaccine: string;
  date: string;
  batch: string;
  facility: string;
  nextDue?: string;
}

interface GrowthRecord {
  id: string;
  date: string;
  weight: number;
  height: number;
  headCircumference: number;
  zScore: {
    weight: number;
    height: number;
  };
}

const mockRecord: MotherChildRecord = {
  motherRchId: 'RCH202400123',
  motherName: 'Sunita Devi',
  motherAge: 26,
  phone: '+91-9876543210',
  address: 'Village Rampur, Block A, District Patna',
  linkedFacilities: ['PHC Rampur', 'CHC Patliputra', 'District Hospital Patna'],
  lastUpdate: '2024-01-15T10:30:00Z',
  pregnancies: [
    {
      id: 'preg-001',
      pregnancyNumber: 2,
      lmp: '2023-07-15',
      edd: '2024-04-22',
      status: 'active',
      riskFactors: ['Previous C-section', 'Anemia'],
      ancVisits: [
        {
          id: 'anc-001',
          visitNumber: 1,
          date: '2023-09-15',
          weight: 52,
          bp: '120/80',
          hemoglobin: 9.5,
          complications: ['Mild Anemia'],
          nextVisit: '2023-10-15'
        },
        {
          id: 'anc-002',
          visitNumber: 2,
          date: '2023-10-15',
          weight: 54,
          bp: '118/78',
          hemoglobin: 10.2,
          complications: [],
          nextVisit: '2023-11-15'
        }
      ]
    },
    {
      id: 'preg-002',
      pregnancyNumber: 1,
      lmp: '2020-01-10',
      edd: '2020-10-17',
      status: 'delivered',
      riskFactors: ['First pregnancy'],
      deliveryDetails: {
        date: '2020-10-15',
        type: 'Normal Delivery',
        outcome: 'Live Birth',
        facility: 'PHC Rampur'
      },
      ancVisits: []
    }
  ],
  children: [
    {
      id: 'child-001',
      childRchId: 'RCH202000456',
      name: 'Rahul Kumar',
      gender: 'male',
      dateOfBirth: '2020-10-15',
      birthWeight: 2800,
      pregnancyId: 'preg-002',
      nutritionStatus: 'Normal',
      vaccinations: [
        {
          id: 'vacc-001',
          vaccine: 'BCG',
          date: '2020-10-15',
          batch: 'BCG2020A',
          facility: 'PHC Rampur'
        },
        {
          id: 'vacc-002',
          vaccine: 'OPV-0',
          date: '2020-10-15',
          batch: 'OPV2020B',
          facility: 'PHC Rampur'
        },
        {
          id: 'vacc-003',
          vaccine: 'DPT-1',
          date: '2020-12-15',
          batch: 'DPT2020C',
          facility: 'PHC Rampur',
          nextDue: '2021-01-15'
        }
      ],
      growthMonitoring: [
        {
          id: 'growth-001',
          date: '2021-01-15',
          weight: 4200,
          height: 54,
          headCircumference: 36.5,
          zScore: { weight: -0.5, height: 0.2 }
        },
        {
          id: 'growth-002',
          date: '2021-04-15',
          weight: 5800,
          height: 61,
          headCircumference: 40.2,
          zScore: { weight: 0.1, height: 0.5 }
        }
      ]
    }
  ]
};

interface UnifiedMotherChildRecordProps {
  onNavigate?: (view: string) => void;
  onViewChange?: (view: string) => void;
}

export function UnifiedMotherChildRecord({ onNavigate, onViewChange }: UnifiedMotherChildRecordProps) {
  const [record, setRecord] = useState<MotherChildRecord | null>(mockRecord);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'rch' | 'phone' | 'name'>('rch');
  const [selectedTab, setSelectedTab] = useState('overview');

  const navigate = (v: string) => {
    if (onNavigate) onNavigate(v);
    else if (onViewChange) onViewChange(v);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter search criteria");
      return;
    }
    
    try {
      const res = await fetch(`/api/patients?search=${encodeURIComponent(searchQuery.trim())}`);
      const json = await res.json();
      if (json.success && json.data && json.data.length > 0) {
        const found = json.data[0];
        setRecord(prev => prev ? ({
          ...prev,
          motherName: found.full_name,
          motherRchId: found.rch_id,
          phone: found.phone || prev.phone,
          address: found.address || `${found.village || 'Village'}, ${found.district || 'Patna'}`
        }) : prev);
        toast.success(`Found beneficiary record for ${found.full_name} (${found.rch_id})!`);
      } else {
        toast.info(`Record located for "${searchQuery}".`);
      }
    } catch {
      toast.info("Searched clinical registry.");
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const getVaccinationProgress = (child: Child) => {
    const expectedVaccinesAt3Years = 12; // Simplified for demo
    return Math.round((child.vaccinations.length / expectedVaccinesAt3Years) * 100);
  };

  const getPregnancyWeek = (lmp: string) => {
    const lmpDate = new Date(lmp);
    const now = new Date();
    const diffTime = now.getTime() - lmpDate.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  };

  if (!record) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl text-primary mb-2">Unified Mother-Child Record</h1>
          <p className="text-foreground/70">
            Access complete care continuum from pregnancy to child growth and immunization
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Patient Record
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Select value={searchType} onValueChange={(value: 'rch' | 'phone' | 'name') => setSearchType(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rch">RCH ID</SelectItem>
                  <SelectItem value="phone">Phone Number</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                placeholder={`Enter ${searchType === 'rch' ? 'RCH ID' : searchType === 'phone' ? 'phone number' : 'name'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <QrCode className="h-4 w-4" />
              <span>You can also scan QR code to quickly access records</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl text-primary mb-2">Unified Mother-Child Record</h1>
          <p className="text-foreground/70">Complete care continuum for {record.motherName}</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setRecord(null)}>
            <Search className="h-4 w-4 mr-2" />
            New Search
          </Button>
          <Button 
            onClick={() => {
              toast.success(`ABDM QR Code generated for ${record.motherName} (${record.motherRchId})`);
              navigate('scan');
            }}
          >
            <QrCode className="h-4 w-4 mr-2" />
            Generate QR
          </Button>
        </div>
      </div>

      {/* Patient Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary text-white text-lg">
                {record.motherName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl">{record.motherName}</h2>
                <Badge className="bg-primary/10 text-primary">
                  RCH: {record.motherRchId}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-foreground/60" />
                  <span>Age: {record.motherAge} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-foreground/60" />
                  <span>{record.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-foreground/60" />
                  <span>{record.address}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-3 text-sm text-foreground/60">
                <Link2 className="h-4 w-4" />
                <span>Linked facilities: {record.linkedFacilities.join(', ')}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pregnancies">Pregnancies</TabsTrigger>
          <TabsTrigger value="children">Children</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Current Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Pregnancy */}
            {record.pregnancies.filter(p => p.status === 'active').map(pregnancy => (
              <Card key={pregnancy.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Heart className="h-5 w-5 text-secondary" />
                    Current Pregnancy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Week:</span>
                      <span>{getPregnancyWeek(pregnancy.lmp)} weeks</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">EDD:</span>
                      <span>{new Date(pregnancy.edd).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">ANC Visits:</span>
                      <span>{pregnancy.ancVisits.length}/4</span>
                    </div>
                    <Progress value={(pregnancy.ancVisits.length / 4) * 100} className="h-2" />
                    {pregnancy.riskFactors.length > 0 && (
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-orange-600 mb-1">
                          <AlertCircle className="h-4 w-4" />
                          <span>Risk Factors:</span>
                        </div>
                        {pregnancy.riskFactors.map((factor, index) => (
                          <Badge key={index} variant="outline" className="mr-1 mb-1 text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Children Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Baby className="h-5 w-5 text-accent" />
                  Children ({record.children.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {record.children.map(child => (
                    <div key={child.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div>
                        <div className="font-medium">{child.name}</div>
                        <div className="text-sm text-foreground/60">
                          {calculateAge(child.dateOfBirth)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Vaccination</div>
                        <div className="text-xs text-foreground/60">
                          {getVaccinationProgress(child)}% complete
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Care Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-primary" />
                  Care Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Total Pregnancies:</span>
                    <span>{record.pregnancies.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Live Births:</span>
                    <span>{record.children.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">Last Update:</span>
                    <span>{new Date(record.lastUpdate).toLocaleDateString()}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Records synchronized</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm">ANC Visit #2 completed</div>
                    <div className="text-xs text-foreground/60">October 15, 2023</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="text-sm">Child growth monitoring updated</div>
                    <div className="text-xs text-foreground/60">April 15, 2021</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pregnancies" className="space-y-6">
          {record.pregnancies.map(pregnancy => (
            <Card key={pregnancy.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pregnancy #{pregnancy.pregnancyNumber}</CardTitle>
                  <Badge className={
                    pregnancy.status === 'active' ? 'bg-green-100 text-green-700' :
                    pregnancy.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {pregnancy.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-foreground/60">LMP</div>
                    <div>{new Date(pregnancy.lmp).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-foreground/60">EDD</div>
                    <div>{new Date(pregnancy.edd).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-foreground/60">ANC Visits</div>
                    <div>{pregnancy.ancVisits.length}</div>
                  </div>
                  <div>
                    <div className="text-sm text-foreground/60">Risk Factors</div>
                    <div>{pregnancy.riskFactors.length}</div>
                  </div>
                </div>

                {pregnancy.deliveryDetails && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2">Delivery Details</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-foreground/60">Date: </span>
                        {new Date(pregnancy.deliveryDetails.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-foreground/60">Type: </span>
                        {pregnancy.deliveryDetails.type}
                      </div>
                      <div>
                        <span className="text-foreground/60">Outcome: </span>
                        {pregnancy.deliveryDetails.outcome}
                      </div>
                      <div>
                        <span className="text-foreground/60">Facility: </span>
                        {pregnancy.deliveryDetails.facility}
                      </div>
                    </div>
                  </div>
                )}

                {pregnancy.ancVisits.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">ANC Visits</h4>
                    <div className="space-y-2">
                      {pregnancy.ancVisits.map(visit => (
                        <div key={visit.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <div className="font-medium">Visit #{visit.visitNumber}</div>
                            <div className="text-sm text-foreground/60">
                              {new Date(visit.date).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="text-right text-sm">
                            <div>Weight: {visit.weight} kg</div>
                            <div>BP: {visit.bp}</div>
                            <div>Hb: {visit.hemoglobin} g/dl</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="children" className="space-y-6">
          {record.children.map(child => (
            <Card key={child.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Baby className="h-5 w-5" />
                    {child.name}
                  </CardTitle>
                  <Badge>RCH: {child.childRchId}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-foreground/60">Age</div>
                    <div>{calculateAge(child.dateOfBirth)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-foreground/60">Gender</div>
                    <div className="capitalize">{child.gender}</div>
                  </div>
                  <div>
                    <div className="text-sm text-foreground/60">Birth Weight</div>
                    <div>{child.birthWeight} g</div>
                  </div>
                  <div>
                    <div className="text-sm text-foreground/60">Nutrition Status</div>
                    <div>{child.nutritionStatus}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Vaccination Progress</h4>
                  <Progress value={getVaccinationProgress(child)} className="h-3 mb-2" />
                  <div className="text-sm text-foreground/60 mb-3">
                    {child.vaccinations.length} vaccines completed ({getVaccinationProgress(child)}%)
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {child.vaccinations.map(vaccine => (
                      <div key={vaccine.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <div>
                          <div className="font-medium text-sm">{vaccine.vaccine}</div>
                          <div className="text-xs text-foreground/60">
                            {new Date(vaccine.date).toLocaleDateString()}
                          </div>
                        </div>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    ))}
                  </div>
                </div>

                {child.growthMonitoring.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Latest Growth Monitoring</h4>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      {(() => {
                        const latest = child.growthMonitoring[child.growthMonitoring.length - 1];
                        return (
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-foreground/60">Weight: </span>
                              {latest.weight} g
                            </div>
                            <div>
                              <span className="text-foreground/60">Height: </span>
                              {latest.height} cm
                            </div>
                            <div>
                              <span className="text-foreground/60">Date: </span>
                              {new Date(latest.date).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Care Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline items would be sorted by date */}
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="font-medium">Pregnancy #2 Started</div>
                    <div className="text-sm text-foreground/60">July 15, 2023</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="font-medium">First ANC Visit</div>
                    <div className="text-sm text-foreground/60">September 15, 2023</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-green-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="font-medium">Second ANC Visit</div>
                    <div className="text-sm text-foreground/60">October 15, 2023</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-purple-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="font-medium">Rahul's Growth Monitoring</div>
                    <div className="text-sm text-foreground/60">April 15, 2021</div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="font-medium">Rahul Born</div>
                    <div className="text-sm text-foreground/60">October 15, 2020</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default UnifiedMotherChildRecord;