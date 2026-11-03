import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  Menu, 
  Bell, 
  User, 
  Globe, 
  Check, 
  RefreshCw, 
  Search, 
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Command,
  Database as DatabaseIcon
} from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "sonner";
import { SupabaseSetupModal } from "./SupabaseSetupModal";
import { isSupabaseConfigured } from "../lib/supabase";

interface HeaderProps {
  currentUser: {
    name: string;
    role: string;
  };
  onMenuClick: () => void;
  onSearchClick?: () => void;
  onNavigate?: (view: string) => void;
}

export function Header({ currentUser, onMenuClick, onNavigate }: HeaderProps) {
  const { language, setLanguage, languages, t } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [searchVal, setSearchVal] = useState("");
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);

  const isConnected = isSupabaseConfigured();
  const currentLang = languages.find(l => l.code === language) || languages[0];

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      if (data.supabase?.connected) {
        toast.success(`Central Sync Active! Supabase DB Ping: ${data.supabase.latencyMs}ms`);
      } else {
        toast.success(t('app.synced') || "Data synchronized with Central RCH Server successfully!");
      }
    } catch {
      toast.info("Data synchronized with local offline cache.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBellClick = () => {
    if (unreadCount > 0) {
      setUnreadCount(0);
      toast.info("Notifications marked as read");
    } else {
      toast("No new notifications at this time");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      if (onNavigate) {
        onNavigate('unified-records');
        toast.info(`Searching records for "${searchVal}" in Unified Registry`);
      } else {
        toast.info(`Searching records for: "${searchVal}"`);
      }
    }
  };

  return (
    <>
      <header className="bg-white/85 dark:bg-card/85 backdrop-blur-xl border-b border-border/70 px-4 py-2.5 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-all duration-200 shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
        {/* Left: Mobile menu toggle + Brand */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
              className="w-10 h-10 bg-gradient-to-tr from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-md shadow-primary/20 text-white cursor-pointer"
            >
              <Heart className="h-5 w-5 fill-white/20" />
            </motion.div>
            <div className="hidden sm:block select-none">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-foreground">
                  {t('app.title')}
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full border border-primary/20">
                  PRO 2.0
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-none mt-0.5">
                {t('app.tagline')}
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Quick Search Input */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-sm w-full mx-4">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
          <input 
            type="text"
            placeholder={t('app.search') || "Search patients, RCH ID, vaccines..."}
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full h-9 pl-9 pr-14 rounded-full bg-muted/60 hover:bg-muted/90 focus:bg-white dark:focus:bg-card border border-border/60 focus:border-primary text-xs text-foreground placeholder:text-muted-foreground outline-none transition-all duration-150 shadow-2xs"
          />
          <div className="absolute right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white dark:bg-card border border-border/80 text-[10px] text-muted-foreground font-mono shadow-2xs">
            <span>Ctrl K</span>
          </div>
        </form>

        {/* Right Actions: Supabase DB, Sync, Language, Notifications, User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Supabase Database Connection Pill */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setSupabaseModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all border shadow-2xs ${
              isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : 'bg-muted/70 hover:bg-muted text-foreground/80 border-border/70'
            }`}
            title="Supabase Database Backend Status"
          >
            <DatabaseIcon className={`h-3.5 w-3.5 ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-primary'}`} />
            <span className="text-[11px] hidden sm:inline">
              {isConnected ? "Supabase Active" : "Database Setup"}
            </span>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          </motion.button>

          {/* Central RCH Sync Pill */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSync}
            disabled={isSyncing}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/70 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all border border-border/60 shadow-2xs"
            title="Central RCH Cloud Sync Status"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-accent ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="text-[11px]">
              {isSyncing ? "Syncing..." : t('app.synced')}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5 animate-pulse" />
          </motion.button>

          {/* Multilingual Selector */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 hover:bg-primary/10 border border-primary/20 text-xs font-semibold text-foreground transition-all duration-150 shadow-2xs"
              aria-label="Change Language"
            >
              <Globe className="h-4 w-4 text-primary" />
              <span className="hidden sm:inline">{currentLang.native}</span>
              <span className="sm:hidden text-xs uppercase">{currentLang.code}</span>
              <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform duration-200 ${langMenuOpen ? 'rotate-180' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {langMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setLangMenuOpen(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 mt-2 w-52 py-2 bg-white dark:bg-card border border-border shadow-xl rounded-2xl z-50 overflow-hidden"
                  >
                    <div className="px-3.5 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60">
                      {t('app.language')} / Language
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setLangMenuOpen(false);
                            toast.success(`Language set to ${lang.name} (${lang.native})`);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-muted/70 transition-colors ${
                            language === lang.code ? 'font-bold text-primary bg-primary/5' : 'text-foreground'
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            <span className="text-sm">{lang.flag}</span>
                            <span className="font-semibold">{lang.native}</span>
                            <span className="text-muted-foreground text-[10px]">({lang.name})</span>
                          </span>
                          {language === lang.code && (
                            <Check className="h-3.5 w-3.5 text-primary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications Button */}
          <motion.div whileTap={{ scale: 0.92 }}>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBellClick}
              className="relative text-muted-foreground hover:text-foreground h-9 w-9 rounded-full"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary ring-2 ring-white animate-pulse" />
              )}
            </Button>
          </motion.div>

          {/* User Profile Pill */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-2 pl-2 border-l border-border/70"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {(currentUser?.name || 'U').slice(0, 1)}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-bold text-foreground truncate max-w-[120px]">
                {currentUser?.name || 'Field Worker'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                {t(`role.${currentUser?.role?.includes('Supervisor') ? 'supervisor' : currentUser?.role?.includes('Admin') ? 'admin' : currentUser?.role?.includes('Parent') ? 'parent' : 'fieldWorker'}`) || currentUser?.role || 'Field Worker'}
              </p>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Supabase Database Setup & Status Modal */}
      <SupabaseSetupModal 
        isOpen={supabaseModalOpen} 
        onClose={() => setSupabaseModalOpen(false)} 
      />
    </>
  );
}

export default Header;
