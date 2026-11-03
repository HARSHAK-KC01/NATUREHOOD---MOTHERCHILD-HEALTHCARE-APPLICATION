import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";
import { 
  Users, 
  Syringe, 
  Calendar, 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Baby, 
  Heart, 
  Clock, 
  FileText, 
  Download, 
  Bell, 
  Activity, 
  Stethoscope, 
  Pill, 
  Phone, 
  CheckCircle, 
  XCircle, 
  BarChart3, 
  Map, 
  FileDown, 
  Eye, 
  Plus, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  Send, 
  X,
  Layers,
  ArrowRight
} from "lucide-react";

interface DashboardProps {
  userRole?: string;
  onNavigate?: (view: string) => void;
  onViewChange?: (view: string) => void;
}

const mockData = {
  overview: {
    totalPatients: 1247,
    activeHighRisk: 34,
    upcomingAppointments: 18,
    immunizationCoverage: 87,
    maternalHealthTrend: 92,
    visitCompletionRate: 76
  },
  reminders: [
    { id: 1, type: 'immunization', patient: 'Baby Anjali Kumar', vaccine: 'DPT-2', dueDate: '2025-10-05', priority: 'high', phone: '+91 98765 43210' },
    { id: 2, type: 'followup', patient: 'Priya Devi', reason: 'Post-natal check (Trimester 3)', dueDate: '2025-10-03', priority: 'medium', phone: '+91 98765 43211' },
    { id: 3, type: 'medicine', patient: 'Sunita Sharma', medication: 'Iron & Folic Acid tablets', dueDate: '2025-10-04', priority: 'low', phone: '+91 98765 43212' },
    { id: 4, type: 'immunization', patient: 'Baby Rohit Singh', vaccine: 'BCG Booster', dueDate: '2025-10-02', priority: 'high', phone: '+91 98765 43213' }
  ],
  analytics: {
    immunizationTrends: [
      { month: 'Jun', coverage: 82 },
      { month: 'Jul', coverage: 85 },
      { month: 'Aug', coverage: 87 },
      { month: 'Sep', coverage: 89 },
      { month: 'Oct', coverage: 87 }
    ],
    healthMetrics: {
      fullyImmunized: 2156,
      partiallyImmunized: 423,
      unimmunized: 268,
      highRiskPregnancies: 45,
      normalPregnancies: 189
    }
  },
  geoMapping: {
    totalAreas: 24,
    underServedAreas: 5,
    campaignCoverage: 78,
    recentCampaigns: [
      { name: 'Polio Drive 2025', coverage: 94, areas: 18 },
      { name: 'Measles Campaign', coverage: 87, areas: 22 },
      { name: 'COVID Booster', coverage: 76, areas: 15 }
    ]
  },
  recentRecords: [
    { id: 1, patient: 'Anjali Kumari', type: 'Lab Report', date: '2025-09-28', status: 'New' },
    { id: 2, patient: 'Priya Sharma', type: 'Prescription', date: '2025-09-27', status: 'Updated' },
    { id: 3, patient: 'Baby Rohit', type: 'Vaccination Record', date: '2025-09-26', status: 'Complete' },
    { id: 4, patient: 'Sunita Devi', type: 'Antenatal Report', date: '2025-09-25', status: 'Pending Review' }
  ]
};

export function Dashboard({ userRole, onNavigate, onViewChange }: DashboardProps) {
  const { t } = useLanguage();
  const navigate = onNavigate || onViewChange;
  const [activeTab, setActiveTab] = useState('overview');
  const [callingPatient, setCallingPatient] = useState<any | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [liveStats, setLiveStats] = useState<{
    totalPatients?: number;
    activeHighRisk?: number;
    upcomingAppointments?: number;
    immunizationCoverage?: number;
  }>({});

  useEffect(() => {
    // Fetch live statistics from backend API
    fetch('/api/analytics')
      .then(r => r.json())
      .then(res => {
        if (res.success && res.stats) {
          setLiveStats({
            totalPatients: res.stats.totalBeneficiaries,
            activeHighRisk: res.stats.highRiskPregnancies,
            immunizationCoverage: parseInt(res.stats.immunizationCoverageRate) || 87,
          });
        }
      })
      .catch(() => {});
  }, []);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high': 
        return 'border-l-4 border-l-rose-500 bg-rose-50/60 dark:bg-rose-950/20 border-rose-200/70 dark:border-rose-900/40';
      case 'medium': 
        return 'border-l-4 border-l-amber-500 bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40';
      case 'low': 
        return 'border-l-4 border-l-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-900/40';
      default: 
        return 'border-border/70 bg-card';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'Pending Review': return <Clock className="h-4 w-4 text-amber-600" />;
      case 'New': return <Plus className="h-4 w-4 text-primary" />;
      default: return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const handleExportData = async () => {
    try {
      const res = await fetch('/api/patients');
      const json = await res.json();
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        source: json.source || 'supabase',
        totalRecords: json.count || json.data?.length || 0,
        beneficiaries: json.data || mockData.overview,
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `nurturehood_beneficiary_roster_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success("Live beneficiary data exported successfully!");
    } catch {
      toast.info("Generated sample health export report.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 22 }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t('nav.dashboard')}
            </h2>
            <Badge variant="success" className="gap-1 font-mono text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ABDM LIVE
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t('app.tagline')}
          </p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAlertModal(true)}
            className="rounded-xl border-border/80 h-9"
          >
            <Bell className="h-4 w-4 text-secondary mr-1.5" />
            <span>Alerts</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-secondary text-white text-[10px] font-bold">
              4
            </span>
          </Button>

          <Button 
            variant="default" 
            size="sm" 
            onClick={handleExportData}
            className="rounded-xl h-9 shadow-sm"
          >
            <Download className="h-4 w-4 mr-1.5" />
            <span>{t('action.export')}</span>
          </Button>
        </div>
      </div>

      {/* Modern Tabs Bar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview">
            <span>📊</span>
            <span className="hidden sm:inline">{t('dash.overview')}</span>
          </TabsTrigger>
          <TabsTrigger value="reminders">
            <span>⏰</span>
            <span className="hidden sm:inline">Reminders</span>
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <span>📈</span>
            <span className="hidden sm:inline">{t('nav.analytics')}</span>
          </TabsTrigger>
          <TabsTrigger value="mapping">
            <span>🗺️</span>
            <span className="hidden sm:inline">{t('nav.mapping')}</span>
          </TabsTrigger>
          <TabsTrigger value="records">
            <span>📂</span>
            <span className="hidden sm:inline">Records</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
          {/* Key Metric Stat Cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {/* Total Beneficiaries Card */}
            <motion.div variants={itemVariants}>
              <Card 
                onClick={() => navigate && navigate('unified-records')}
                className="p-6 relative group border-slate-200/90 dark:border-slate-800 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('dash.totalPatients')}
                    </p>
                    <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                      {(liveStats.totalPatients ?? mockData.overview.totalPatients).toLocaleString()}
                    </p>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold mt-1 border border-emerald-200/50">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Live Supabase Connected</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-200">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* High-Risk Pregnancies Card */}
            <motion.div variants={itemVariants}>
              <Card 
                onClick={() => navigate && navigate('antenatal')}
                className="p-6 relative group border-slate-200/90 dark:border-slate-800 border-l-4 border-l-rose-500 cursor-pointer hover:border-rose-400/80 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('dash.activeHighRisk')}
                    </p>
                    <p className="text-3xl sm:text-4xl font-extrabold text-rose-600 tracking-tight">
                      {liveStats.activeHighRisk ?? mockData.overview.activeHighRisk}
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold mt-1 border border-rose-200/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      <span>Immediate Attention Required</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform duration-200">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Upcoming Appointments Card */}
            <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
              <Card 
                onClick={() => navigate && navigate('visits')}
                className="p-6 relative group border-slate-200/90 dark:border-slate-800 cursor-pointer hover:border-emerald-400/80 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t('dash.upcomingAppointments')}
                    </p>
                    <p className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                      {mockData.overview.upcomingAppointments}
                    </p>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold mt-1 border border-primary/20">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Next 7 days in Block 3</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-200">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Progress Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{t('dash.immunizationCoverage')}</h3>
                  <p className="text-xs text-muted-foreground">Indradhanush Target: 90%</p>
                </div>
                <span className="text-xl font-extrabold text-primary">{mockData.overview.immunizationCoverage}%</span>
              </div>
              <div className="w-full bg-muted/80 rounded-full h-3 overflow-hidden p-0.5">
                <div className="bg-gradient-to-r from-primary to-blue-500 h-full rounded-full transition-all duration-700" style={{ width: `${mockData.overview.immunizationCoverage}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 flex items-center justify-between">
                <span>RCH Ward Coverage</span>
                <span className="text-emerald-600 font-bold">On Schedule</span>
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{t('dash.maternalTrend')}</h3>
                  <p className="text-xs text-muted-foreground">Safe Motherhood Index</p>
                </div>
                <span className="text-xl font-extrabold text-emerald-600">{mockData.overview.maternalHealthTrend}%</span>
              </div>
              <div className="w-full bg-muted/80 rounded-full h-3 overflow-hidden p-0.5">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700" style={{ width: `${mockData.overview.maternalHealthTrend}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 flex items-center justify-between">
                <span>Hospital Delivery Readiness</span>
                <span className="text-emerald-600 font-bold">+5% this quarter</span>
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{t('dash.visitRate')}</h3>
                  <p className="text-xs text-muted-foreground">Household Visits Completed</p>
                </div>
                <span className="text-xl font-extrabold text-foreground">{mockData.overview.visitCompletionRate}%</span>
              </div>
              <div className="w-full bg-muted/80 rounded-full h-3 overflow-hidden p-0.5">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-700" style={{ width: `${mockData.overview.visitCompletionRate}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-3 flex items-center justify-between">
                <span>Pending Ward Visists</span>
                <span className="text-amber-600 font-bold">24% remaining</span>
              </p>
            </Card>
          </div>

          {/* Quick Action Tiles */}
          <Card className="p-6 rounded-3xl bg-gradient-to-br from-primary/5 via-blue-500/5 to-transparent border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-foreground">
                  {t('dash.quickActions')}
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">1-Tap Shortcuts</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (navigate) navigate('register');
                  else toast.info("Navigating to Register Patient");
                }}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-card border border-border/80 shadow-xs hover:border-primary/40 hover:shadow-md transition-all text-center cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-primary flex items-center justify-center mb-2.5">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-foreground">{t('dash.quickRegister')}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Mother & Infant</span>
              </motion.button>

              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (navigate) navigate('scan');
                  else toast.info("Opening QR Scanner");
                }}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-card border border-border/80 shadow-xs hover:border-emerald-500/40 hover:shadow-md transition-all text-center cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2.5">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-foreground">{t('dash.quickScan')}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">ABHA / RCH ID</span>
              </motion.button>

              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (navigate) navigate('visits');
                  else toast.info("Opening Route Planner");
                }}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-card border border-border/80 shadow-xs hover:border-amber-500/40 hover:shadow-md transition-all text-center cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-2.5">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-foreground">{t('dash.quickVisit')}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Field GPS Route</span>
              </motion.button>

              <motion.button
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExportData}
                className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white dark:bg-card border border-border/80 shadow-xs hover:border-rose-500/40 hover:shadow-md transition-all text-center cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mb-2.5">
                  <FileDown className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-foreground">{t('dash.quickReport')}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">Download JSON</span>
              </motion.button>
            </div>
          </Card>
        </TabsContent>

        {/* Reminders Tab */}
        <TabsContent value="reminders" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-base text-foreground">Priority Beneficiary Reminders</h3>
                  <p className="text-xs text-muted-foreground">Action items requiring immediate household visits</p>
                </div>
                <Badge variant="destructive" className="font-bold">4 URGENT</Badge>
              </div>

              <div className="space-y-3.5">
                {mockData.reminders.map((reminder) => (
                  <motion.div 
                    key={reminder.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-2xl border transition-all ${getPriorityStyle(reminder.priority)}`}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 p-2 rounded-xl bg-white/80 dark:bg-card/80 shrink-0 shadow-2xs">
                        {reminder.type === 'immunization' && <Syringe className="h-4 w-4 text-primary" />}
                        {reminder.type === 'followup' && <Stethoscope className="h-4 w-4 text-emerald-600" />}
                        {reminder.type === 'medicine' && <Pill className="h-4 w-4 text-amber-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-sm text-foreground truncate">{reminder.patient}</p>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            Due: {reminder.dueDate}
                          </Badge>
                        </div>
                        <p className="text-xs mt-1 text-foreground/80 leading-relaxed">
                          {reminder.type === 'immunization' && `${reminder.vaccine} vaccination due for infant`}
                          {reminder.type === 'followup' && reminder.reason}
                          {reminder.type === 'medicine' && `${reminder.medication} refill needed`}
                        </p>
                        <div className="flex gap-2.5 mt-3.5">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => setCallingPatient(reminder)}
                            className="h-8 rounded-xl text-xs font-semibold"
                          >
                            <Phone className="h-3.5 w-3.5 mr-1" />
                            {t('action.call')}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toast.success(`Reminder SMS dispatched to ${reminder.patient}`)}
                            className="h-8 rounded-xl text-xs font-semibold"
                          >
                            <Send className="h-3.5 w-3.5 mr-1" />
                            Send SMS
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card className="p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground mb-1">Appointment Dispatcher</h3>
                <p className="text-xs text-muted-foreground mb-5">Quickly book clinical slots with Sub-Centers</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (navigate) navigate('vaccination-timeline');
                      else toast.info("Opening Vaccination Timeline");
                    }}
                    className="h-20 flex-col gap-2 rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    <Syringe className="h-5 w-5 text-primary" />
                    <span className="text-xs font-bold">Schedule Vaccine</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (navigate) navigate('antenatal');
                      else toast.info("Opening Antenatal Care");
                    }}
                    className="h-20 flex-col gap-2 rounded-2xl hover:border-rose-500/40 hover:bg-rose-500/5 transition-all"
                  >
                    <Heart className="h-5 w-5 text-rose-500" />
                    <span className="text-xs font-bold">Antenatal Visit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (navigate) navigate('immunization');
                      else toast.info("Opening Child Immunization");
                    }}
                    className="h-20 flex-col gap-2 rounded-2xl hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all"
                  >
                    <Baby className="h-5 w-5 text-emerald-600" />
                    <span className="text-xs font-bold">Child Check-up</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (navigate) navigate('unified-records');
                      else toast.info("Opening Mother-Child Records");
                    }}
                    className="h-20 flex-col gap-2 rounded-2xl hover:border-amber-500/40 hover:bg-amber-500/5 transition-all"
                  >
                    <Pill className="h-5 w-5 text-amber-600" />
                    <span className="text-xs font-bold">Medicine Refill</span>
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/15">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="font-bold text-xs text-foreground">Duty Summary Today</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• 8 beneficiaries confirmed for morning clinic</p>
                  <p>• 5 automated vaccination SMS alerts sent</p>
                  <p>• 3 high-risk postpartum home visits scheduled</p>
                  <p>• 2 severe anemia cases flagged for iron sucrose</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-base text-foreground mb-4">Immunization Status Breakdown</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-foreground">Fully Immunized Children</span>
                    <span className="font-extrabold text-emerald-600">{mockData.analytics.healthMetrics.fullyImmunized} (76%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden p-0.5">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: '76%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-foreground">Partially Immunized</span>
                    <span className="font-extrabold text-amber-600">{mockData.analytics.healthMetrics.partiallyImmunized} (15%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden p-0.5">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-700" style={{ width: '15%' }} />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-foreground">Unimmunized / Dropout Pockets</span>
                    <span className="font-extrabold text-rose-600">{mockData.analytics.healthMetrics.unimmunized} (9%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3 overflow-hidden p-0.5">
                    <div className="bg-rose-500 h-full rounded-full transition-all duration-700" style={{ width: '9%' }} />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-bold text-base text-foreground mb-4">Monthly Indradhanush Trend</h3>
              <div className="h-44 bg-muted/30 rounded-2xl flex items-center justify-center border border-border/50 p-4">
                <div className="w-full flex items-end justify-between gap-3 h-28 px-4">
                  {mockData.analytics.immunizationTrends.map((trend, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <span className="text-[10px] font-bold text-primary">{trend.coverage}%</span>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${trend.coverage}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="w-full max-w-[36px] bg-gradient-to-t from-primary to-blue-400 rounded-t-xl"
                      />
                      <span className="text-[10px] font-bold text-muted-foreground">{trend.month}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs mt-3.5">
                <span className="text-muted-foreground">Current Quarter Rate: 87%</span>
                <span className="text-emerald-600 flex items-center gap-1 font-bold">
                  <TrendingUp className="h-3.5 w-3.5" />
                  +2.3% gain
                </span>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="font-bold text-base text-foreground mb-4">Maternal Clinical Indicators</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60">
                <p className="text-3xl font-extrabold text-emerald-600">{mockData.analytics.healthMetrics.normalPregnancies}</p>
                <p className="text-xs text-emerald-900 dark:text-emerald-300 font-bold mt-1">Normal Pregnancies</p>
              </div>
              <div className="text-center p-4 bg-rose-50 dark:bg-rose-950/20 rounded-2xl border border-rose-200/60">
                <p className="text-3xl font-extrabold text-rose-600">{mockData.analytics.healthMetrics.highRiskPregnancies}</p>
                <p className="text-xs text-rose-900 dark:text-rose-300 font-bold mt-1">High-Risk Cases</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-200/60">
                <p className="text-3xl font-extrabold text-blue-600">92%</p>
                <p className="text-xs text-blue-900 dark:text-blue-300 font-bold mt-1">ANC Registration</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-2xl border border-purple-200/60">
                <p className="text-3xl font-extrabold text-purple-600">98%</p>
                <p className="text-xs text-purple-900 dark:text-purple-300 font-bold mt-1">Institutional Deliveries</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Geo-Mapping Tab */}
        <TabsContent value="mapping" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-bold text-base text-foreground mb-4">Coverage Geography</h3>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs py-2 border-b border-border/60">
                  <span className="text-muted-foreground font-medium">Assigned Sub-Centers</span>
                  <span className="font-extrabold text-foreground">{mockData.geoMapping.totalAreas}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2 border-b border-border/60">
                  <span className="text-rose-600 font-bold">Under-served Pockets</span>
                  <span className="font-extrabold text-rose-600">{mockData.geoMapping.underServedAreas}</span>
                </div>
                <div className="flex items-center justify-between text-xs py-2">
                  <span className="text-muted-foreground font-medium">Drive Coverage</span>
                  <span className="font-extrabold text-emerald-600">{mockData.geoMapping.campaignCoverage}%</span>
                </div>
              </div>
              <Button 
                className="w-full mt-6 rounded-xl cursor-pointer" 
                variant="outline"
                onClick={() => {
                  if (navigate) navigate('mapping');
                  else toast.info("Navigating to GIS Coverage Map");
                }}
              >
                <Map className="h-4 w-4 mr-2 text-primary" />
                View Full GIS Interactive Map
              </Button>
            </Card>

            <div className="lg:col-span-2">
              <Card className="p-6">
                <h3 className="font-bold text-base text-foreground mb-4">Active Field Campaigns</h3>
                <div className="space-y-3">
                  {mockData.geoMapping.recentCampaigns.map((campaign, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border border-border/60">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                          <Activity className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{campaign.name}</p>
                          <p className="text-[11px] text-muted-foreground">{campaign.areas} sub-center blocks active</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">
                        {campaign.coverage}% Done
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="space-y-6 focus-visible:outline-none">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-foreground">Recent Clinical Uploads</h3>
                <p className="text-xs text-muted-foreground">Synchronized with central health repository</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData} className="rounded-xl text-xs">
                <FileDown className="h-4 w-4 mr-1 text-primary" />
                Export
              </Button>
            </div>
            <div className="space-y-3">
              {mockData.recentRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3.5 border border-border/70 rounded-2xl hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3.5">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-bold text-xs text-foreground">{record.patient}</p>
                      <p className="text-[11px] text-muted-foreground">{record.type} • {record.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {record.status}
                    </Badge>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                      onClick={() => toast.info(`Viewing ${record.type} for ${record.patient}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg"
                      onClick={() => toast.success(`Downloaded ${record.type}`)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Simulated Call Modal */}
      <AnimatePresence>
        {callingPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-card rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Outbound Teleconsultation
                </span>
                <button 
                  onClick={() => setCallingPatient(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <Phone className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg text-foreground">{callingPatient.patient}</h4>
                <p className="text-sm text-primary font-mono mt-0.5">{callingPatient.phone}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Dialing via ABDM National Telemedicine Bridge...
                </p>
              </div>

              <div className="flex gap-2.5 mt-5">
                <Button 
                  variant="destructive" 
                  className="w-full rounded-xl font-semibold"
                  onClick={() => {
                    toast.error("Call ended");
                    setCallingPatient(null);
                  }}
                >
                  End Call
                </Button>
                <Button 
                  variant="default" 
                  className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 font-semibold"
                  onClick={() => {
                    toast.success("Call connected! Audio session started.");
                    setCallingPatient(null);
                  }}
                >
                  Connected
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated Priority Alerts Modal */}
      <AnimatePresence>
        {showAlertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-card rounded-3xl p-6 max-w-md w-full shadow-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-secondary" />
                  <h3 className="font-bold text-base text-foreground">Priority System Alerts (4)</h3>
                </div>
                <button 
                  onClick={() => setShowAlertModal(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                <div className="p-4 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-300">
                  <p className="font-bold text-sm">Severe Anemia Alert</p>
                  <p className="mt-1 leading-relaxed">Sunita Devi (RCH #4928) registered Hb at 7.2 g/dL. Requires urgent iron sucrose infusion.</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300">
                  <p className="font-bold text-sm">Vaccine Cold-Chain Warning</p>
                  <p className="mt-1 leading-relaxed">ILR Temperature at PHC Rampur reached 7.8°C (threshold 8°C). Technician dispatched.</p>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300">
                  <p className="font-bold text-sm">Indradhanush Drive Schedule</p>
                  <p className="mt-1 leading-relaxed">Special immunization drive in Block 4 scheduled for upcoming Monday.</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300">
                  <p className="font-bold text-sm">Sync Completed</p>
                  <p className="mt-1 leading-relaxed">All offline records from Ward 7 successfully synchronized to central RCH server.</p>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <Button 
                  onClick={() => setShowAlertModal(false)}
                  className="rounded-xl text-xs font-semibold"
                >
                  Dismiss Alerts
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dashboard;
