import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";
import { 
  Heart, 
  Eye, 
  EyeOff, 
  Shield, 
  Smartphone,
  AlertTriangle,
  Users,
  UserCheck,
  Baby,
  Globe,
  Sparkles,
  ArrowRight,
  Stethoscope
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage, LanguageCode } from "../context/LanguageContext";

interface LoginScreenProps {
  onLogin: (user: any) => void;
}

export const demoUsers = {
  fieldWorker: { 
    name: "Priya Sharma", 
    role: "Field Worker (ANM)", 
    email: "priya.sharma@health.gov.in",
    area: "Village Madhubani, Block 3",
    permissions: ["register_patients", "record_visits", "scan_qr", "record_immunizations"]
  },
  supervisor: { 
    name: "Dr. Amit Kumar", 
    role: "ANM Supervisor", 
    email: "amit.kumar@health.gov.in",
    area: "Block 3, Madhubani District",
    permissions: ["view_analytics", "approve_referrals", "manage_workers", "export_reports"]
  },
  admin: { 
    name: "Rajesh Singh", 
    role: "District Admin", 
    email: "rajesh.singh@health.gov.in",
    area: "Madhubani District",
    permissions: ["full_access", "user_management", "system_settings", "audit_logs"]
  },
  parent: { 
    name: "Sunita Devi", 
    role: "Parent", 
    email: "sunita.devi@family.in",
    area: "Village Madhubani",
    permissions: ["view_family", "view_immunizations", "view_appointments"]
  }
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { language, setLanguage, languages, t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<keyof typeof demoUsers>("fieldWorker");
  const [remember, setRemember] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulated auth delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = demoUsers[selectedRole];
    toast.success(`Welcome, ${user.name}! Authenticated as ${user.role}`);
    onLogin(user);
    setIsLoading(false);
  };

  const handleQuickLogin = (role: keyof typeof demoUsers) => {
    const user = demoUsers[role];
    toast.success(`Fast-track login as ${user.name}`);
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative ambient blobs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Language Bar */}
      <div className="absolute top-4 right-4 z-20">
        <div className="flex items-center gap-2 bg-white/80 dark:bg-card/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-border shadow-xs">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
          >
            {languages.map((l) => (
              <option key={l.code} value={l.code} className="bg-card text-foreground">
                {l.flag} {l.native} ({l.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-5 my-8 z-10"
      >
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-16 h-16 bg-gradient-to-tr from-primary to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/25 text-white"
          >
            <Heart className="h-8 w-8 fill-white/20" />
          </motion.div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t('app.title')}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              {t('app.tagline')}
            </p>
          </div>
        </div>

        {/* Quick Role Selection Cards */}
        <Card className="p-4 rounded-2xl border-border/80 shadow-xs bg-white/80 dark:bg-card/80 backdrop-blur-md">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 px-1">
            Instant 1-Click Role Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleQuickLogin('fieldWorker')}
              className="p-2.5 rounded-xl border border-border hover:border-primary/40 bg-muted/30 hover:bg-primary/5 text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-0.5">
                <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate">ANM Worker</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">Priya Sharma</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleQuickLogin('supervisor')}
              className="p-2.5 rounded-xl border border-border hover:border-accent/40 bg-muted/30 hover:bg-accent/5 text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-0.5">
                <Stethoscope className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="truncate">Supervisor</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">Dr. Amit Kumar</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="p-2.5 rounded-xl border border-border hover:border-amber-400 bg-muted/30 hover:bg-amber-500/5 text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-0.5">
                <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">District Admin</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">Rajesh Singh</p>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleQuickLogin('parent')}
              className="p-2.5 rounded-xl border border-border hover:border-secondary/40 bg-muted/30 hover:bg-secondary/5 text-left transition-all"
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-0.5">
                <Baby className="w-3.5 h-3.5 text-secondary shrink-0" />
                <span className="truncate">Parent Portal</span>
              </div>
              <p className="text-[10px] text-muted-foreground truncate">Sunita Devi</p>
            </motion.button>
          </div>
        </Card>

        {/* Credentials Form */}
        <Card className="p-5 sm:p-6 rounded-2xl border-border/80 shadow-md bg-white dark:bg-card space-y-4">
          <div className="text-center pb-1">
            <h2 className="text-lg font-bold text-foreground">Sign In to Account</h2>
            <p className="text-xs text-muted-foreground">National Health Registry Authorization</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">Registered Health ID / Email</Label>
              <Input
                id="email"
                type="email"
                value={email || demoUsers[selectedRole].email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-xl text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold">Security PIN / Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password || "••••••••"}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl text-xs sm:text-sm pr-10"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-11 px-3 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Target Role</Label>
              <Select 
                value={selectedRole} 
                onValueChange={(val: keyof typeof demoUsers) => setSelectedRole(val)}
              >
                <SelectTrigger className="h-11 rounded-xl text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="fieldWorker">Field Worker (ANM / ASHA)</SelectItem>
                  <SelectItem value="supervisor">Medical Officer (Supervisor)</SelectItem>
                  <SelectItem value="admin">District Health Administrator</SelectItem>
                  <SelectItem value="parent">Parent / Mother Caregiver</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox 
                  id="remember" 
                  checked={remember}
                  onCheckedChange={(c) => setRemember(!!c)}
                />
                <span className="text-muted-foreground">Keep me signed in</span>
              </label>
              <button 
                type="button"
                onClick={() => toast.info("OTP verification triggered to registered mobile")}
                className="text-primary hover:underline font-medium"
              >
                Forgot PIN?
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : (
                <span className="flex items-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </Card>

        {/* Footer info */}
        <p className="text-center text-[11px] text-muted-foreground">
          ABDM HIPAA-Compliant • 256-bit Encrypted Healthcare Vault
        </p>
      </motion.div>
    </div>
  );
}

export default LoginScreen;
