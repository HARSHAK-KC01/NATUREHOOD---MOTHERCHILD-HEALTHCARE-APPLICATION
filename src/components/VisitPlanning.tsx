import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Users, 
  Route,
  CheckCircle,
  AlertTriangle,
  Heart,
  Baby,
  Syringe,
  Navigation,
  Phone,
  Plus
} from "lucide-react";
import { toast } from "sonner";

const mockVisits = [
  {
    id: 1,
    patient: "Sunita Devi",
    type: "antenatal",
    priority: "high",
    address: "Village Madhubani, Sector 1",
    phone: "+91 9876543210",
    scheduledTime: "09:00",
    estimatedDuration: 30,
    lastVisit: "2024-02-15",
    notes: "High BP monitoring required",
    latitude: 26.3518,
    longitude: 86.0759
  },
  {
    id: 2,
    patient: "Baby Ravi",
    type: "immunization",
    priority: "due",
    address: "Village Benipatti, Sector 2",
    phone: "+91 8765432109",
    scheduledTime: "10:30",
    estimatedDuration: 15,
    lastVisit: "2024-01-20",
    notes: "DPT-2 due",
    latitude: 26.3218,
    longitude: 86.0459
  },
  {
    id: 3,
    patient: "Priya Sharma",
    type: "postnatal",
    priority: "routine",
    address: "Village Ladania, Sector 1",
    phone: "+91 7654321098",
    scheduledTime: "14:00",
    estimatedDuration: 25,
    lastVisit: "2024-03-01",
    notes: "6-week postnatal check",
    latitude: 26.3818,
    longitude: 86.0959
  }
];

const visitTypes = [
  { id: "antenatal", label: "Antenatal Care", icon: Heart, color: "bg-red-100 text-red-800" },
  { id: "postnatal", label: "Postnatal Care", icon: Heart, color: "bg-pink-100 text-pink-800" },
  { id: "immunization", label: "Immunization", icon: Syringe, color: "bg-green-100 text-green-800" },
  { id: "general", label: "General Visit", icon: Users, color: "bg-blue-100 text-blue-800" }
];

interface VisitPlanningProps {
  onNavigate?: (view: string) => void;
  onViewChange?: (view: string) => void;
}

export function VisitPlanning({ onNavigate, onViewChange }: VisitPlanningProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [visits, setVisits] = useState(mockVisits);
  const [showAddVisit, setShowAddVisit] = useState(false);
  const [routeOptimized, setRouteOptimized] = useState(false);
  const [newVisit, setNewVisit] = useState({
    patient: "",
    type: "antenatal",
    time: "",
    notes: "",
    priority: "routine"
  });

  const navigate = (v: string) => {
    if (onNavigate) onNavigate(v);
    else if (onViewChange) onViewChange(v);
  };

  const handleAddVisit = () => {
    if (newVisit.patient && newVisit.time) {
      const created = {
        id: Date.now(),
        patient: newVisit.patient,
        type: newVisit.type,
        priority: newVisit.priority,
        address: "District Patna, Sector 1",
        phone: "+91 98000 00000",
        scheduledTime: newVisit.time,
        estimatedDuration: 30,
        lastVisit: "2024-03-01",
        notes: newVisit.notes,
        latitude: 26.35,
        longitude: 86.07
      };
      setVisits(prev => [created, ...prev]);
      toast.success(`Visit scheduled for ${newVisit.patient}!`);
      setShowAddVisit(false);
      setNewVisit({ patient: "", type: "antenatal", time: "", notes: "", priority: "routine" });
    } else {
      toast.error("Please enter patient name and time");
    }
  };

  const handleStartVisit = (visit: any) => {
    toast.success(`Starting visit for ${visit.patient}`);
    if (visit.type === 'antenatal' || visit.type === 'postnatal') {
      navigate('antenatal');
    } else if (visit.type === 'immunization') {
      navigate('immunization');
    } else {
      navigate('unified-records');
    }
  };

  const handleDirections = (visit: any) => {
    toast.info(`Plotting route to ${visit.patient}'s location (${visit.address})`);
    navigate('mapping');
  };

  const handleCall = (phone: string, name: string) => {
    toast.info(`Connecting dialer to ${name} (${phone})`);
    try {
      window.open(`tel:${phone}`);
    } catch (e) {}
  };

  const optimizeRoute = () => {
    setRouteOptimized(true);
    toast.success("Route optimized! Travel time reduced by 25 minutes.");
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'due':
        return <Badge className="bg-orange-100 text-orange-800">Due</Badge>;
      default:
        return <Badge variant="outline">Routine</Badge>;
    }
  };

  const getVisitTypeInfo = (type: string) => {
    return visitTypes.find(vt => vt.id === type) || visitTypes[0];
  };

  const totalDuration = visits.reduce((sum, visit) => sum + visit.estimatedDuration, 0);
  const totalDistance = routeOptimized ? "12.5 km" : "18.2 km";

  return (
    <div className="space-y-6">
      <div>
        <h2>Visit Planning</h2>
        <p className="text-muted-foreground">Plan and optimize your daily visits</p>
      </div>

      {/* Date Selection and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="mb-4">Select Date</h3>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="w-full"
          />
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">Today's Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Visits</span>
              <span className="font-medium">{visits.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Estimated Time</span>
              <span className="font-medium">{totalDuration} mins</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Distance</span>
              <span className="font-medium">{totalDistance}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Route Status</span>
              {routeOptimized ? (
                <Badge className="bg-green-100 text-green-800">Optimized</Badge>
              ) : (
                <Badge variant="outline">Not Optimized</Badge>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button 
              onClick={() => setShowAddVisit(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Visit
            </Button>
            <Button 
              variant="outline" 
              onClick={optimizeRoute}
              className="w-full"
              disabled={routeOptimized}
            >
              <Route className="h-4 w-4 mr-2" />
              {routeOptimized ? "Route Optimized" : "Optimize Route"}
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('mapping')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              View on Map
            </Button>
          </div>
        </Card>
      </div>

      {/* Add New Visit Form */}
      {showAddVisit && (
        <Card className="p-6">
          <h3 className="mb-4">Schedule New Visit</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Patient Name</Label>
              <Input 
                placeholder="Enter patient name"
                value={newVisit.patient}
                onChange={(e) => setNewVisit(prev => ({ ...prev, patient: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Visit Type</Label>
              <Select value={newVisit.type} onValueChange={(value) => setNewVisit(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visitTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input 
                type="time"
                value={newVisit.time}
                onChange={(e) => setNewVisit(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={newVisit.priority} onValueChange={(value) => setNewVisit(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="due">Due</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleAddVisit}>
              <CalendarIcon className="h-4 w-4 mr-2" />
              Schedule Visit
            </Button>
            <Button variant="outline" onClick={() => setShowAddVisit(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Visit List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3>Scheduled Visits</h3>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                toast.success("GPS navigation launched to visit routes!");
                navigate('mapping');
              }}
            >
              <Route className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {visits.map((visit, index) => {
            const visitTypeInfo = getVisitTypeInfo(visit.type);
            const Icon = visitTypeInfo.icon;
            
            return (
              <Card key={visit.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${visitTypeInfo.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{visit.patient}</p>
                      <p className="text-sm text-muted-foreground">{visitTypeInfo.label}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(visit.priority)}
                    <Badge variant="outline">
                      <Clock className="h-3 w-3 mr-1" />
                      {visit.scheduledTime}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{visit.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{visit.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{visit.estimatedDuration} minutes</span>
                  </div>
                </div>

                {visit.notes && (
                  <div className="mt-3 p-2 bg-muted/30 rounded">
                    <p className="text-sm">{visit.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 mt-4">
                  <Button size="sm" onClick={() => handleStartVisit(visit)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Start Visit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDirections(visit)}>
                    <Navigation className="h-4 w-4 mr-2" />
                    Directions
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCall(visit.phone, visit.patient)}>
                    <Phone className="h-4 w-4 mr-2" />
                    Call
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </Card>

      {/* Map Placeholder */}
      <Card className="p-6">
        <h3 className="mb-4">Visit Route Map</h3>
        <div className="aspect-video bg-muted/30 rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MapPin className="h-16 w-16 mx-auto mb-4" />
            <p>Interactive route map would display here</p>
            <p className="text-sm">Showing optimized route between visit locations</p>
            {routeOptimized && (
              <Badge className="bg-green-100 text-green-800 mt-2">
                Route Optimized - 25 min saved
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default VisitPlanning;