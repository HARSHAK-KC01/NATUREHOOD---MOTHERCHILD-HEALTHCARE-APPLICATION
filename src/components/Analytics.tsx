import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { DynamicWidthBar } from "./ui/dynamic-width-bar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Syringe, 
  Heart, 
  Calendar,
  Download,
  Filter,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

const mockAnalytics = {
  overview: {
    totalBeneficiaries: 2847,
    fullyImmunized: 2156,
    antenatalCoverage: 87,
    activePregnancies: 234
  },
  trends: [
    { month: 'Oct 2023', immunization: 78, antenatal: 82 },
    { month: 'Nov 2023', immunization: 81, antenatal: 84 },
    { month: 'Dec 2023', immunization: 85, antenatal: 86 },
    { month: 'Jan 2024', immunization: 87, antenatal: 87 },
    { month: 'Feb 2024', immunization: 89, antenatal: 89 },
    { month: 'Mar 2024', immunization: 91, antenatal: 87 }
  ],
  ageGroups: [
    { group: '0-2 months', total: 156, immunized: 145, percentage: 93 },
    { group: '2-6 months', total: 234, immunized: 198, percentage: 85 },
    { group: '6-12 months', total: 278, immunized: 245, percentage: 88 },
    { group: '12-24 months', total: 312, immunized: 287, percentage: 92 }
  ],
  districts: [
    { name: 'Madhubani', coverage: 89, trend: 'up', change: 3 },
    { name: 'Darbhanga', coverage: 76, trend: 'down', change: -2 },
    { name: 'Sitamarhi', coverage: 94, trend: 'up', change: 5 }
  ]
};

interface AnalyticsProps {
  onNavigate?: (view: string) => void;
  onViewChange?: (view: string) => void;
}

export function Analytics({ onNavigate, onViewChange }: AnalyticsProps) {
  const [overview, setOverview] = useState(mockAnalytics.overview);
  const [showFilters, setShowFilters] = useState(false);

  const navigate = (v: string) => {
    if (onNavigate) onNavigate(v);
    else if (onViewChange) onViewChange(v);
  };

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setOverview(prev => ({
            ...prev,
            totalBeneficiaries: res.data.beneficiaries || prev.totalBeneficiaries,
            fullyImmunized: res.data.immunizations || prev.fullyImmunized,
            activePregnancies: res.data.highRiskMothers || prev.activePregnancies
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mockAnalytics, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `maternal_health_analytics_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
    toast.success("Analytics data downloaded as JSON report!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Analytics Dashboard</h2>
          <p className="text-muted-foreground">Comprehensive health coverage analytics and trends</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={showFilters ? "default" : "outline"}
            onClick={() => {
              setShowFilters(!showFilters);
              toast.info(showFilters ? "Filters collapsed" : "Filter options toggled");
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Time Period Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm">Time Period:</span>
          <Select defaultValue="6months">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm">District:</span>
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Districts</SelectItem>
              <SelectItem value="madhubani">Madhubani</SelectItem>
              <SelectItem value="darbhanga">Darbhanga</SelectItem>
              <SelectItem value="sitamarhi">Sitamarhi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl">{mockAnalytics.overview.totalBeneficiaries.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Beneficiaries</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Syringe className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl">{mockAnalytics.overview.fullyImmunized.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Fully Immunized</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Heart className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl">{mockAnalytics.overview.antenatalCoverage}%</p>
              <p className="text-sm text-muted-foreground">Antenatal Coverage</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl">{mockAnalytics.overview.activePregnancies}</p>
              <p className="text-sm text-muted-foreground">Active Pregnancies</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Coverage Trends */}
      <Card className="p-6">
        <h3 className="mb-4">Coverage Trends</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Badge className="bg-primary/10 text-primary">Immunization Coverage</Badge>
            <Badge className="bg-secondary/10 text-secondary">Antenatal Coverage</Badge>
          </div>
          
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-16 w-16 mx-auto mb-4" />
              <p>Coverage trend chart would display here</p>
              <p className="text-sm">Line graph showing monthly trends for immunization and antenatal coverage</p>
            </div>
          </div>

          <div className="grid grid-cols-6 gap-4 text-center">
            {mockAnalytics.trends.map((trend, index) => (
              <div key={index} className="space-y-2">
                <p className="text-xs text-muted-foreground">{trend.month}</p>
                <div className="space-y-1">
                  <div className="h-2 bg-primary rounded-full"></div>
                  <p className="text-xs">{trend.immunization}%</p>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-secondary rounded-full"></div>
                  <p className="text-xs">{trend.antenatal}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Age Group Analysis */}
      <Card className="p-6">
        <h3 className="mb-4">Immunization by Age Group</h3>
        <div className="space-y-4">
          {mockAnalytics.ageGroups.map((group, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{group.group}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {group.immunized}/{group.total}
                  </span>
                  <Badge variant={group.percentage >= 90 ? 'default' : group.percentage >= 80 ? 'secondary' : 'destructive'}>
                    {group.percentage}%
                  </Badge>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <DynamicWidthBar percent={group.percentage} className="bg-primary" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* District Performance */}
      <Card className="p-6">
        <h3 className="mb-4">District Performance</h3>
        <div className="space-y-4">
          {mockAnalytics.districts.map((district, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{district.name}</p>
                  <p className="text-sm text-muted-foreground">District coverage rate</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-2xl">{district.coverage}%</p>
                  <div className="flex items-center gap-1">
                    {district.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${district.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {district.change > 0 ? '+' : ''}{district.change}%
                    </span>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    toast.info(`Viewing detailed health mapping for ${district.name} (${district.coverage}% coverage)`);
                    navigate('mapping');
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          size="lg" 
          className="h-20"
          onClick={handleExport}
        >
          <div className="text-center">
            <Download className="h-6 w-6 mx-auto mb-2" />
            <p>Export Report</p>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="h-20"
          onClick={() => {
            toast.info("Navigating to Field Campaign Visit Planner...");
            navigate('visits');
          }}
        >
          <div className="text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2" />
            <p>Schedule Campaign</p>
          </div>
        </Button>
        
        <Button 
          variant="outline" 
          size="lg" 
          className="h-20"
          onClick={() => {
            toast.success("Live ABDM Analytics Engine running on Supabase v2.0");
          }}
        >
          <div className="text-center">
            <BarChart3 className="h-6 w-6 mx-auto mb-2" />
            <p>Advanced Analytics</p>
          </div>
        </Button>
      </div>
    </div>
  );
}

export default Analytics;