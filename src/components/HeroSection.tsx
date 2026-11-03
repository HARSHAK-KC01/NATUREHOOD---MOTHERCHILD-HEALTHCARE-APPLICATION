import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./ui/image-with-fallback";
import { ShieldCheck, Calendar, HeartHandshake, Sparkles, Activity, Users, Baby, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

interface HeroSectionProps {
  onExplore?: () => void;
  onNavigate?: (view: string) => void;
  onViewChange?: (view: string) => void;
}

export function HeroSection({ onExplore, onNavigate, onViewChange }: HeroSectionProps) {
  const { t } = useLanguage();

  const handleExploreDashboard = () => {
    if (onExplore) {
      onExplore();
    } else if (onNavigate) {
      onNavigate('dashboard');
    } else if (onViewChange) {
      onViewChange('dashboard');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 280, damping: 22 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative bg-gradient-to-br from-primary/8 via-background to-accent/8 rounded-3xl p-5 sm:p-7 lg:p-9 mb-8 border border-border/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden"
    >
      {/* Decorative ambient background blur */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Banner with Frosted Glass Overlay */}
      <motion.div variants={itemVariants} className="relative rounded-3xl overflow-hidden shadow-xl border border-black/5">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1675124772801-c773d535c0fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGhjYXJlJTIwd29ya2VyJTIwdmFjY2luYXRpb24lMjBjaGlsZCUyMEluZGlhfGVufDF8fHx8MTc1OTU4NTc5MHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Healthcare worker administering vaccination to a child"
          className="w-full h-[400px] sm:h-[450px] lg:h-[500px] object-cover"
        />
        
        {/* Cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-950/25 flex items-center">
          <div className="container mx-auto px-6 lg:px-12 py-8">
            <div className="max-w-2xl space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
                <span>{t('hero.badge') || "Mission Indradhanush & ABDM 2.0 Compliant"}</span>
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="text-white text-3xl sm:text-5xl lg:text-5xl font-extrabold leading-[1.15] drop-shadow-md tracking-tight"
              >
                {t('hero.title') || "Protect Every Child with Timely Vaccination"}
              </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-white/90 text-sm sm:text-lg leading-relaxed max-w-xl font-normal drop-shadow-xs"
              >
                {t('hero.subtitle') || "Track, remind, and ensure no mother or child is left behind with Nurturehood Maternal & Child Healthcare Platform."}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="pt-3 flex flex-wrap gap-3"
              >
                <Button 
                  onClick={handleExploreDashboard}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 h-12 text-sm sm:text-base font-bold shadow-lg hover:shadow-primary/30 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <span>{t('hero.cta') || "Explore Dashboard"}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Highlight Statistics */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 350, damping: 15 }}
          className="bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-2xl p-5 text-center border border-border/70 shadow-xs hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-primary tracking-tight">2,847</p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">{t('stats.beneficiaries') || "Total Beneficiaries"}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 350, damping: 15 }}
          className="bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-2xl p-5 text-center border border-border/70 shadow-xs hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-2">
            <Activity className="w-5 h-5" />
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-accent tracking-tight">91%</p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">{t('stats.coverage') || "Coverage Rate"}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 350, damping: 15 }}
          className="bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-2xl p-5 text-center border border-border/70 shadow-xs hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mx-auto mb-2">
            <Baby className="w-5 h-5" />
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-secondary tracking-tight">156</p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">{t('stats.pregnancies') || "Active Pregnancies"}</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 350, damping: 15 }}
          className="bg-white/90 dark:bg-card/90 backdrop-blur-md rounded-2xl p-5 text-center border border-border/70 shadow-xs hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-amber-600 tracking-tight">12</p>
          <p className="text-xs font-semibold text-muted-foreground mt-1">{t('stats.workers') || "Field Workers"}</p>
        </motion.div>
      </motion.div>

      {/* Feature Pillar Highlights */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6 pt-6 border-t border-border/60">
        <div className="p-4 rounded-2xl bg-white/60 dark:bg-card/60 border border-border/50 text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary">
            <Baby className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1">{t('nav.antenatal') || "Antenatal Care"}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('hero.ancDesc') || "Complete pregnancy tracking, trimester vitals, and high-risk monitoring"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 dark:bg-card/60 border border-border/50 text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-accent">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1">{t('nav.immunization') || "Immunization Tracking"}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('hero.immDesc') || "National immunization schedule compliance, auto-reminders, and dose logs"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/60 dark:bg-card/60 border border-border/50 text-center">
          <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-3 text-secondary">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-foreground mb-1">{t('hero.offlineTitle') || "Offline Ready & Sync"}</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t('hero.offlineDesc') || "Works seamlessly in remote areas without internet; auto-syncs when online"}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default HeroSection;
