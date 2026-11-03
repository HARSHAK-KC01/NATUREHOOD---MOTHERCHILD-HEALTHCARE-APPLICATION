import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";
import { 
  Map, 
  Filter, 
  Layers, 
  Users, 
  MapPin, 
  BarChart3,
  Target,
  TrendingUp,
  AlertTriangle,
  Maximize,
  Navigation,
  Route
} from "lucide-react";
import { toast } from "sonner";

// Import Leaflet (will be loaded dynamically)
let L: any = null;

// Map configuration based on your specifications
const mapConfig = {
  provider: "leaflet",
  tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  center: [22.9734, 78.6569] as [number, number], // Geographic center of India
  zoom: 5,
  minZoom: 4,
  maxZoom: 12,
  fitToRoutes: true
};

// Sample routes data for Indian healthcare network
const routesData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {
        id: "delhi-mumbai",
        name: "Delhi → Mumbai (Healthcare Corridor)",
        from: "New Delhi",
        to: "Mumbai",
        distance: "≈ 1,400 km",
        color: "#1A73E8",
        weight: 5,
        type: "primary-route"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.2090, 28.6139], // New Delhi
          [75.8577, 26.9124], // Jaipur
          [72.8777, 19.0760]  // Mumbai
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "kolkata-chennai",
        name: "Kolkata → Chennai (Eastern Route)",
        from: "Kolkata",
        to: "Chennai",
        distance: "≈ 1,660 km",
        color: "#2BB673",
        weight: 4,
        type: "secondary-route"
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [88.3639, 22.5726], // Kolkata
          [85.8245, 20.2961], // Bhubaneswar
          [80.2707, 13.0827]  // Chennai
        ]
      }
    },
    {
      type: "Feature",
      properties: {
        id: "srinagar-kanyakumari",
        name: "Srinagar → Kanyakumari (National Route)",
        from: "Srinagar",
        to: "Kanyakumari",
        distance: "≈ 3,700+ km",
        color: "#FF6F61",
        weight: 3,
        type: "national-route",
        dashed: true
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [74.7973, 34.0837], // Srinagar
          [77.2090, 28.6139], // Delhi
          [78.4744, 17.3850], // Hyderabad
          [72.8777, 19.0760], // Mumbai
          [77.5385, 8.0883]   // Kanyakumari
        ]
      }
    }
  ]
};

// Mock health facility data with coordinates
const healthFacilities = [
  { id: 'aiims-delhi', name: 'AIIMS New Delhi', type: 'Tertiary', lat: 28.5672, lng: 77.2100, coverage: 95 },
  { id: 'kgmu-lucknow', name: 'KGMU Lucknow', type: 'Medical College', lat: 26.8467, lng: 80.9462, coverage: 88 },
  { id: 'phc-madhubani', name: 'PHC Madhubani', type: 'PHC', lat: 26.3518, lng: 86.0759, coverage: 89 },
  { id: 'sc-benipatti', name: 'SC Benipatti', type: 'Sub-Center', lat: 26.3218, lng: 86.0459, coverage: 78 },
  { id: 'chc-darbhanga', name: 'CHC Darbhanga', type: 'CHC', lat: 26.1542, lng: 85.8918, coverage: 82 },
  { id: 'phc-sitamarhi', name: 'PHC Sitamarhi', type: 'PHC', lat: 26.5931, lng: 85.4897, coverage: 92 }
];

interface MappingViewProps {
  onNavigate?: (view: string) => void;
  onViewChange?: (view: string) => void;
}

export function MappingView({ onNavigate, onViewChange }: MappingViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [selectedLayer, setSelectedLayer] = useState<'coverage' | 'routes' | 'facilities'>('coverage');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const navigate = (v: string) => {
    if (onNavigate) onNavigate(v);
    else if (onViewChange) onViewChange(v);
  };

  const handleMyLocation = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([25.5941, 85.1376], 10);
      toast.success("Map centered to your current district field office (Patna, Bihar)");
    } else {
      toast.info("Field location: Patna District Office, Bihar");
    }
  };

  const handleToggleLayers = () => {
    const nextLayer = selectedLayer === 'coverage' ? 'routes' : selectedLayer === 'routes' ? 'facilities' : 'coverage';
    setSelectedLayer(nextLayer);
    toast.info(`Active layer switched to: ${nextLayer.toUpperCase()}`);
  };

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== 'undefined' && !L) {
        // Import Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Import Leaflet JS
        const leafletModule = await import('leaflet');
        L = leafletModule.default;

        // Fix for default markers
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });

        setIsMapLoaded(true);
      }
    };

    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (isMapLoaded && mapRef.current && !mapInstanceRef.current) {
      const map = L.map(mapRef.current, {
        center: mapConfig.center,
        zoom: mapConfig.zoom,
        minZoom: mapConfig.minZoom,
        maxZoom: mapConfig.maxZoom,
        zoomControl: true,
        attributionControl: true
      });

      // Add tile layer
      L.tileLayer(mapConfig.tileUrl, {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Add routes if enabled
      if (showRoutes) {
        addRoutesToMap(map);
      }

      // Add health facilities if enabled
      if (showFacilities) {
        addFacilitiesToMap(map);
      }
    }
  }, [isMapLoaded, showRoutes, showFacilities]);

  const addRoutesToMap = (map: any) => {
    routesData.features.forEach((route: any) => {
      const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
      
      const routeLine = L.polyline(coordinates, {
        color: route.properties.color,
        weight: route.properties.weight,
        opacity: 0.85,
        dashArray: route.properties.dashed ? '10, 10' : null
      }).addTo(map);

      // Add popup with route information
      const popupContent = `
        <div class="p-2">
          <strong>${route.properties.name}</strong><br/>
          Distance: ${route.properties.distance}<br/>
          From: ${route.properties.from} → To: ${route.properties.to}
        </div>
      `;
      
      routeLine.bindPopup(popupContent);
    });
  };

  const addFacilitiesToMap = (map: any) => {
    healthFacilities.forEach((facility) => {
      const color = facility.coverage >= 85 ? '#2BB673' : facility.coverage >= 70 ? '#FFD54F' : '#FF6F61';
      
      const marker = L.circleMarker([facility.lat, facility.lng], {
        radius: 8,
        fillColor: color,
        color: '#FFFFFF',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      const popupContent = `
        <div class="p-2">
          <strong>${facility.name}</strong><br/>
          Type: ${facility.type}<br/>
          Coverage: ${facility.coverage}%
        </div>
      `;
      
      marker.bindPopup(popupContent);
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  };

  const fitToRoutes = () => {
    if (mapInstanceRef.current) {
      const allCoords = routesData.features.flatMap((route: any) => 
        route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]])
      );
      
      if (allCoords.length > 0) {
        const group = new L.featureGroup(allCoords.map((coord: number[]) => L.marker(coord)));
        mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
      }
    }
  };

  const getCoverageLabel = (coverage: number) => {
    if (coverage >= 85) return 'Good';
    if (coverage >= 70) return 'Moderate';
    return 'Low';
  };

  const getCoverageBadgeClasses = (coverage: number) => {
    if (coverage >= 85) return 'bg-green-100 text-green-800';
    if (coverage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-700';
  };

  const getRouteMarkerClasses = (routeType: string) => {
    switch (routeType) {
      case 'primary-route':
        return 'bg-primary';
      case 'secondary-route':
        return 'bg-accent';
      case 'national-route':
        return 'bg-secondary border border-secondary border-dashed';
      default:
        return 'bg-muted';
    }
  };

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2>Healthcare Coverage Mapping</h2>
          <p className="text-muted-foreground">Geographic visualization of healthcare routes and facility coverage across India</p>
        </div>
        <Button variant="outline" onClick={toggleFullscreen}>
          <Maximize className="h-4 w-4 mr-2" />
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </div>

      {/* Map Controls */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Layer View</label>
            <Select value={selectedLayer} onValueChange={(value: any) => setSelectedLayer(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="coverage">Coverage Areas</SelectItem>
                <SelectItem value="routes">Healthcare Routes</SelectItem>
                <SelectItem value="facilities">Health Facilities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm">Show Routes</label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={showRoutes}
                onCheckedChange={setShowRoutes}
              />
              <Route className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm">Show Facilities</label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={showFacilities}
                onCheckedChange={setShowFacilities}
              />
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fitToRoutes}>
              <Navigation className="h-4 w-4 mr-2" />
              Fit Routes
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleMyLocation}>
              <Target className="h-4 w-4 mr-2" />
              My Location
            </Button>
          </div>
        </div>
      </Card>

      {/* Interactive Map */}
      <Card className="p-0 overflow-hidden">
        <div 
          ref={mapRef}
          className={`bg-muted/30 w-full ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'}`}
        >
          {!isMapLoaded && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Map className="h-16 w-16 mx-auto mb-4" />
                <p>Loading interactive map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Map Legend */}
        <div className="p-4 border-t bg-card">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Routes:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1 bg-primary rounded"></div>
                  <span className="text-xs">Primary</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1 bg-accent rounded"></div>
                  <span className="text-xs">Secondary</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1 bg-secondary rounded border-dashed border border-secondary"></div>
                  <span className="text-xs">National</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Facilities:</span>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-xs">85%+ Coverage</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-xs">70-84% Coverage</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span className="text-xs">&lt;70% Coverage</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast.info("Displaying high-priority healthcare corridor filter")}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleToggleLayers}
              >
                <Layers className="h-4 w-4 mr-2" />
                Layers
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {!isFullscreen && (
        <>
          {/* Route Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="mb-4">Healthcare Routes</h3>
              <div className="space-y-4">
                {routesData.features.map((route: any) => (
                  <div key={route.properties.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-4 h-4 rounded-full ${getRouteMarkerClasses(route.properties.type)}`}
                      ></div>
                      <div>
                        <p className="font-medium">{route.properties.name}</p>
                        <p className="text-sm text-muted-foreground">{route.properties.distance}</p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {route.properties.type.replace('-', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Priority Facilities</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">SC Benipatti</p>
                      <p className="text-sm text-muted-foreground">78% coverage - needs attention</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => {
                      toast.info("Navigating to Field Visit Planner to dispatch ASHA team...");
                      navigate('visits');
                    }}
                  >
                    Action Plan
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium">CHC Darbhanga</p>
                      <p className="text-sm text-muted-foreground">82% coverage - monitor progress</p>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => toast.success("CHC Darbhanga status tracked: Weekly sync schedule enabled")}
                  >
                    Monitor
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">AIIMS New Delhi</p>
                      <p className="text-sm text-muted-foreground">95% coverage - excellent performance</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Health Facilities Grid */}
          <Card className="p-6">
            <h3 className="mb-4">Health Facilities Network</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {healthFacilities.map((facility) => (
                <Card key={facility.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{facility.type}</span>
                    </div>
                    <Badge className={getCoverageBadgeClasses(facility.coverage)}>
                      {facility.coverage}%
                    </Badge>
                  </div>
                  <h4 className="font-medium">{facility.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Coverage: {getCoverageLabel(facility.coverage)}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    onClick={() => {
                      toast.info(`Viewing teleconsultation connectivity for ${facility.name}`);
                      navigate('hospital-network');
                    }}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default MappingView;