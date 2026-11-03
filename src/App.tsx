import React, { useState, Suspense, lazy, Component, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { LoginScreen } from "./components/LoginScreen";
import { Toaster } from "./components/ui/sonner";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { 
  Users, 
  Shield, 
  UserCheck, 
  Heart, 
  Sparkles, 
  Layers, 
  LogOut,
  ChevronRight
} from "lucide-react";

// Lazy load components with simplified imports
const Dashboard = lazy(() => import("./components/Dashboard"));
const RegisterPatient = lazy(() => import("./components/RegisterPatient"));
const ImmunizationTracker = lazy(() => import("./components/ImmunizationTracker"));
const QRScanner = lazy(() => import("./components/QRScanner"));
const MappingView = lazy(() => import("./components/MappingView"));
const Analytics = lazy(() => import("./components/Analytics"));
const Settings = lazy(() => import("./components/Settings"));
const AntenatalCare = lazy(() => import("./components/AntenatalCare"));
const VisitPlanning = lazy(() => import("./components/VisitPlanning"));
const HeroSection = lazy(() => import("./components/HeroSection"));

// Advanced healthcare modules
const CommunityWall = lazy(() => import("./components/CommunityWall"));
const UnifiedMotherChildRecord = lazy(() => import("./components/UnifiedMotherChildRecord"));
const VaccinationTimeline = lazy(() => import("./components/VaccinationTimeline"));
const ReferralChainTracking = lazy(() => import("./components/ReferralChainTracking"));
const LabTestManagement = lazy(() => import("./components/LabTestManagement"));
const HospitalNetworkConnectivity = lazy(() => import("./components/HospitalNetworkConnectivity"));

// User roles data
export const mockUsers = {
  fieldWorker: { name: "Priya Sharma", role: "Field Worker (ANM)", email: "priya.sharma@health.gov.in" },
  supervisor: { name: "Dr. Amit Kumar", role: "ANM Supervisor", email: "amit.kumar@health.gov.in" },
  admin: { name: "Rajesh Singh", role: "District Admin", email: "rajesh.singh@health.gov.in" },
  parent: { name: "Sunita Devi", role: "Parent", email: "sunita.devi@family.in" }
};

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback?: React.ReactNode; onReset?: () => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Component error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-card rounded-2xl border border-destructive/20 shadow-sm text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1 text-foreground">Something went wrong in this module</h3>
          <p className="text-xs text-muted-foreground mb-4 max-w-md">
            {this.state.error?.message || "An unexpected rendering error occurred."}
          </p>
          <button 
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              this.props.onReset?.();
            }}
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-sm"
          >
            Reset to Dashboard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading indicator
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart className="w-4 h-4 text-primary animate-pulse" />
        </div>
      </div>
      <span className="mt-3 text-xs font-medium text-muted-foreground animate-pulse">
        Loading module...
      </span>
    </div>
  );
}

function MainApp() {
  const { t } = useLanguage();
  const [currentUserKey, setCurrentUserKey] = useState<keyof typeof mockUsers>('fieldWorker');
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const currentUser = mockUsers[currentUserKey] || mockUsers.fieldWorker;

  useEffect(() => {
    // Preload essential views in the background
    const preload = async () => {
      try {
        import("./components/RegisterPatient");
        import("./components/ImmunizationTracker");
        import("./components/AntenatalCare");
      } catch (e) {
        // Ignore preload errors
      }
    };
    const timer = setTimeout(preload, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    setSidebarOpen(false);
  };

  const componentMap: Record<string, React.ComponentType<any>> = {
    dashboard: Dashboard,
    register: RegisterPatient,
    patients: RegisterPatient,
    immunization: ImmunizationTracker,
    scan: QRScanner,
    mapping: MappingView,
    analytics: Analytics,
    campaigns: Analytics,
    settings: Settings,
    visits: VisitPlanning,
    antenatal: AntenatalCare,
    hero: HeroSection,
    community: CommunityWall,
    'unified-records': UnifiedMotherChildRecord,
    'vaccination-timeline': VaccinationTimeline,
    'referral-tracking': ReferralChainTracking,
    'lab-tests': LabTestManagement,
    'hospital-network': HospitalNetworkConnectivity
  };

  const renderCurrentView = () => {
    const ComponentToRender = componentMap[currentView as keyof typeof componentMap] || componentMap.dashboard;
    
    const componentProps = {
      userRole: currentUser.role,
      currentUser,
      onNavigate: handleViewChange,
      onViewChange: handleViewChange,
      onExplore: () => setCurrentView('dashboard'),
    };

    return (
      <ErrorBoundary onReset={() => setCurrentView('dashboard')}>
        <Suspense fallback={<LoadingSpinner />}>
          <ComponentToRender {...componentProps} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="h-screen bg-background overflow-hidden flex flex-col text-foreground font-sans antialiased">
      <div className="flex h-full overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar 
          currentView={currentView}
          onViewChange={handleViewChange}
          userRole={currentUser?.role || 'Field Worker'}
          isOpen={sidebarOpen}
        />
        
        {/* Backdrop for Mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            currentUser={currentUser}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onNavigate={handleViewChange}
          />
          
          <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7">
            <div className="max-w-7xl mx-auto pb-16">
              {/* Framer motion page transition */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 10, scale: 0.995 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.995 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  {renderCurrentView()}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
      
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />
      
      {/* Interactive Quick Bar & Role Switcher */}
      <div className="fixed bottom-3 right-3 z-40 flex items-center gap-2">
        <AnimatePresence>
          {showRoleSwitcher && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="bg-white dark:bg-card p-3 rounded-2xl shadow-xl border border-border flex flex-col gap-1.5 min-w-[210px]"
            >
              <div className="text-[11px] font-semibold text-muted-foreground uppercase px-2 py-0.5 tracking-wider">
                Switch Role / Preview
              </div>
              
              {(Object.keys(mockUsers) as Array<keyof typeof mockUsers>).map((key) => {
                const user = mockUsers[key];
                const isActive = currentUserKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setCurrentUserKey(key);
                      setShowRoleSwitcher(false);
                    }}
                    className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                      isActive 
                        ? 'bg-primary text-white font-semibold' 
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <div>
                      <p className="leading-tight">{user.name}</p>
                      <p className={`text-[10px] ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>{user.role}</p>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white ml-2" />}
                  </button>
                );
              })}

              <div className="border-t border-border my-1" />

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setCurrentView('hero');
                    setShowRoleSwitcher(false);
                  }}
                  className="flex-1 px-2 py-1 text-[11px] rounded bg-muted hover:bg-muted/80 text-foreground font-medium text-center"
                >
                  Hero Showcase
                </button>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className="px-2 py-1 text-[11px] rounded bg-destructive/10 hover:bg-destructive/20 text-destructive font-medium flex items-center gap-1"
                  title="Sign out to Login screen"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
          className="bg-primary text-white px-3.5 py-2 rounded-xl shadow-lg hover:shadow-primary/30 flex items-center gap-2 text-xs font-semibold backdrop-blur-md border border-primary/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{(currentUser?.role || 'User').split(' ')[0]} Mode</span>
        </motion.button>
      </div>
    </div>
  );
}

function AppErrorRecovery() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white dark:bg-card rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-border space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Heart className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-foreground">Nurturehood Platform</h2>
        <p className="text-sm text-slate-600 dark:text-muted-foreground">
          Application loaded with offline resilience. Click below to load your clinical dashboard.
        </p>
        <button
          onClick={() => {
            try {
              localStorage.removeItem('nurturehood_current_view');
            } catch (e) {}
            window.location.reload();
          }}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md cursor-pointer"
        >
          Open Dashboard
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary fallback={<AppErrorRecovery />}>
      <LanguageProvider>
        <MainApp />
        <Toaster position="top-right" richColors />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
