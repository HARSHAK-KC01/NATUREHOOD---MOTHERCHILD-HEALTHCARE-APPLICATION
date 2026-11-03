import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Syringe, 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Search,
  Plus,
  Baby
} from "lucide-react";
import { toast } from "sonner";

interface ChildRecord {
  id: string | number;
  name: string;
  rchId: string;
  dob: string;
  age: string;
}

const defaultImmunizationSchedule: Record<string, Array<{
  vaccine: string;
  dueAge: string;
  status: 'completed' | 'due' | 'pending' | 'overdue';
  dateGiven?: string;
  dueDate?: string;
}>> = {
  birth: [
    { vaccine: 'BCG', dueAge: '0 days', status: 'completed', dateGiven: '2024-01-15' },
    { vaccine: 'OPV-0', dueAge: '0 days', status: 'completed', dateGiven: '2024-01-15' },
    { vaccine: 'Hepatitis B-1', dueAge: '0 days', status: 'completed', dateGiven: '2024-01-15' }
  ],
  '6weeks': [
    { vaccine: 'DPT-1', dueAge: '6 weeks', status: 'completed', dateGiven: '2024-02-26' },
    { vaccine: 'OPV-1', dueAge: '6 weeks', status: 'completed', dateGiven: '2024-02-26' },
    { vaccine: 'Hepatitis B-2', dueAge: '6 weeks', status: 'completed', dateGiven: '2024-02-26' },
    { vaccine: 'Hib-1', dueAge: '6 weeks', status: 'completed', dateGiven: '2024-02-26' }
  ],
  '10weeks': [
    { vaccine: 'DPT-2', dueAge: '10 weeks', status: 'due', dueDate: '2024-03-26' },
    { vaccine: 'OPV-2', dueAge: '10 weeks', status: 'due', dueDate: '2024-03-26' },
    { vaccine: 'Hib-2', dueAge: '10 weeks', status: 'due', dueDate: '2024-03-26' }
  ],
  '14weeks': [
    { vaccine: 'DPT-3', dueAge: '14 weeks', status: 'pending', dueDate: '2024-04-23' },
    { vaccine: 'OPV-3', dueAge: '14 weeks', status: 'pending', dueDate: '2024-04-23' },
    { vaccine: 'Hib-3', dueAge: '14 weeks', status: 'pending', dueDate: '2024-04-23' }
  ],
  '9months': [
    { vaccine: 'Measles', dueAge: '9 months', status: 'pending', dueDate: '2024-10-15' }
  ]
};

const initialMockChildren: ChildRecord[] = [
  { id: 1, name: 'Baby Anjali', rchId: 'RCH12345678', dob: '2024-01-15', age: '8 weeks' },
  { id: 2, name: 'Ravi Kumar', rchId: 'RCH87654321', dob: '2023-06-20', age: '8 months' },
  { id: 3, name: 'Priya Singh', rchId: 'RCH11223344', dob: '2023-12-01', age: '12 weeks' }
];

interface ImmunizationTrackerProps {
  onNavigate?: (view: string) => void;
  onViewChange?: (view: string) => void;
}

export function ImmunizationTracker({ onNavigate, onViewChange }: ImmunizationTrackerProps) {
  const [children, setChildren] = useState<ChildRecord[]>(initialMockChildren);
  const [selectedChild, setSelectedChild] = useState<ChildRecord>(initialMockChildren[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVaccine, setShowAddVaccine] = useState(false);
  const [scheduleState, setScheduleState] = useState(defaultImmunizationSchedule);
  const [newVaccine, setNewVaccine] = useState({
    vaccine: '',
    batchNo: '',
    date: new Date().toISOString().split('T')[0]
  });

  const navigate = (v: string) => {
    if (onNavigate) onNavigate(v);
    else if (onViewChange) onViewChange(v);
  };

  useEffect(() => {
    fetch('/api/patients?type=child')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const apiChildren: ChildRecord[] = data.data.map((p: any) => ({
            id: p.id,
            name: p.full_name,
            rchId: p.rch_id,
            dob: p.date_of_birth || '2024-01-01',
            age: 'Infant'
          }));
          setChildren(apiChildren);
          setSelectedChild(apiChildren[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddVaccine = async () => {
    if (!newVaccine.vaccine || !newVaccine.date) {
      toast.error("Please select a vaccine and enter administration date");
      return;
    }

    try {
      await fetch('/api/immunization/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: selectedChild.id,
          vaccine_name: newVaccine.vaccine,
          batch_number: newVaccine.batchNo,
          dose_number: 1,
          administered_date: newVaccine.date,
          status: 'administered'
        })
      });
    } catch (e) {
      // offline fallback
    }

    // Update local schedule state
    setScheduleState(prev => {
      const next = { ...prev };
      let updated = false;
      for (const key of Object.keys(next)) {
        next[key] = next[key].map(v => {
          if (v.vaccine.toLowerCase() === newVaccine.vaccine.toLowerCase()) {
            updated = true;
            return { ...v, status: 'completed', dateGiven: newVaccine.date };
          }
          return v;
        });
      }
      if (!updated && next['birth']) {
        next['birth'].push({
          vaccine: newVaccine.vaccine,
          dueAge: 'Custom',
          status: 'completed',
          dateGiven: newVaccine.date
        });
      }
      return { ...next };
    });

    toast.success(`${newVaccine.vaccine} recorded for ${selectedChild.name}! Syncing to database.`);
    setShowAddVaccine(false);
    setNewVaccine({ vaccine: '', batchNo: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleGiveVaccine = (periodKey: string, vaccineName: string) => {
    const today = new Date().toISOString().split('T')[0];
    setScheduleState(prev => ({
      ...prev,
      [periodKey]: prev[periodKey].map(v => 
        v.vaccine === vaccineName ? { ...v, status: 'completed', dateGiven: today } : v
      )
    }));
    toast.success(`Administered ${vaccineName} today (${today})!`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'due':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'due':
        return <Badge className="bg-orange-100 text-orange-800">Due Now</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const filteredChildren = children.filter(child => 
    child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.rchId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2>Immunization Tracker</h2>
        <p className="text-muted-foreground">Track and manage vaccination schedules</p>
      </div>

      {/* Child Selection */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or RCH ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button size="lg" onClick={() => navigate('register')}>
              <Plus className="h-5 w-5 mr-2" />
              Add Child
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {filteredChildren.map((child) => (
              <Card 
                key={child.id} 
                className={`p-3 cursor-pointer transition-colors ${
                  selectedChild.id === child.id ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedChild(child)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Baby className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{child.name}</p>
                    <p className="text-sm text-muted-foreground">{child.age} • {child.rchId}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card>

      {/* Selected Child Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="flex items-center gap-2">
              <Baby className="h-5 w-5" />
              {selectedChild.name}
            </h3>
            <p className="text-muted-foreground">Born: {selectedChild.dob} • Age: {selectedChild.age}</p>
          </div>
          <Button 
            onClick={() => setShowAddVaccine(!showAddVaccine)}
            size="lg"
          >
            <Syringe className="h-5 w-5 mr-2" />
            Record Vaccination
          </Button>
        </div>

        {showAddVaccine && (
          <Card className="p-4 mb-6 bg-muted/30">
            <h4 className="mb-4">Record New Vaccination</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Vaccine</Label>
                <Select value={newVaccine.vaccine} onValueChange={(value) => setNewVaccine(prev => ({ ...prev, vaccine: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vaccine" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DPT-2">DPT-2</SelectItem>
                    <SelectItem value="OPV-2">OPV-2</SelectItem>
                    <SelectItem value="Hib-2">Hib-2</SelectItem>
                    <SelectItem value="Measles">Measles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Batch Number</Label>
                <Input 
                  value={newVaccine.batchNo}
                  onChange={(e) => setNewVaccine(prev => ({ ...prev, batchNo: e.target.value }))}
                  placeholder="Batch number"
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date"
                  value={newVaccine.date}
                  onChange={(e) => setNewVaccine(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleAddVaccine}>
                <Syringe className="h-4 w-4 mr-2" />
                Record Vaccination
              </Button>
              <Button variant="outline" onClick={() => setShowAddVaccine(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Immunization Schedule */}
        <div className="space-y-6">
          {Object.entries(scheduleState).map(([period, vaccines]) => (
            <div key={period} className="space-y-3">
              <h4 className="text-primary capitalize">
                {period === 'birth' ? 'At Birth' : 
                 period === '6weeks' ? '6 Weeks' :
                 period === '10weeks' ? '10 Weeks' :
                 period === '14weeks' ? '14 Weeks' :
                 '9 Months'}
              </h4>
              <div className="grid gap-3">
                {vaccines.map((vaccine, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(vaccine.status)}
                        <div>
                          <p className="font-medium">{vaccine.vaccine}</p>
                          <p className="text-sm text-muted-foreground">
                            {vaccine.dateGiven ? 
                              `Given: ${vaccine.dateGiven}` : 
                              vaccine.dueDate ? `Due: ${vaccine.dueDate}` : 
                              `Due age: ${vaccine.dueAge}`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(vaccine.status)}
                        {vaccine.status === 'due' && (
                          <Button size="sm" onClick={() => handleGiveVaccine(period, vaccine.vaccine)}>
                            <Syringe className="h-4 w-4 mr-1" />
                            Give Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl text-green-600">8</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl text-orange-600">3</p>
          <p className="text-sm text-muted-foreground">Due Now</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl text-gray-600">4</p>
          <p className="text-sm text-muted-foreground">Upcoming</p>
        </Card>
      </div>
    </div>
  );
}

export default ImmunizationTracker;