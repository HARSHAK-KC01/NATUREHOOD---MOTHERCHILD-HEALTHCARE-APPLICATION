import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { 
  Database as DatabaseIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Server, 
  ShieldCheck, 
  Layers, 
  Code2, 
  Terminal, 
  X,
  FileCode,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { isSupabaseConfigured, testSupabaseConnection, ConnectionTestResult, supabaseUrl } from "../lib/supabase";
import masterSchemaSql from "../../supabase/schema.sql?raw";

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupabaseSetupModal({ isOpen, onClose }: SupabaseSetupModalProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (isOpen) {
      handleTestConnection();
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await testSupabaseConnection();
      setTestResult(result);
      if (result.connected) {
        toast.success(result.message);
      } else {
        toast.info(result.message);
      }
    } finally {
      setTesting(false);
    }
  };

  const copySqlSchema = () => {
    navigator.clipboard.writeText(masterSchemaSql);
    toast.success("Master SQL Schema copied! Paste directly into Supabase SQL Editor and click Run.");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-card rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl border border-border max-h-[90vh] overflow-y-auto space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-border/70">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shadow-xs">
              <DatabaseIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-foreground">
                  Supabase Database & Backend
                </h3>
                <Badge variant={isConfigured ? "success" : "warning"} className="font-mono text-[10px]">
                  {isConfigured ? "CONFIGURED" : "DEMO / OFFLINE"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                PostgreSQL, Row Level Security, Auth & Realtime Sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Card */}
        <div className={`p-4 rounded-2xl border transition-all ${
          testResult?.connected 
            ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
            : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {testResult?.connected ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold text-xs sm:text-sm text-foreground">
                  {testResult?.connected ? "Live Connection Established" : "Running in Local Offline Fallback Mode"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {testResult?.message || "Checking backend status..."}
                </p>
                {testResult?.latencyMs !== undefined && (
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">
                    Database Ping: <span className="font-bold text-foreground">{testResult.latencyMs}ms</span> • Endpoint: <span className="truncate">{supabaseUrl}</span>
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing}
              className="rounded-xl h-8 text-xs font-semibold shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${testing ? 'animate-spin' : ''}`} />
              {testing ? "Testing..." : "Test Ping"}
            </Button>
          </div>
        </div>

        {/* Database Tables Overview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              Nurturehood Database Tables (schema.sql)
            </h4>
            <span className="text-[11px] text-muted-foreground">10 Public Tables with RLS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-bold text-foreground block">patients</span>
              <span className="text-[10px] text-muted-foreground">Mothers, children & RCH IDs</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-bold text-foreground block">pregnancies</span>
              <span className="text-[10px] text-muted-foreground">LMP, EDD & risk assessment</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-bold text-foreground block">anc_visits</span>
              <span className="text-[10px] text-muted-foreground">BP, weight, Hb, danger signs</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-bold text-foreground block">immunization_records</span>
              <span className="text-[10px] text-muted-foreground">Dose tracking & reminders</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-bold text-foreground block">vaccine_catalog</span>
              <span className="text-[10px] text-muted-foreground">Indradhanush schedule</span>
            </div>
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <span className="font-bold text-foreground block">hospital_network</span>
              <span className="text-[10px] text-muted-foreground">Beds, ICUs & facilities</span>
            </div>
          </div>
        </div>

        {/* Quick Setup Instructions */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
              How to Connect Your Supabase Cloud Database:
            </h4>
          </div>

          <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside leading-relaxed">
            <li>
              Log in to your free account at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-primary hover:underline font-bold inline-flex items-center gap-0.5">supabase.com <ExternalLink className="w-3 h-3" /></a> and create a new project.
            </li>
            <li>
              Go to the <strong>SQL Editor</strong> tab in your Supabase project dashboard.
            </li>
            <li>
              Run the full SQL script from <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[11px]">supabase/schema.sql</code>. It creates all tables, indexes, Row Level Security policies, and Indian healthcare seed records.
            </li>
            <li>
              Go to <strong>Project Settings → API</strong> in Supabase, copy your <strong>Project URL</strong> and <strong>anon public API key</strong> into your local <code className="px-1.5 py-0.5 rounded bg-muted text-foreground font-mono text-[11px]">.env</code> file:
              <div className="mt-2 p-3 rounded-xl bg-neutral-900 text-neutral-100 font-mono text-[11px] overflow-x-auto space-y-1">
                <div>VITE_SUPABASE_URL=https://your-project-id.supabase.co</div>
                <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...</div>
              </div>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileCode className="w-4 h-4 text-primary" />
            <span>Schema located at <strong className="text-foreground font-mono">supabase/schema.sql</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={copySqlSchema}
              className="rounded-xl flex-1 sm:flex-initial text-xs font-semibold bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/70"
            >
              <Copy className="w-3.5 h-3.5 mr-1.5" />
              Copy Master SQL (Ready to Run)
            </Button>
            <Button
              size="sm"
              onClick={onClose}
              className="rounded-xl flex-1 sm:flex-initial text-xs font-bold"
            >
              Done
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SupabaseSetupModal;
