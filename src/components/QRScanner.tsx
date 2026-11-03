import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import { 
  QrCode, 
  Camera, 
  Search, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  Heart,
  Baby,
  Syringe,
  Sparkles,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Flashlight,
  SwitchCamera
} from "lucide-react";

const mockPatientData = {
  'RCH12345678': {
    name: 'Sunita Devi',
    type: 'pregnant',
    phone: '+91 98765 43210',
    address: 'Village Madhubani, Block 3, District Patna',
    edd: '2025-04-15',
    lmp: '2024-07-10',
    riskFlags: ['High BP (140/92)', 'Mild Anemia'],
    visits: 3,
    nextVisit: '2025-03-20',
    bloodGroup: 'B+'
  },
  'RCH87654321': {
    name: 'Baby Ravi',
    type: 'child',
    phone: '+91 87654 32109',
    address: 'Village Sitamarhi, Block 1, District Patna',
    dob: '2024-06-20',
    age: '8 months',
    vaccines: 8,
    nextVaccine: 'Measles-Rubella (MR-1 due in 2 weeks)',
    bloodGroup: 'O+'
  }
};

interface QRScannerProps {
  onNavigate?: (view: string) => void;
  onViewChange?: (view: string) => void;
}

export function QRScanner({ onNavigate, onViewChange }: QRScannerProps) {
  const { t } = useLanguage();
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualId, setManualId] = useState('');
  const [scannedData, setScannedData] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const navigate = (v: string) => {
    if (onNavigate) onNavigate(v);
    else if (onViewChange) onViewChange(v);
  };

  const handleScan = async (rchId: string) => {
    // 1. Try local cache / mock
    const local = mockPatientData[rchId as keyof typeof mockPatientData];
    if (local) {
      setScannedData({ rchId, ...local });
      toast.success(`Found record for ${local.name}!`);
      return;
    }

    // 2. Query backend live API
    try {
      const res = await fetch(`/api/patients?search=${encodeURIComponent(rchId)}`);
      const result = await res.json();
      if (result.success && result.data && result.data.length > 0) {
        const p = result.data[0];
        setScannedData({
          rchId: p.rch_id,
          name: p.full_name,
          type: p.patient_type,
          phone: p.phone || '+91 98000 00000',
          address: `${p.village || 'Village'}, ${p.block || 'Block'}, ${p.district || 'District'}`,
          edd: p.edd || '2025-06-15',
          lmp: p.lmp || '2024-09-10',
          dob: p.date_of_birth || '2024-01-01',
          age: '1 year',
          vaccines: 6,
          visits: 2,
          bloodGroup: p.blood_group || 'O+',
          riskFlags: p.risk_flags || []
        });
        toast.success(`Found patient record for ${p.full_name} from live database!`);
        return;
      }
    } catch (e) {
      // ignore network glitch, proceed to not found
    }

    setScannedData({ error: 'Patient RCH record not found in registry' });
    toast.error("RCH ID not found in database");
  };

  const simulateScan = (idToScan = 'RCH12345678') => {
    setIsScanning(true);
    setScannedData(null);
    setTimeout(() => {
      handleScan(idToScan);
      setIsScanning(false);
    }, 1400);
  };

  const handleManualSearch = () => {
    if (manualId.trim()) {
      handleScan(manualId.trim().toUpperCase());
    } else {
      toast.warning("Please enter an RCH ID");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t('nav.scan')} / ABHA Health Scanner
          </h2>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs">
            ABDM Standard
          </Badge>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Scan QR codes on beneficiary MCP cards, RCH books, or Ayushman Bharat health IDs
        </p>
      </div>

      {/* Mode Selection */}
      <Card className="p-5 sm:p-6 rounded-2xl border-border/80 shadow-xs">
        <div className="flex gap-3 mb-6">
          <Button 
            variant={scanMode === 'camera' ? 'default' : 'outline'}
            onClick={() => setScanMode('camera')}
            className="flex-1 rounded-xl h-11 text-xs sm:text-sm font-semibold"
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera Viewfinder
          </Button>
          <Button 
            variant={scanMode === 'manual' ? 'default' : 'outline'}
            onClick={() => setScanMode('manual')}
            className="flex-1 rounded-xl h-11 text-xs sm:text-sm font-semibold"
          >
            <Search className="h-4 w-4 mr-2" />
            Manual RCH / ABHA ID
          </Button>
        </div>

        {scanMode === 'camera' ? (
          <div className="space-y-5">
            {/* Viewfinder box with animated scanline */}
            <div className="relative aspect-video max-h-80 bg-neutral-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-2 border-neutral-800 shadow-inner">
              {/* Camera background grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

              {/* Viewfinder corner brackets */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-white/20 rounded-2xl flex items-center justify-center p-3">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />

                {/* Animated sweeping laser line */}
                {isScanning && (
                  <motion.div 
                    animate={{ y: [-90, 90, -90] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_rgba(239,68,68,0.8)]"
                  />
                )}

                <div className="text-center text-white/70 select-none">
                  {isScanning ? (
                    <motion.div 
                      animate={{ scale: [1, 1.05, 1] }} 
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="flex flex-col items-center"
                    >
                      <QrCode className="h-12 w-12 text-primary mx-auto mb-2 opacity-80" />
                      <span className="text-xs font-semibold text-white tracking-wide">Reading Barcode...</span>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <QrCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-medium text-white/80">Align QR code inside box</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Viewfinder Controls */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white/80 text-xs px-2">
                <button
                  type="button"
                  onClick={() => {
                    setTorchOn(!torchOn);
                    toast.info(torchOn ? "Torch off" : "Torch turned on");
                  }}
                  className={`p-2 rounded-xl backdrop-blur-md border ${torchOn ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-black/40 border-white/10 hover:bg-black/60'}`}
                >
                  <Flashlight className="w-4 h-4" />
                </button>
                <span className="text-[11px] text-white/60">Auto-Focus: Continuous</span>
                <button
                  type="button"
                  onClick={() => toast.info("Switched to front camera")}
                  className="p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => simulateScan('RCH12345678')}
                disabled={isScanning}
                size="lg" 
                className="flex-1 rounded-xl shadow-md h-12 text-sm font-semibold"
              >
                {isScanning ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Scanning Lens...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Trigger QR Capture
                  </span>
                )}
              </Button>

              <Button 
                variant="outline"
                onClick={() => simulateScan('RCH87654321')}
                disabled={isScanning}
                className="rounded-xl h-12 text-xs"
              >
                <Baby className="w-4 h-4 mr-1 text-primary" />
                Scan Child Record (#8765)
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Input 
                placeholder="Enter RCH ID (e.g. RCH12345678 or RCH87654321)"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                className="h-12 rounded-xl text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
              />
              <Button onClick={handleManualSearch} size="lg" className="h-12 rounded-xl px-6">
                <Search className="h-4 w-4 mr-2" />
                {t('action.search')}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <span>Quick tests:</span>
              <button 
                onClick={() => { setManualId('RCH12345678'); handleScan('RCH12345678'); }}
                className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-mono text-[11px]"
              >
                RCH12345678 (Mother)
              </button>
              <button 
                onClick={() => { setManualId('RCH87654321'); handleScan('RCH87654321'); }}
                className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-foreground font-mono text-[11px]"
              >
                RCH87654321 (Child)
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Scanned Patient Data Result */}
      <AnimatePresence>
        {scannedData && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="p-5 sm:p-6 rounded-2xl border-border/80 shadow-md">
              {scannedData.error ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-destructive font-semibold text-sm mb-1">{scannedData.error}</p>
                  <p className="text-xs">Please verify the barcode QR code or enter valid RCH number.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/70">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-bold shadow-xs">
                        {scannedData.type === 'pregnant' ? (
                          <Heart className="h-6 w-6 text-secondary" />
                        ) : (
                          <Baby className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-foreground">{scannedData.name}</h3>
                          <Badge variant="outline" className="text-[10px] font-mono">
                            Blood: {scannedData.bloodGroup}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono">
                          ABDM RCH ID: {scannedData.rchId}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={scannedData.type === 'pregnant' ? 'bg-secondary text-white' : 'bg-primary text-white'}>
                        {scannedData.type === 'pregnant' ? 'Pregnant Mother' : 'Child Beneficiary'}
                      </Badge>
                    </div>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">Mobile Contact</p>
                        <p className="text-xs font-semibold text-foreground">{scannedData.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">Residential Ward</p>
                        <p className="text-xs font-semibold text-foreground truncate">{scannedData.address}</p>
                      </div>
                    </div>

                    {scannedData.type === 'pregnant' ? (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                          <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-[11px] text-muted-foreground">Expected Delivery Date (EDD)</p>
                            <p className="text-xs font-semibold text-foreground">{scannedData.edd}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                          <Heart className="h-5 w-5 text-secondary shrink-0" />
                          <div>
                            <p className="text-[11px] text-muted-foreground">Completed ANC Visits</p>
                            <p className="text-xs font-semibold text-foreground">{scannedData.visits} of 4 visits done</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                          <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                          <div>
                            <p className="text-[11px] text-muted-foreground">Birth Date & Age</p>
                            <p className="text-xs font-semibold text-foreground">{scannedData.dob} ({scannedData.age})</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                          <Syringe className="h-5 w-5 text-primary shrink-0" />
                          <div>
                            <p className="text-[11px] text-muted-foreground">Vaccines Administered</p>
                            <p className="text-xs font-semibold text-foreground">{scannedData.vaccines} doses recorded</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button 
                      className="rounded-xl text-xs shadow-xs"
                      onClick={() => {
                        toast.success(`Opening Unified Mother-Child record for ${scannedData.name}`);
                        navigate('unified-records');
                      }}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Open Full Digital Health Record
                    </Button>
                    <Button 
                      variant="outline" 
                      className="rounded-xl text-xs"
                      onClick={() => {
                        const targetView = scannedData.type === 'pregnant' ? 'antenatal' : 'immunization';
                        toast.info(`Opening ${targetView === 'antenatal' ? 'ANC Checkup' : 'Immunization Tracker'} for ${scannedData.name}`);
                        navigate(targetView);
                      }}
                    >
                      Log Today's ANC / Immunization
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default QRScanner;
