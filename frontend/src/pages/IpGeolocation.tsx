import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import {
  Globe as GlobeIcon, Search, AlertTriangle, Crosshair, MapPin, Layers, XCircle,
  Copy, Check, Radio, Compass, Shield, Target,
  ArrowUpRight, Network, ChevronRight, ChevronLeft, Activity, ShieldCheck
} from 'lucide-react';
import { runGeolocation, getPublicIp } from '../services/api';
import type { GeolocationResponse, GeoResult } from '../types';
import PageTransition from '../components/PageTransition';
import CyberGlobe from '../components/CyberGlobe';

// Fix leaflet default icon asset paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Tactical Target Marker
const cyberIcon = L.divIcon({
  html: `
    <div class="cyber-target-marker">
      <div class="cyber-target-pulse"></div>
      <div class="cyber-target-ring"></div>
      <div class="cyber-target-crosshair"></div>
      <div class="cyber-target-center"></div>
    </div>
  `,
  className: '',
  iconSize: [50, 50],
  iconAnchor: [25, 25],
});

// Helper for Country Flag Emoji
function getCountryFlag(code?: string): string {
  if (!code || code.length !== 2) return '🌐';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// Map Controller for smooth flyTo
function MapController({
  center,
  zoom,
  recenterTrigger,
  isScanning,
  onZoomChange,
}: {
  center: [number, number] | null;
  zoom: number;
  recenterTrigger: number;
  isScanning: boolean;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();

  useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
    if (center && !isScanning) {
      map.flyTo(center, zoom, { duration: 2.2, easeLinearity: 0.15 });
    }
  }, [center, zoom, recenterTrigger, isScanning, map, onZoomChange]);
  return null;
}

// Live Mouse Coordinates Tracker
function MouseTracker({ onCoords }: { onCoords: (coords: { lat: number; lng: number } | null) => void }) {
  useMapEvents({
    mousemove(e) {
      onCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    mouseout() {
      onCoords(null);
    },
  });
  return null;
}

// Map Layer Theme Configs
type LayerTheme = 'satellite' | 'dark' | 'cyber' | 'street';

interface LayerConfig {
  id: LayerTheme;
  label: string;
  badge: string;
  baseTileUrl: string;
  overlayTileUrl?: string;
  attribution: string;
  maxZoom: number;
  className: string;
}

const LAYER_CONFIGS: Record<LayerTheme, LayerConfig> = {
  satellite: {
    id: 'satellite',
    label: 'Real Satellite',
    badge: 'PHOTOREAL',
    baseTileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    overlayTileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
    className: 'map-theme-satellite',
  },
  dark: {
    id: 'dark',
    label: 'Tactical Dark',
    badge: 'DEFENSE',
    baseTileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    overlayTileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin',
    maxZoom: 16,
    className: 'map-theme-dark',
  },
  cyber: {
    id: 'cyber',
    label: 'Cyber Matrix',
    badge: 'MATRIX',
    baseTileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    overlayTileUrl: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
    attribution: 'BlackEye Tactical HUD',
    maxZoom: 16,
    className: 'map-theme-cyber',
  },
  street: {
    id: 'street',
    label: 'Street Atlas',
    badge: 'OSM',
    baseTileUrl: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    className: 'map-theme-street',
  },
};

const getPrecisionZoom = (geoData: GeoResult) => {
  if (geoData.city) return 13;
  if (geoData.region) return 8;
  if (geoData.country) return 5;
  return 3;
};

const SCAN_STEPS = [
  'RESOLVING TARGET IP ROUTING...',
  'INTERCEPTING BGP & AUTONOMOUS SYSTEM...',
  'CROSS-REFERENCING MULTI-PROVIDER CONSENSUS...',
  'CALCULATING GEO-SPATIAL COORDINATES...',
  'TARGET LOCK ACQUIRED // CALIBRATING OPTICS'
];

export default function IpGeolocation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Inputs & Scanning State
  const [ip, setIp] = useState('');
  const [scanning, setScanning] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<GeolocationResponse | null>(null);
  const [error, setError] = useState('');

  // View & Layer States
  const [viewMode, setViewMode] = useState<'2D' | '3D'>('2D');
  const [activeLayer, setActiveLayer] = useState<LayerTheme>('satellite');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // HUD & Tactical Effects
  const [showReticle, setShowReticle] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showScanlines, setShowScanlines] = useState(true);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Coordinate Tracking
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);
  const [globeAltitude, setGlobeAltitude] = useState(10000);
  const [recenterTrigger, setRecenterTrigger] = useState(0);

  // Copy Feedback
  const [copiedIp, setCopiedIp] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Auto-scan from URL parameters (?target=... or ?detect=1)
  useEffect(() => {
    const targetParam = searchParams.get('target');
    if (targetParam) {
      setIp(targetParam);
      runScan(targetParam);
    } else if (searchParams.get('detect') === '1') {
      detectMyIp();
    }
  }, [searchParams]);

  const detectMyIp = async () => {
    setScanning(true);
    setResult(null);
    setError('');
    setStep(0);
    try {
      const res = await getPublicIp();
      const detected = res.data.data.ip;
      setIp(detected);
      toast.success(`Public IP Detected: ${detected}`);
      await runScan(detected);
    } catch {
      setError('Failed to detect public IP address.');
      setScanning(false);
    }
  };

  const runScan = async (target?: string) => {
    const ipToScan = (target ?? ip).trim();
    if (!ipToScan) {
      setError('Please enter a target IP address.');
      return;
    }

    setScanning(true);
    setResult(null);
    setError('');
    setStep(0);

    for (let i = 0; i < SCAN_STEPS.length - 1; i++) {
      setStep(i);
      await new Promise(r => setTimeout(r, 380));
    }

    try {
      const res = await runGeolocation(ipToScan);
      if (res.data.success) {
        setStep(SCAN_STEPS.length - 1);
        await new Promise(r => setTimeout(r, 350));

        const geo = res.data.normalized;
        if (geo.latitude && geo.longitude) {
          setMapCenter([geo.latitude, geo.longitude]);
          setMapZoom(getPrecisionZoom(geo));
          setRecenterTrigger(prev => prev + 1);
        }
        setResult(res.data);
      } else {
        setError(res.data.errors?.[0] || 'Geolocation reconnaissance failed.');
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Reconnaissance service unavailable.');
    }
    setScanning(false);
  };

  const handleRecenter = useCallback(() => {
    if (result?.normalized.latitude && result?.normalized.longitude) {
      setMapCenter([result.normalized.latitude, result.normalized.longitude]);
      setMapZoom(getPrecisionZoom(result.normalized));
      setRecenterTrigger(prev => prev + 1);
      toast.success('Camera recentered on target coordinates');
    }
  }, [result]);

  const handleCopyIp = () => {
    if (!result?.ip) return;
    navigator.clipboard.writeText(result.ip);
    setCopiedIp(true);
    toast.success('Target IP copied');
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleCopyCoords = () => {
    if (!result?.normalized.latitude || !result?.normalized.longitude) return;
    const coordStr = `${result.normalized.latitude.toFixed(6)}, ${result.normalized.longitude.toFixed(6)}`;
    navigator.clipboard.writeText(coordStr);
    setCopiedCoords(true);
    toast.success('Coordinates copied');
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  const handleCopyDossier = () => {
    if (!result) return;
    const dossier = `BLACKEYE RECONNAISSANCE DOSSIER
Target IP: ${result.ip}
Location: ${result.normalized.city || 'N/A'}, ${result.normalized.region || 'N/A'}, ${result.normalized.country || 'N/A'}
Coordinates: ${result.normalized.latitude ?? 'N/A'}, ${result.normalized.longitude ?? 'N/A'}
ISP: ${result.normalized.isp || 'N/A'}
Organization: ${result.normalized.org || 'N/A'}
ASN: ${result.normalized.asn || 'N/A'}
Timezone: ${result.normalized.timezone || 'N/A'}
Consensus Score: ${result.consistency_score || 'N/A'}`;
    navigator.clipboard.writeText(dossier);
    toast.success('Full intelligence dossier copied to clipboard');
  };

  // Zoom estimated altitude calculation
  const estimatedAltitude = useMemo(() => {
    const km = viewMode === '3D'
      ? globeAltitude
      : Math.round(40000 / Math.pow(2, mapZoom));
    return km > 1000 ? `${(km / 1000).toFixed(1)}k KM` : `${km} KM`;
  }, [globeAltitude, mapZoom, viewMode]);

  const currentLayer = LAYER_CONFIGS[activeLayer];

  return (
    <PageTransition>
      <div className="relative w-full overflow-hidden select-none bg-[#050907]" style={{ height: 'calc(100vh - 53px)' }}>

        {/* ══════════════════════════════════════════════════════
            BACKGROUND MAP & GLOBE CANVAS
        ══════════════════════════════════════════════════════ */}
        <div className={`absolute inset-0 z-0 ${currentLayer.className}`}>
          {viewMode === '3D' ? (
            <CyberGlobe
              targetLat={result?.normalized.latitude ?? null}
              targetLng={result?.normalized.longitude ?? null}
              targetIp={result?.ip ?? null}
              isScanning={scanning}
              onAltitudeChange={setGlobeAltitude}
            />
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              minZoom={2}
              maxZoom={currentLayer.maxZoom}
              maxBounds={[[-90, -180], [90, 180]]}
              maxBoundsViscosity={1.0}
              zoomControl={false}
              attributionControl={false}
              style={{ width: '100%', height: '100%', background: '#050a07' }}
            >
              {/* Base Map Tiles */}
              <TileLayer
                key={`${activeLayer}-base`}
                url={currentLayer.baseTileUrl}
                maxZoom={currentLayer.maxZoom}
                noWrap={true}
              />

              {/* Hybrid Labels & Boundaries Overlay (if available) */}
              {currentLayer.overlayTileUrl && (
                <TileLayer
                  key={`${activeLayer}-overlay`}
                  url={currentLayer.overlayTileUrl}
                  maxZoom={currentLayer.maxZoom}
                  noWrap={true}
                  opacity={0.85}
                />
              )}

              {/* Map Controller & Coordinate Tracker */}
              <MapController
                center={mapCenter}
                zoom={mapZoom}
                recenterTrigger={recenterTrigger}
                isScanning={scanning}
                onZoomChange={setMapZoom}
              />
              <MouseTracker onCoords={setMouseCoords} />

              {/* Target Marker & Tactical Radius Rings */}
              {result?.normalized.latitude && result?.normalized.longitude && !scanning && (
                <>
                  {/* Outer Reconnaissance Perimeter (75km) */}
                  <Circle
                    center={[result.normalized.latitude, result.normalized.longitude]}
                    radius={75000}
                    pathOptions={{
                      color: '#00d4ff',
                      fillColor: '#00d4ff',
                      fillOpacity: 0.04,
                      weight: 1.2,
                      dashArray: '6 6',
                    }}
                  />

                  {/* Inner Target Lock Perimeter (25km) */}
                  <Circle
                    center={[result.normalized.latitude, result.normalized.longitude]}
                    radius={25000}
                    pathOptions={{
                      color: '#ef4444',
                      fillColor: '#ef4444',
                      fillOpacity: 0.12,
                      weight: 1.8,
                    }}
                  />

                  {/* Tactical Crosshair Marker */}
                  <Marker
                    position={[result.normalized.latitude, result.normalized.longitude]}
                    icon={cyberIcon}
                  >
                    <Popup className="cyber-popup">
                      <div className="font-mono text-xs space-y-1.5 p-1">
                        <div className="flex items-center gap-1.5 text-[#ef4444] font-bold text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-ping" />
                          <span>TARGET ACQUIRED</span>
                        </div>
                        <div className="text-sm font-extrabold text-[#e2e8e4] tracking-wider">
                          {result.ip}
                        </div>
                        <div className="text-[11px] text-[#8fa799]">
                          {[result.normalized.city, result.normalized.region, result.normalized.country]
                            .filter(Boolean)
                            .join(', ')}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-[#1a2e23] text-[10px]">
                          <span className="text-[#00ff41] font-semibold">
                            {result.normalized.latitude.toFixed(4)}° N, {result.normalized.longitude.toFixed(4)}° W
                          </span>
                          <span className="text-[#00d4ff] font-bold">
                            {result.normalized.asn || 'ASN UNKNOWN'}
                          </span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}
            </MapContainer>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            TACTICAL HUD OVERLAYS (Grid, Scanlines, Brackets, Reticle)
        ══════════════════════════════════════════════════════ */}
        {showGrid && viewMode === '2D' && (
          <div className="absolute inset-0 tactical-grid-overlay pointer-events-none z-10 opacity-70" />
        )}
        {showScanlines && (
          <div className="absolute inset-0 tactical-crt-scanlines pointer-events-none z-10 opacity-30" />
        )}

        {/* Tactical Corner Targeting Brackets */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#00ff4170] pointer-events-none z-10" />
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#00ff4170] pointer-events-none z-10" />
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#00ff4170] pointer-events-none z-10" />
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#00ff4170] pointer-events-none z-10" />

        {/* Tactical Center Aiming Reticle (Toggleable) */}
        {showReticle && viewMode === '2D' && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center justify-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Outer compass degree ticks */}
              <div className="absolute inset-0 rounded-full border border-[#00ff4125]" />
              <div className="absolute inset-2 rounded-full border border-[#00d4ff20] border-dashed animate-spin-slow" style={{ animationDuration: '30s' }} />
              {/* Crosshair lines */}
              <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff4140] to-transparent" />
              <div className="absolute h-full w-[1px] bg-gradient-to-b from-transparent via-[#00ff4140] to-transparent" />
              {/* Cardinal labels */}
              <span className="absolute -top-3 font-mono text-[8px] text-[#00ff4160] font-bold">N</span>
              <span className="absolute -bottom-3 font-mono text-[8px] text-[#00ff4160] font-bold">S</span>
              <span className="absolute -left-3 font-mono text-[8px] text-[#00ff4160] font-bold">W</span>
              <span className="absolute -right-3 font-mono text-[8px] text-[#00ff4160] font-bold">E</span>
              {/* Center point */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#00ff4170]" />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            TOP FLOATING RECON SEARCH BAR & QUICK PRESETS
        ══════════════════════════════════════════════════════ */}
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-20">
          <form
            onSubmit={e => {
              e.preventDefault();
              runScan();
            }}
            className="rounded-2xl bg-[#060c08]/95 backdrop-blur-2xl border border-[#1d3b2a] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.65)] flex flex-col sm:flex-row items-stretch gap-2 focus-within:border-[#00ff4160] transition-all"
          >
            <div className="flex min-w-0 flex-1 items-center rounded-xl bg-[#09140d] border border-[#193526] px-2 focus-within:border-[#00ff4160] transition-colors">
              <div className="w-9 h-9 rounded-lg bg-[#0d2115] flex items-center justify-center text-[#00ff41] shrink-0">
              <Search size={16} />
              </div>
              <div className="flex-1 flex items-center px-2">
                <input
                  type="text"
                  value={ip}
                  onChange={e => {
                    setIp(e.target.value);
                    setError('');
                  }}
                  placeholder="Enter IPv4 / IPv6 address..."
                  className="w-full bg-transparent border-0 outline-none font-mono text-xs sm:text-sm text-[#e2e8e4] placeholder-[#4e6557] focus:ring-0 focus:outline-none"
                  disabled={scanning}
                />
                {ip && !scanning && (
                  <button
                    type="button"
                    onClick={() => setIp('')}
                    className="p-1 rounded-full text-[#6b7f74] hover:text-[#ef4444] transition-colors"
                    aria-label="Clear IP address"
                  >
                    <XCircle size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:w-[220px] shrink-0">
              <button
                type="button"
                onClick={detectMyIp}
                disabled={scanning}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#00d4ff40] bg-[#00d4ff0d] px-3 py-2.5 text-xs font-mono font-semibold text-[#00d4ff] transition-colors hover:border-[#00d4ff90] hover:bg-[#00d4ff18] disabled:opacity-40"
                title="Detect and scan my public IP"
              >
                <Radio size={12} />
                <span>MY IP</span>
              </button>

              <motion.button
                type="submit"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                disabled={scanning || !ip.trim()}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#00ff4160] bg-[#00ff4115] px-3 py-2.5 text-xs font-mono font-bold tracking-wide text-[#00ff41] transition-all hover:border-[#00ff41] hover:bg-[#00ff4125] disabled:opacity-40"
              >
                <span>{scanning ? 'SCANNING...' : 'SCAN IP'}</span>
                <ArrowUpRight size={14} />
              </motion.button>
            </div>
          </form>

          {/* Quick Target Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="font-mono text-[9px] text-[#6b7f74] uppercase tracking-wider">PRESETS:</span>
            {[
              { label: 'Cloudflare (104.21.58.14)', val: '104.21.58.14' },
              { label: 'Cloudflare DNS (1.1.1.1)', val: '1.1.1.1' },
              { label: 'Google DNS (8.8.8.8)', val: '8.8.8.8' },
              { label: 'Quad9 (9.9.9.9)', val: '9.9.9.9' },
            ].map(p => (
              <button
                key={p.val}
                type="button"
                onClick={() => {
                  setIp(p.val);
                  runScan(p.val);
                }}
                className="px-2 py-0.5 rounded-lg bg-[#070e0a]/80 hover:bg-[#0f1f15] text-[#8fa799] hover:text-[#00ff41] border border-[#16251d] font-mono text-[10px] transition-colors shadow-sm"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center justify-center gap-2 text-[#ef4444] font-mono text-xs bg-[#0b0e0c]/90 py-2 px-4 rounded-xl border border-[#ef444450] mx-auto w-max shadow-xl"
            >
              <AlertTriangle size={14} />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            SCANNING RADAR OVERLAY
        ══════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {scanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(5,9,7,0.5) 0%, rgba(5,9,7,0.88) 100%)' }}
            >
              <div className="p-8 rounded-2xl flex flex-col items-center border border-[#ef444450] bg-[#070e0a]/95 backdrop-blur-2xl shadow-[0_0_60px_rgba(239,68,68,0.25)]">
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-[#ef4444] ripple-anim" />
                  <div className="absolute inset-2 rounded-full border border-[#ef444460] animate-ping" style={{ animationDuration: '2s' }} />
                  <Crosshair size={32} className="text-[#ef4444] animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <div className="font-mono text-xs sm:text-sm text-[#ef4444] font-bold tracking-[0.25em] mb-2 text-center uppercase">
                  {SCAN_STEPS[step]}
                </div>
                <div className="flex gap-1.5 mt-3">
                  {SCAN_STEPS.map((_, i) => (
                    <div
                      key={i}
                      className={`w-9 h-1.5 rounded-full transition-all duration-300 ${
                        i <= step
                          ? 'bg-[#ef4444] shadow-[0_0_12px_rgba(239,68,68,0.9)]'
                          : 'bg-[#15231c]'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════════
            BOTTOM LEFT: TACTICAL TOOLBAR (Layers, 2D/3D, Recenter, HUD Toggles)
        ══════════════════════════════════════════════════════ */}
        <div className="absolute bottom-6 left-6 z-20 flex flex-wrap items-center gap-2">
          {/* 2D / 3D Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#060c08]/90 backdrop-blur-xl border border-[#16251d] p-1 rounded-xl shadow-2xl">
            <button
              onClick={() => setViewMode('2D')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                viewMode === '2D'
                  ? 'bg-[#00ff4118] text-[#00ff41] border border-[#00ff4140] shadow-[0_0_15px_rgba(0,255,65,0.2)]'
                  : 'text-[#6b7f74] hover:text-[#e2e8e4]'
              }`}
            >
              <Layers size={13} />
              <span>2D TACTICAL</span>
            </button>
            <button
              onClick={() => setViewMode('3D')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all ${
                viewMode === '3D'
                  ? 'bg-[#00d4ff18] text-[#00d4ff] border border-[#00d4ff40] shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                  : 'text-[#6b7f74] hover:text-[#e2e8e4]'
              }`}
            >
              <GlobeIcon size={13} />
              <span>3D GLOBE</span>
            </button>
          </div>

          {/* 2D Basemap Layer Switcher (Satellite, Dark, Cyber, Street) */}
          {viewMode === '2D' && (
            <div className="relative">
              <button
                onClick={() => setShowLayerMenu(!showLayerMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#060c08]/90 backdrop-blur-xl border border-[#16251d] text-[#e2e8e4] font-mono text-xs font-semibold hover:border-[#00ff4140] transition-colors shadow-2xl"
              >
                <Compass size={13} className="text-[#00ff41]" />
                <span>{currentLayer.label}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00ff4115] text-[#00ff41] border border-[#00ff4130]">
                  {currentLayer.badge}
                </span>
              </button>

              {/* Layer Selection Dropdown */}
              <AnimatePresence>
                {showLayerMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-2 left-0 w-56 rounded-2xl bg-[#060c08]/95 backdrop-blur-2xl border border-[#16251d] p-2 shadow-[0_15px_40px_rgba(0,0,0,0.9)] space-y-1 z-30"
                  >
                    <div className="px-2 py-1 font-mono text-[9px] text-[#6b7f74] font-bold uppercase tracking-wider">
                      Select Basemap Theme:
                    </div>
                    {(Object.keys(LAYER_CONFIGS) as LayerTheme[]).map(key => {
                      const cfg = LAYER_CONFIGS[key];
                      const isActive = activeLayer === key;
                      return (
                        <button
                          key={key}
                          onClick={() => {
                            setActiveLayer(key);
                            setShowLayerMenu(false);
                            toast.success(`Switched to ${cfg.label}`);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-mono text-xs transition-colors text-left ${
                            isActive
                              ? 'bg-[#00ff4118] text-[#00ff41] border border-[#00ff4130]'
                              : 'text-[#8fa799] hover:bg-[#0c1611] hover:text-[#e2e8e4]'
                          }`}
                        >
                          <span className="font-semibold">{cfg.label}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#050907] border border-[#1a2e23] text-[#6b7f74]">
                            {cfg.badge}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Quick Tactical Controls (Recenter, HUD Toggles) */}
          {viewMode === '2D' && (
            <div className="flex items-center gap-1 bg-[#060c08]/90 backdrop-blur-xl border border-[#16251d] p-1 rounded-xl shadow-2xl">
              {result && (
                <button
                  type="button"
                  onClick={handleRecenter}
                  title="Recenter on Target Coordinates"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[#ef4444] hover:bg-[#ef444415] border border-transparent hover:border-[#ef444430] font-mono text-xs transition-colors"
                >
                  <Target size={13} className="animate-spin-slow" />
                  <span className="hidden sm:inline">RECENTER</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowReticle(!showReticle)}
                title={showReticle ? 'Hide Aiming Reticle' : 'Show Aiming Reticle'}
                className={`p-1.5 rounded-lg font-mono text-xs transition-colors ${
                  showReticle ? 'text-[#00ff41] bg-[#00ff4115]' : 'text-[#6b7f74] hover:text-[#e2e8e4]'
                }`}
              >
                <Crosshair size={13} />
              </button>

              <button
                type="button"
                onClick={() => setShowGrid(!showGrid)}
                title={showGrid ? 'Hide Tactical Grid' : 'Show Tactical Grid'}
                className={`p-1.5 rounded-lg font-mono text-xs transition-colors ${
                  showGrid ? 'text-[#00d4ff] bg-[#00d4ff15]' : 'text-[#6b7f74] hover:text-[#e2e8e4]'
                }`}
              >
                <Activity size={13} />
              </button>

              <button
                type="button"
                onClick={() => setShowScanlines(!showScanlines)}
                title={showScanlines ? 'Disable CRT Scanlines' : 'Enable CRT Scanlines'}
                className={`p-1.5 rounded-lg font-mono text-xs transition-colors ${
                  showScanlines ? 'text-[#a855f7] bg-[#a855f715]' : 'text-[#6b7f74] hover:text-[#e2e8e4]'
                }`}
              >
                <Shield size={13} />
              </button>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
            BOTTOM CENTER / RIGHT: TELEMETRY COORDINATES STRIP
        ══════════════════════════════════════════════════════ */}
        <div className="hidden md:flex absolute bottom-6 right-6 z-20 items-center gap-4 bg-[#060c08]/90 backdrop-blur-xl border border-[#16251d] px-4 py-2 rounded-xl font-mono text-[11px] shadow-2xl text-[#8fa799]">
          {/* Cursor Coordinates */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#4d6356]">CURSOR:</span>
            <span className="text-[#00ff41] font-semibold">
              {mouseCoords
                ? `${mouseCoords.lat.toFixed(4)}° ${mouseCoords.lat >= 0 ? 'N' : 'S'}, ${Math.abs(mouseCoords.lng).toFixed(4)}° ${mouseCoords.lng >= 0 ? 'E' : 'W'}`
                : 'OFF MAP'}
            </span>
          </div>

          <div className="w-[1px] h-3.5 bg-[#16251d]" />

          {/* Target Coordinates */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#4d6356]">TARGET:</span>
            <span className="text-[#ef4444] font-semibold">
              {result?.normalized.latitude
                ? `${result.normalized.latitude.toFixed(4)}° N, ${result.normalized.longitude?.toFixed(4)}° W`
                : 'NO LOCK'}
            </span>
          </div>

          <div className="w-[1px] h-3.5 bg-[#16251d]" />

          {/* Altitude Estimate */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#4d6356]">ALTITUDE:</span>
            <span className="text-[#00d4ff] font-semibold">{estimatedAltitude}</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            RIGHT: FLOATING TARGET INTELLIGENCE DOSSIER
        ══════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {result && !scanning && (
            <motion.div
              initial={{ x: 120, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 120, opacity: 0 }}
              transition={{ type: 'spring', damping: 22, stiffness: 120 }}
              className="absolute top-24 right-4 sm:right-6 z-20 w-[340px] sm:w-[380px] max-h-[calc(100vh-140px)] flex flex-col rounded-2xl bg-[#060c08]/95 backdrop-blur-2xl border border-[#00ff4140] shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_30px_rgba(0,255,65,0.1)] overflow-hidden"
            >
              {/* Dossier Tactical Header */}
              <div className="px-4 py-3 bg-[#040806] border-b border-[#16251d] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
                  <span className="font-mono text-xs font-bold text-[#e2e8e4] tracking-widest uppercase">
                    TARGET RECON DOSSIER
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-[#ef4444] border border-[#ef444440] bg-[#ef444415] px-2 py-0.5 rounded-md font-bold tracking-wider">
                    TARGET LOCKED
                  </span>
                  <button
                    onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                    className="p-1 rounded text-[#8fa799] hover:text-[#00ff41] transition-colors"
                    title={isPanelCollapsed ? 'Expand Intel Dossier' : 'Collapse Intel Dossier'}
                  >
                    {isPanelCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              </div>

              {!isPanelCollapsed && (
                <div className="overflow-y-auto p-4 space-y-4 font-mono text-xs select-text">
                  {/* IP Card & Country Flag Banner */}
                  <div className="p-3.5 rounded-xl bg-[#09120d] border border-[#16251d] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#6b7f74] font-semibold uppercase tracking-wider">
                        SURVEILLANCE IP
                      </div>
                      <div className="text-xl font-black text-[#ef4444] tracking-tight mt-0.5 flex items-center gap-2 drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                        <span>{result.ip}</span>
                        <button
                          onClick={handleCopyIp}
                          title="Copy Target IP"
                          className="p-1 rounded text-[#8fa799] hover:text-[#00ff41] transition-colors"
                        >
                          {copiedIp ? <Check size={14} className="text-[#00ff41]" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl select-none" title={result.normalized.country}>
                        {getCountryFlag(result.normalized.country_code)}
                      </div>
                      <div className="text-[10px] text-[#8fa799] font-bold mt-0.5">
                        {result.normalized.country_code || 'GEO'}
                      </div>
                    </div>
                  </div>

                  {/* Geographic Coordinates Card */}
                  <div className="p-3.5 rounded-xl bg-[#09120d] border border-[#16251d] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#00ff41]">
                        <MapPin size={14} />
                        <span className="font-bold text-[11px] tracking-wider text-[#e2e8e4]">
                          LOCATION DETAILS
                        </span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00ff4115] text-[#00ff41] border border-[#00ff4130] font-bold">
                        {result.consistency_score || 'HIGH'} CONSENSUS
                      </span>
                    </div>

                    <div className="text-sm font-bold text-[#e2e8e4]">
                      {[result.normalized.city, result.normalized.region, result.normalized.country]
                        .filter(Boolean)
                        .join(', ') || 'Unknown Location'}
                    </div>

                    {/* Coordinates Grid with One-Click Copy */}
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#050a07] border border-[#16251d]">
                      <div className="space-y-0.5">
                        <div className="text-[10px] text-[#6b7f74]">GPS COORDINATES:</div>
                        <div className="text-xs text-[#00d4ff] font-bold">
                          {result.normalized.latitude?.toFixed(5) ?? 'N/A'}° N,{' '}
                          {result.normalized.longitude?.toFixed(5) ?? 'N/A'}° W
                        </div>
                      </div>
                      <button
                        onClick={handleCopyCoords}
                        title="Copy GPS Coordinates"
                        className="flex items-center gap-1 px-2 py-1 rounded bg-[#0e1b14] hover:bg-[#162c20] text-[#00ff41] border border-[#1e3c2b] text-[10px] font-semibold transition-colors"
                      >
                        {copiedCoords ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedCoords ? 'COPIED' : 'COPY'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Network Infrastructure Telemetry */}
                  <div className="p-3.5 rounded-xl bg-[#09120d] border border-[#16251d] space-y-2.5">
                    <div className="flex items-center gap-1.5 text-[#00d4ff]">
                      <Network size={14} />
                      <span className="font-bold text-[11px] tracking-wider text-[#e2e8e4]">
                        AUTONOMOUS ROUTING
                      </span>
                    </div>

                    <div className="space-y-2 text-[11px]">
                      <div className="flex justify-between items-center">
                        <span className="text-[#6b7f74]">ISP PROVIDER:</span>
                        <span className="text-[#e2e8e4] font-semibold text-right truncate max-w-[200px]" title={result.normalized.isp}>
                          {result.normalized.isp || 'Cloudflare Network'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6b7f74]">ORGANIZATION:</span>
                        <span className="text-[#e2e8e4] font-semibold text-right truncate max-w-[200px]" title={result.normalized.org}>
                          {result.normalized.org || result.normalized.isp || 'Anycast Infrastructure'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6b7f74]">ASN CODE:</span>
                        <button
                          onClick={() => navigate(`/network?target=${encodeURIComponent(result.ip)}`)}
                          className="text-[#00d4ff] hover:text-white font-bold flex items-center gap-1 hover:underline"
                          title="Pivot to Network Intel for BGP routing inspection"
                        >
                          <span>{result.normalized.asn || 'AS13335'}</span>
                          <ArrowUpRight size={11} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#6b7f74]">TIMEZONE:</span>
                        <span className="text-[#a855f7] font-semibold">
                          {result.normalized.timezone || 'UTC'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Threat & Anonymization Audit Badges */}
                  <div className="p-3 rounded-xl bg-[#09120d] border border-[#16251d] space-y-2">
                    <div className="flex items-center gap-1.5 text-[#f59e0b]">
                      <ShieldCheck size={14} />
                      <span className="font-bold text-[10px] tracking-wider text-[#e2e8e4] uppercase">
                        THREAT AUDIT FLAGS
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-1.5 rounded-lg bg-[#050907] border border-[#16251d] text-center">
                        <div className="text-[9px] text-[#6b7f74]">VPN</div>
                        <div className="text-[10px] font-bold text-[#00ff41]">
                          {result.normalized.is_vpn ? 'DETECTED' : 'CLEAN'}
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#050907] border border-[#16251d] text-center">
                        <div className="text-[9px] text-[#6b7f74]">TOR EXIT</div>
                        <div className="text-[10px] font-bold text-[#00ff41]">
                          {result.normalized.is_tor ? 'FLAGGED' : 'CLEAN'}
                        </div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-[#050907] border border-[#16251d] text-center">
                        <div className="text-[9px] text-[#6b7f74]">DATACENTER</div>
                        <div className="text-[10px] font-bold text-[#00d4ff]">
                          {result.normalized.is_hosting ?? true ? 'YES' : 'RESIDENTIAL'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tactical Pivot Action Buttons */}
                  <div className="pt-1 flex flex-col gap-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => navigate(`/network?target=${encodeURIComponent(result.ip)}`)}
                        className="px-3 py-2 rounded-xl bg-[#0e1f16] hover:bg-[#142e20] text-[#00ff41] border border-[#1e442d] font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                      >
                        <Network size={12} />
                        <span>BGP ROUTES</span>
                      </button>
                      <button
                        onClick={() => navigate(`/domain?domain=${encodeURIComponent(result.normalized.domain || result.ip)}`)}
                        className="px-3 py-2 rounded-xl bg-[#0e1a22] hover:bg-[#142633] text-[#00d4ff] border border-[#1e3b50] font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                      >
                        <ShieldCheck size={12} />
                        <span>DOMAIN AUDIT</span>
                      </button>
                    </div>

                    <button
                      onClick={handleCopyDossier}
                      className="w-full py-2 rounded-xl bg-[#0d1510] hover:bg-[#132219] text-[#8fa799] hover:text-[#e2e8e4] border border-[#1a2e23] font-semibold text-[10px] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Copy size={12} />
                      <span>COPY INTEL DOSSIER</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}
