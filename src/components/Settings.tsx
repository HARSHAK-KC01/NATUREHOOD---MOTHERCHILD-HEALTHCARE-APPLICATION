import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { useLanguage, LanguageCode } from "../context/LanguageContext";
import { toast } from "sonner";
import { 
  Settings as SettingsIcon, 
  Globe, 
  Eye, 
  Smartphone, 
  Shield, 
  Bell, 
  Download, 
  Upload, 
  Trash2, 
  UserCheck, 
  Moon, 
  Sun, 
  Palette, 
  Accessibility, 
  Volume2, 
  VolumeX, 
  Wifi, 
  WifiOff,
  CheckCircle2,
  RefreshCw,
  Database as DatabaseIcon,
  ExternalLink,
  HardDrive,
  Server,
  Activity
} from "lucide-react";
import { isSupabaseConfigured, testSupabaseConnection } from "../lib/supabase";
import { SupabaseSetupModal } from "./SupabaseSetupModal";

interface SettingsProps {
  currentUser?: {
    name?: string;
    role?: string;
    email?: string;
    area?: string;
  };
}

export function Settings({ currentUser }: SettingsProps = {}) {
  const { language, setLanguage, languages, t } = useLanguage();

  const user = {
    name: currentUser?.name || "Priya Sharma",
    role: currentUser?.role || "Field Worker (ANM)",
    email: currentUser?.email || "priya.sharma@health.gov.in",
    area: currentUser?.area || "Sub-Center Rampur (Sector 4)"
  };

  const [settings, setSettings] = useState({
    // Accessibility
    highContrast: false,
    largeFont: false,
    reducedMotion: false,
    screenReader: false,
    
    // Localization
    dateFormat: 'dd/mm/yyyy',
    
    // Notifications
    pushNotifications: true,
    smsReminders: true,
    whatsappUpdates: false,
    emailReports: true,
    
    // Offline & Sync
    offlineMode: true,
    autoSync: true,
    syncFrequency: '15min',
    
    // Privacy & Security
    biometricAuth: false,
    sessionTimeout: '30min',
    auditLogging: true,
    
    // App Preferences
    darkMode: document.documentElement.classList.contains('dark'),
    soundEffects: true,
    hapticFeedback: true,
    showTutorials: true
  });

  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    tested: boolean;
    success?: boolean;
    message?: string;
  }>({ tested: false });
  const isCloudConnected = isSupabaseConfigured();

  const handleTestSupabaseConnection = async () => {
    setTestingSupabase(true);
    const result = await testSupabaseConnection();
    setTestingSupabase(false);
    setSupabaseStatus({
      tested: true,
      success: result.success,
      message: result.message
    });
    if (result.success) {
      toast.success("Supabase Cloud Database connected and healthy!");
    } else {
      toast.warning(result.message);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.info(`Setting updated: ${key}`);

    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    const chosen = languages.find(l => l.code === newLang);
    toast.success(`Application language updated to ${chosen?.native || newLang}`);
  };

  const handleSaveAll = () => {
    toast.success("All settings and preferences saved successfully!");
  };

  const handleResetDefaults = () => {
    setLanguage('en');
    setSettings({
      highContrast: false,
      largeFont: false,
      reducedMotion: false,
      screenReader: false,
      dateFormat: 'dd/mm/yyyy',
      pushNotifications: true,
      smsReminders: true,
      whatsappUpdates: false,
      emailReports: true,
      offlineMode: true,
      autoSync: true,
      syncFrequency: '15min',
      biometricAuth: false,
      sessionTimeout: '30min',
      auditLogging: true,
      darkMode: false,
      soundEffects: true,
      hapticFeedback: true,
      showTutorials: true
    });
    document.documentElement.classList.remove('dark');
    toast.success("Settings restored to system defaults");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">{t('nav.settings')}</h2>
          <p className="text-xs sm:text-sm text-muted-foreground">Customize your Nurturehood workspace, preferences & language</p>
        </div>
        <Button onClick={handleSaveAll} className="rounded-xl shadow-xs">
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          {t('action.save')}
        </Button>
      </div>

      {/* User Profile */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/80 shadow-xs">
        <h3 className="font-semibold text-foreground mb-4">Profile Information</h3>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold text-xl">
            <UserCheck className="h-8 w-8" />
          </div>
          <div className="space-y-0.5">
            <p className="font-bold text-foreground text-base">{user.name}</p>
            <p className="text-xs font-medium text-primary">{user.role}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="sm:ml-auto">
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
              {user.area}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl text-xs"
            onClick={() => toast.info("Profile editor open")}
          >
            Edit Profile
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl text-xs"
            onClick={() => toast.info("Password change initiated")}
          >
            Change Password
          </Button>
        </div>
      </Card>

      {/* Language & Region */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/80 shadow-xs border-l-4 border-l-primary">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">Language & Regionalization (बहुभाषी)</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Switch the platform interface between national and regional Indian languages.
        </p>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Active Interface Language</Label>
            <Select 
              value={language} 
              onValueChange={(val: LanguageCode) => handleLanguageChange(val)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span className="font-semibold">{lang.native}</span>
                      <span className="text-muted-foreground text-xs">({lang.name})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Date Format</Label>
            <Select 
              value={settings.dateFormat} 
              onValueChange={(value) => updateSetting('dateFormat', value)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="dd/mm/yyyy">DD/MM/YYYY (Standard)</SelectItem>
                <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (ISO)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Accessibility Settings */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Accessibility className="h-5 w-5 text-accent" />
          <h3 className="font-semibold text-foreground">Accessibility</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">High Contrast Mode</Label>
              <p className="text-xs text-muted-foreground">Improve visibility with enhanced contrast ratio</p>
            </div>
            <Switch 
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting('highContrast', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">Large Font Size</Label>
              <p className="text-xs text-muted-foreground">Increase text scale for field readability</p>
            </div>
            <Switch 
              checked={settings.largeFont}
              onCheckedChange={(checked) => updateSetting('largeFont', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">Reduce Motion</Label>
              <p className="text-xs text-muted-foreground">Minimize decorative animations</p>
            </div>
            <Switch 
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">Screen Reader Support</Label>
              <p className="text-xs text-muted-foreground">Optimize ARIA attributes for TalkBack & VoiceOver</p>
            </div>
            <Switch 
              checked={settings.screenReader}
              onCheckedChange={(checked) => updateSetting('screenReader', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-secondary" />
          <h3 className="font-semibold text-foreground">Notifications & Reminders</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">Push Notifications</Label>
              <p className="text-xs text-muted-foreground">Immediate alerts on overdue vaccine visits</p>
            </div>
            <Switch 
              checked={settings.pushNotifications}
              onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">SMS Reminders</Label>
              <p className="text-xs text-muted-foreground">Automated beneficiary SMS via government gateway</p>
            </div>
            <Switch 
              checked={settings.smsReminders}
              onCheckedChange={(checked) => updateSetting('smsReminders', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">WhatsApp Updates</Label>
              <p className="text-xs text-muted-foreground">Health tips and appointment cards on WhatsApp</p>
            </div>
            <Switch 
              checked={settings.whatsappUpdates}
              onCheckedChange={(checked) => updateSetting('whatsappUpdates', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Offline & Sync */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          {settings.offlineMode ? <Wifi className="h-5 w-5 text-accent" /> : <WifiOff className="h-5 w-5 text-muted-foreground" />}
          <h3 className="font-semibold text-foreground">Offline & Central Synchronization</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">Offline First Cache</Label>
              <p className="text-xs text-muted-foreground">Cache entire ward beneficiary records locally</p>
            </div>
            <Switch 
              checked={settings.offlineMode}
              onCheckedChange={(checked) => updateSetting('offlineMode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">Automatic Cloud Sync</Label>
              <p className="text-xs text-muted-foreground">Background upload when WiFi or 4G is detected</p>
            </div>
            <Switch 
              checked={settings.autoSync}
              onCheckedChange={(checked) => updateSetting('autoSync', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Sync Frequency</Label>
            <Select 
              value={settings.syncFrequency} 
              onValueChange={(value) => updateSetting('syncFrequency', value)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="5min">Every 5 minutes</SelectItem>
                <SelectItem value="15min">Every 15 minutes (Recommended)</SelectItem>
                <SelectItem value="30min">Every 30 minutes</SelectItem>
                <SelectItem value="1hour">Every hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* App Preferences */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">App Preferences & Theme</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">Dark Theme</Label>
              <p className="text-xs text-muted-foreground">Dark UI for low-light clinical environments</p>
            </div>
            <Switch 
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSetting('darkMode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">Audio & Sound Cues</Label>
              <p className="text-xs text-muted-foreground">Audible feedback on QR scan and barcode reads</p>
            </div>
            <Switch 
              checked={settings.soundEffects}
              onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold">Haptic Feedback</Label>
              <p className="text-xs text-muted-foreground">Tactile response on button tap</p>
            </div>
            <Switch 
              checked={settings.hapticFeedback}
              onCheckedChange={(checked) => updateSetting('hapticFeedback', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Supabase Cloud Database & RCH 2.0 Backend */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/80 shadow-xs border-l-4 border-l-emerald-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <DatabaseIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">Supabase Cloud Database & RCH Backend</h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isCloudConnected 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {isCloudConnected ? 'Cloud Active' : 'Offline / Mock Engine'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                PostgreSQL schema with RLS, Mission Indradhanush catalog, and ABDM interoperability
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSupabaseModalOpen(true)}
            className="rounded-xl border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-medium self-start sm:self-auto"
          >
            <Server className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
            Database Setup & SQL Schema
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Connection State
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${isCloudConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs font-semibold text-foreground">
                {isCloudConnected ? 'Configured (.env)' : 'Offline Local Fallback'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Managed Tables
            </span>
            <div className="flex items-center gap-2 mt-1">
              <HardDrive className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground">10 RCH & ABDM Tables</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
              Data Security & Access
            </span>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-foreground">Row-Level Security (RLS)</span>
            </div>
          </div>
        </div>

        {supabaseStatus.tested && (
          <div className={`p-3 rounded-xl mb-4 text-xs font-medium flex items-center gap-2 ${
            supabaseStatus.success 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}>
            <Activity className="w-4 h-4 shrink-0" />
            <span>{supabaseStatus.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            size="sm"
            variant="outline"
            disabled={testingSupabase}
            onClick={handleTestSupabaseConnection}
            className="rounded-xl text-xs h-9"
          >
            <Activity className={`h-3.5 w-3.5 mr-1.5 ${testingSupabase ? 'animate-spin' : 'text-primary'}`} />
            {testingSupabase ? 'Pinging Cloud Database...' : 'Test Supabase Connectivity'}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsSupabaseModalOpen(true)}
            className="rounded-xl text-xs h-9 text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            View Migration SQL & Guide
          </Button>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/80 shadow-xs">
        <h3 className="font-semibold text-foreground mb-4">Data Management</h3>
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-xl text-xs"
            onClick={() => toast.success("Encrypted data backup file generated")}
          >
            <Download className="h-4 w-4 mr-2 text-primary" />
            Export My Ward Offline Data (Encrypted Backup)
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start rounded-xl text-xs"
            onClick={() => toast.info("Select backup file to import")}
          >
            <Upload className="h-4 w-4 mr-2 text-accent" />
            Import RCH Roster Data
          </Button>
          <Separator />
          <Button 
            variant="destructive" 
            className="w-full justify-start rounded-xl text-xs"
            onClick={() => toast.warning("Local temporary cache cleared")}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Temporary Cache
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button 
          className="flex-1 rounded-xl shadow-xs"
          onClick={handleSaveAll}
        >
          {t('action.save')}
        </Button>
        <Button 
          variant="outline"
          className="rounded-xl"
          onClick={handleResetDefaults}
        >
          Reset to Default
        </Button>
      </div>

      {/* Supabase Setup Modal */}
      <SupabaseSetupModal 
        open={isSupabaseModalOpen} 
        onOpenChange={setIsSupabaseModalOpen} 
      />
    </div>
  );
}

export default Settings;
