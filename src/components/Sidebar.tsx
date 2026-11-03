import { motion } from "framer-motion";
import { 
  Home, 
  Users, 
  Calendar, 
  Syringe, 
  Map, 
  BarChart3, 
  Settings,
  Baby,
  UserPlus,
  QrCode,
  MessageSquare,
  Link2,
  Clock,
  Send,
  FileText,
  Network,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { cn } from "./ui/utils";
import { useLanguage } from "../context/LanguageContext";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userRole: string;
  isOpen: boolean;
}

interface MenuItemDef {
  id: string;
  transKey: string;
  defaultLabel: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  section?: string;
}

const menuItemsConfig: Record<string, MenuItemDef[]> = {
  'Field Worker': [
    { id: 'dashboard', transKey: 'nav.dashboard', defaultLabel: 'Dashboard', icon: Home, section: 'Core' },
    { id: 'register', transKey: 'nav.register', defaultLabel: 'Register Patient', icon: UserPlus, section: 'Core' },
    { id: 'scan', transKey: 'nav.scan', defaultLabel: 'QR Scan', icon: QrCode, section: 'Core' },
    { id: 'visits', transKey: 'nav.visits', defaultLabel: 'My Visits', icon: Calendar, badge: '4', badgeColor: 'bg-primary/10 text-primary', section: 'Clinical Operations' },
    { id: 'antenatal', transKey: 'nav.antenatal', defaultLabel: 'Antenatal Care', icon: Baby, badge: 'High Risk', badgeColor: 'bg-destructive/10 text-destructive', section: 'Clinical Operations' },
    { id: 'immunization', transKey: 'nav.immunization', defaultLabel: 'Immunizations', icon: Syringe, badge: 'Due', badgeColor: 'bg-amber-500/10 text-amber-600', section: 'Clinical Operations' },
    { id: 'vaccination-timeline', transKey: 'nav.timeline', defaultLabel: 'Vaccination Timeline', icon: Clock, section: 'Clinical Operations' },
    { id: 'unified-records', transKey: 'nav.records', defaultLabel: 'Mother-Child Records', icon: Link2, section: 'Health Network' },
    { id: 'community', transKey: 'nav.community', defaultLabel: 'Community Wall', icon: MessageSquare, badge: 'New', badgeColor: 'bg-accent/10 text-accent', section: 'Health Network' },
    { id: 'referral-tracking', transKey: 'nav.referral', defaultLabel: 'Referral Tracking', icon: Send, section: 'Health Network' },
    { id: 'lab-tests', transKey: 'nav.labTests', defaultLabel: 'Lab Tests', icon: FileText, section: 'Health Network' },
  ],
  'Supervisor': [
    { id: 'dashboard', transKey: 'nav.dashboard', defaultLabel: 'Dashboard', icon: Home, section: 'Core' },
    { id: 'patients', transKey: 'nav.patients', defaultLabel: 'Patients', icon: Users, section: 'Core' },
    { id: 'visits', transKey: 'nav.visits', defaultLabel: 'Visits', icon: Calendar, section: 'Supervision' },
    { id: 'antenatal', transKey: 'nav.antenatal', defaultLabel: 'Antenatal Care', icon: Baby, section: 'Supervision' },
    { id: 'immunization', transKey: 'nav.immunization', defaultLabel: 'Immunizations', icon: Syringe, section: 'Supervision' },
    { id: 'vaccination-timeline', transKey: 'nav.timeline', defaultLabel: 'Vaccination Timeline', icon: Clock, section: 'Supervision' },
    { id: 'unified-records', transKey: 'nav.records', defaultLabel: 'Mother-Child Records', icon: Link2, section: 'Network' },
    { id: 'analytics', transKey: 'nav.analytics', defaultLabel: 'Analytics', icon: BarChart3, section: 'Network' },
    { id: 'mapping', transKey: 'nav.mapping', defaultLabel: 'Mapping', icon: Map, section: 'Network' },
    { id: 'community', transKey: 'nav.community', defaultLabel: 'Community Wall', icon: MessageSquare, section: 'Network' },
    { id: 'referral-tracking', transKey: 'nav.referral', defaultLabel: 'Referral Tracking', icon: Send, section: 'Network' },
    { id: 'lab-tests', transKey: 'nav.labTests', defaultLabel: 'Lab Tests', icon: FileText, section: 'Network' },
    { id: 'hospital-network', transKey: 'nav.hospital', defaultLabel: 'Hospital Network', icon: Network, section: 'Network' },
  ],
  'Admin': [
    { id: 'dashboard', transKey: 'nav.dashboard', defaultLabel: 'Dashboard', icon: Home, section: 'Core' },
    { id: 'patients', transKey: 'nav.patients', defaultLabel: 'Patients', icon: Users, section: 'Core' },
    { id: 'antenatal', transKey: 'nav.antenatal', defaultLabel: 'Antenatal Care', icon: Baby, section: 'Governance' },
    { id: 'analytics', transKey: 'nav.analytics', defaultLabel: 'Analytics', icon: BarChart3, section: 'Governance' },
    { id: 'mapping', transKey: 'nav.mapping', defaultLabel: 'Coverage Map', icon: Map, section: 'Governance' },
    { id: 'campaigns', transKey: 'nav.campaigns', defaultLabel: 'Campaigns', icon: Baby, section: 'Governance' },
    { id: 'vaccination-timeline', transKey: 'nav.timeline', defaultLabel: 'Vaccination Timeline', icon: Clock, section: 'Records' },
    { id: 'unified-records', transKey: 'nav.records', defaultLabel: 'Mother-Child Records', icon: Link2, section: 'Records' },
    { id: 'community', transKey: 'nav.community', defaultLabel: 'Community Wall', icon: MessageSquare, section: 'Network' },
    { id: 'referral-tracking', transKey: 'nav.referral', defaultLabel: 'Referral Tracking', icon: Send, section: 'Network' },
    { id: 'lab-tests', transKey: 'nav.labTests', defaultLabel: 'Lab Tests', icon: FileText, section: 'Network' },
    { id: 'hospital-network', transKey: 'nav.hospital', defaultLabel: 'Hospital Network', icon: Network, section: 'Network' },
    { id: 'settings', transKey: 'nav.settings', defaultLabel: 'Settings', icon: Settings, section: 'System' },
  ],
  'Parent': [
    { id: 'dashboard', transKey: 'nav.dashboard', defaultLabel: 'My Family', icon: Home, section: 'Family Health' },
    { id: 'antenatal', transKey: 'nav.antenatal', defaultLabel: 'Pregnancy Care', icon: Baby, section: 'Family Health' },
    { id: 'immunization', transKey: 'nav.immunization', defaultLabel: 'Immunizations', icon: Syringe, section: 'Family Health' },
    { id: 'vaccination-timeline', transKey: 'nav.timeline', defaultLabel: 'Vaccination Timeline', icon: Clock, section: 'Family Health' },
    { id: 'unified-records', transKey: 'nav.records', defaultLabel: 'Family Records', icon: Link2, section: 'History' },
    { id: 'visits', transKey: 'nav.visits', defaultLabel: 'Appointments', icon: Calendar, section: 'History' },
    { id: 'lab-tests', transKey: 'nav.labTests', defaultLabel: 'Lab Results', icon: FileText, section: 'History' },
  ]
};

export function Sidebar({ currentView, onViewChange, userRole, isOpen }: SidebarProps) {
  const { t } = useLanguage();
  const normalizedRole = userRole?.includes('Supervisor') 
    ? 'Supervisor' 
    : userRole?.includes('Admin') 
    ? 'Admin' 
    : userRole?.includes('Parent') 
    ? 'Parent' 
    : 'Field Worker';
  const items = menuItemsConfig[normalizedRole] || menuItemsConfig['Field Worker'];

  // Group items by section
  let currentSection = '';

  return (
    <aside className={cn(
      "bg-white dark:bg-card border-r border-border/70 transition-transform duration-300 ease-in-out",
      "lg:translate-x-0 lg:static lg:inset-0",
      isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
      "fixed inset-y-0 left-0 z-50 w-64 lg:w-64 flex flex-col justify-between"
    )}>
      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((item, idx) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const label = t(item.transKey) || item.defaultLabel;
          const showSection = item.section && item.section !== currentSection;
          if (showSection) {
            currentSection = item.section!;
          }

          return (
            <div key={item.id} className="space-y-1">
              {showSection && (
                <div className={`px-3 ${idx > 0 ? 'pt-4' : 'pt-1'} pb-1 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest`}>
                  {item.section}
                </div>
              )}

              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 text-left cursor-pointer",
                  isActive 
                    ? "text-primary font-bold shadow-2xs" 
                    : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    className="absolute inset-0 bg-primary/10 border border-primary/25 rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}

                <div className="flex items-center gap-2.5 truncate">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 shrink-0",
                    isActive ? "bg-primary text-white shadow-xs" : "bg-muted/70 text-muted-foreground group-hover:text-foreground"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="truncate">{label}</span>
                </div>

                {item.badge && (
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-tight ml-1 shrink-0 border border-transparent shadow-2xs",
                    item.badgeColor || "bg-muted text-muted-foreground"
                  )}>
                    {item.badge}
                  </span>
                )}
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Bottom Health Network Quick Status Card */}
      <div className="p-3 border-t border-border/70">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/5 via-accent/5 to-transparent border border-primary/15 shadow-2xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-foreground">
              ABDM Verified Network
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            256-bit HIPAA Encryption. Teleconsultation bridge live.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
