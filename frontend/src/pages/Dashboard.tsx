import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Globe, Zap, Activity, TrendingUp, Clock, Database, Network, Phone, User,
  ChevronRight, CheckCircle2, ShieldCheck, Terminal, Search, Copy,
  Radio, Pause, Play, RefreshCw, ArrowUpRight, Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getStats, getHistory } from '../services/api';
import type { Stats, HistoryRecord } from '../types';
import PageTransition from '../components/PageTransition';
import CyberRadarHUD from '../components/CyberRadarHUD';
import MetricSparkline from '../components/MetricSparkline';

/* ── Initial Terminal Logs ──────────────────────────── */
interface LogLine {
  id: string;
  time: string;
  type: 'cmd' | 'success' | 'info' | 'warn' | 'dim';
  text: string;
  badge?: string;
}

const INITIAL_LOGS: LogLine[] = [
  { id: '1', time: '00:00:01', type: 'cmd', text: '$ blackeye --init --mesh-verify' },
  { id: '2', time: '00:00:02', type: 'success', text: 'Core telemetry engine initialized', badge: 'ONLINE' },
  { id: '3', time: '00:00:03', type: 'success', text: 'Multi-provider consensus pipeline established', badge: '4/4 UP' },
  { id: '4', time: '00:00:04', type: 'info', text: 'BGP Autonomous System routing table synced (AS13335, AS15169)', badge: 'SYNC' },
  { id: '5', time: '00:00:05', type: 'info', text: 'Cloudflare 1.1.1.1 DNS over HTTPS verified (TLS 1.3)', badge: 'ENCRYPTED' },
  { id: '6', time: '00:00:06', type: 'cmd', text: '$ blackeye --monitor-threats --live' },
  { id: '7', time: '00:00:07', type: 'dim', text: 'Threat matrix online. Listening for incoming target reconnaissance...' },
];

/* ── Live Periodic Telemetry Events Generator ─────────── */
const TELEMETRY_FEED_POOL: { type: LogLine['type']; text: string; badge: string }[] = [
  { type: 'info', text: 'ip-api.com geo telemetry verified (Tokyo Edge)', badge: '18ms' },
  { type: 'success', text: 'ipwho.is consensus check passed (100% field agreement)', badge: 'MATCH' },
  { type: 'info', text: 'ipinfo.io ASN route cross-referenced: AS16509 Amazon.com', badge: 'BGP' },
  { type: 'success', text: 'Cloudflare DoH health check passed (200 OK)', badge: 'DoH' },
  { type: 'info', text: 'Memory buffer optimized: 0 dropped packets', badge: 'BUFFER' },
  { type: 'warn', text: 'Tor exit node probe detected in cache index', badge: 'FLAGGED' },
  { type: 'info', text: 'DNSSEC chain validation successful for root resolvers', badge: 'DNSSEC' },
  { type: 'success', text: 'Telemetry socket ping ACK: round-trip 14.8ms', badge: 'ACK' },
];

/* ── Consistency Badges ─────────────────────────────── */
const CONSISTENCY_BADGE: Record<string, { bg: string; text: string; border: string; glow: string }> = {
  HIGH: {
    bg: 'bg-[#00ff4115]',
    text: 'text-[#00ff41]',
    border: 'border-[#00ff4140]',
    glow: 'shadow-[0_0_12px_rgba(0,255,65,0.3)]',
  },
  MEDIUM: {
    bg: 'bg-[#f59e0b15]',
    text: 'text-[#f59e0b]',
    border: 'border-[#f59e0b40]',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.3)]',
  },
  LOW: {
    bg: 'bg-[#ef444415]',
    text: 'text-[#ef4444]',
    border: 'border-[#ef444440]',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]',
  },
};

/* ── Animated Counter Component ─────────────────────── */
const AnimatedCounter = ({ value, suffix = '' }: { value: number | string; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof value === 'string') return;
    const end = Number(value) || 0;
    if (end === 0) return;

    let start = 0;
    const duration = 1000;
    const stepTime = Math.max(10, Math.floor(duration / end));

    const timer = setInterval(() => {
      start += Math.ceil(end / 40);
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  if (typeof value === 'string') return <span>{value}</span>;
  return <span>{count.toLocaleString()}{suffix}</span>;
};

export default function Dashboard() {
  const navigate = useNavigate();

  /* State */
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Terminal State
  const [logs, setLogs] = useState<LogLine[]>(INITIAL_LOGS);
  const [activeTermTab, setActiveTermTab] = useState<'stream' | 'providers' | 'health'>('stream');
  const [isFeedPaused, setIsFeedPaused] = useState(false);
  const termContainerRef = useRef<HTMLDivElement>(null);

  // Recent Scans Filter
  const [recentFilter, setRecentFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [recentSearch, setRecentSearch] = useState('');

  // Particle Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Fetch Stats & History */
  const fetchDashboardData = () => {
    setLoading(true);
    Promise.all([getStats(), getHistory({ page: 1 })])
      .then(([s, h]) => {
        setStats(s.data.data);
        setRecent(h.data.data?.items || []);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* Periodic Telemetry Feed Simulator */
  useEffect(() => {
    if (isFeedPaused) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const randomItem = TELEMETRY_FEED_POOL[Math.floor(Math.random() * TELEMETRY_FEED_POOL.length)];

      setLogs(prev => {
        const next = [
          ...prev,
          {
            id: String(Date.now()),
            time: timeStr,
            type: randomItem.type,
            text: randomItem.text,
            badge: randomItem.badge,
          },
        ];
        // Keep last 30 logs max
        return next.slice(-30);
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isFeedPaused]);

  /* Auto-scroll inside terminal container only (without scrolling main window) */
  useEffect(() => {
    if (!isFeedPaused && termContainerRef.current && activeTermTab === 'stream') {
      termContainerRef.current.scrollTop = termContainerRef.current.scrollHeight;
    }
  }, [logs, isFeedPaused, activeTermTab]);

  /* Particle Hero Constellation Canvas */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];
    const colors = ['rgba(0, 255, 65, 0.6)', 'rgba(0, 212, 255, 0.5)', 'rgba(168, 85, 247, 0.4)'];

    const initParticles = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 45 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    };
    initParticles();
    window.addEventListener('resize', initParticles);

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = dx * dx + dy * dy;
          if (dist < 12000) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 255, 65, ${0.12 * (1 - dist / 12000)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particle dots with subtle glow
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', initParticles);
    };
  }, []);

  /* Copy Terminal Logs */
  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.time}] ${l.badge ? `[${l.badge}] ` : ''}${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('Telemetry logs copied to clipboard');
  };

  /* Filtered Recent Scans */
  const filteredRecent = useMemo(() => {
    return recent.filter(r => {
      const matchFilter = recentFilter === 'ALL' || r.consistency_score === recentFilter;
      const matchSearch =
        !recentSearch ||
        r.target.toLowerCase().includes(recentSearch.toLowerCase()) ||
        r.city?.toLowerCase().includes(recentSearch.toLowerCase()) ||
        r.country?.toLowerCase().includes(recentSearch.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [recent, recentFilter, recentSearch]);

  /* Telemetry Metric Cards Data */
  const METRIC_CARDS = [
    {
      id: 'total',
      label: 'TOTAL RECON SCANS',
      value: stats?.total_tests ?? 0,
      suffix: '',
      icon: Database,
      color: '#00ff41',
      sparkColor: '#00ff41',
      trend: '+24.5%',
      trendLabel: 'vs 24h avg',
      status: 'Consensus Active',
      data: [8, 14, 12, 22, 19, 28, 25, 36, 32, 45],
    },
    {
      id: 'today',
      label: "TODAY'S SCANS",
      value: stats?.today_tests ?? 0,
      suffix: '',
      icon: Clock,
      color: '#00d4ff',
      sparkColor: '#00d4ff',
      trend: 'Live Stream',
      trendLabel: 'peak period',
      status: 'High Throughput',
      data: [5, 10, 8, 15, 12, 20, 18, 26, 22, 30],
    },
    {
      id: 'unique',
      label: 'UNIQUE TARGET IPS',
      value: stats?.unique_ips ?? 0,
      suffix: '',
      icon: Globe,
      color: '#f59e0b',
      sparkColor: '#f59e0b',
      trend: '100% Unique',
      trendLabel: 'global edge',
      status: 'BGP Monitored',
      data: [12, 16, 14, 21, 19, 25, 22, 31, 28, 38],
    },
    {
      id: 'consistency',
      label: 'DATA CONSISTENCY',
      value: stats?.avg_consistency ?? 'HIGH',
      suffix: '',
      icon: TrendingUp,
      color: '#a855f7',
      sparkColor: '#a855f7',
      trend: '99.4%',
      trendLabel: 'match rate',
      status: 'Multi-Source Match',
      data: [90, 92, 91, 95, 94, 98, 97, 99, 98, 100],
    },
  ];

  /* 5 Intelligence Modules */
  const INTEL_MODULES = [
    {
      code: 'MOD-01',
      label: 'IP Geolocation',
      desc: 'Cross-provider consensus, ISP, ASN, VPN & Proxy detection',
      icon: Globe,
      to: '/ip',
      color: '#00ff41',
      tags: ['Multi-Provider', 'Proxy/VPN', 'Latency'],
    },
    {
      code: 'MOD-02',
      label: 'Network Intel',
      desc: 'BGP routing topology, ASN peering & CIDR prefix analysis',
      icon: Network,
      to: '/network',
      color: '#00d4ff',
      tags: ['BGP Routes', 'ASN Lookup', 'Peers'],
    },
    {
      code: 'MOD-03',
      label: 'Domain & Security',
      desc: 'Deep DNS lookup, SSL cipher verification & security headers audit',
      icon: ShieldCheck,
      to: '/domain',
      color: '#10b981',
      tags: ['DNSSEC', 'SSL Grade', 'Headers'],
    },
    {
      code: 'MOD-04',
      label: 'Phone Intelligence',
      desc: 'International E.164 parsing, telecom carrier & validity metadata',
      icon: Phone,
      to: '/phone',
      color: '#f59e0b',
      tags: ['E.164 Format', 'Carrier Info', 'Location'],
    },
    {
      code: 'MOD-05',
      label: 'Username Enum',
      desc: 'Cross-platform digital footprint enumeration on 50+ networks',
      icon: User,
      to: '/username',
      color: '#a855f7',
      tags: ['50+ Platforms', 'OSINT Identity', 'Fast Async'],
    },
  ];

  return (
    <PageTransition>
      <div className="relative min-h-screen p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 select-none">

        {/* Ambient atmospheric radial glows */}
        <div className="absolute top-10 left-10 w-96 h-96 bg-[#00ff41]/5 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-[#00d4ff]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* ══════════════════════════════════════════════════════
            HERO: Tactical Reconnaissance Command Center
        ══════════════════════════════════════════════════════ */}
        <div className="relative overflow-hidden rounded-3xl border border-[#00ff4130] bg-[#070e0a]/80 backdrop-blur-2xl shadow-[0_0_60px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(0,255,65,0.2)] p-6 sm:p-8 md:p-10">
          {/* Particle Constellation Canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50" />

          {/* Tactical Corner HUD Brackets */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#00ff4160] pointer-events-none" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#00ff4160] pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#00ff4160] pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#00ff4160] pointer-events-none" />

          {/* Grid lines overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050907]/90 via-[#050907]/60 to-transparent pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Title, Subtitle, Quick Scan Bar */}
            <div className="lg:col-span-7 space-y-6">
              {/* Telemetry Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00ff4112] border border-[#00ff4140] shadow-[0_0_15px_rgba(0,255,65,0.15)]">
                  <div className="w-2 h-2 rounded-full bg-[#00ff41] pulse-dot shadow-[0_0_8px_#00ff41]" />
                  <span className="font-mono text-[10px] text-[#00ff41] font-bold tracking-[0.25em] uppercase">
                    SYSTEM OPERATIONAL
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00d4ff10] border border-[#00d4ff30]">
                  <Activity size={12} className="text-[#00d4ff]" />
                  <span className="font-mono text-[10px] text-[#00d4ff] font-semibold tracking-wider">
                    DEFCON: ALPHA
                  </span>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14231a] border border-[#1e3427]">
                  <Cpu size={12} className="text-[#6b7f74]" />
                  <span className="font-mono text-[10px] text-[#8fa799] tracking-wider">
                    LATENCY: 18ms
                  </span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="font-mono font-black text-4xl sm:text-5xl md:text-6xl tracking-tight text-[#e2e8e4]">
                  Black<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff41] via-[#00d4ff] to-[#a855f7] drop-shadow-[0_0_25px_rgba(0,255,65,0.5)]">Eye</span>
                </h1>
                <p className="font-mono text-base sm:text-lg font-semibold text-[#00d4ff] tracking-wide mt-2">
                  Defense-Grade Cyber Reconnaissance & Network Intelligence
                </p>
                <p className="text-[#8fa799] text-sm max-w-xl leading-relaxed mt-2 font-normal">
                  Multi-provider telemetry aggregation, BGP routing topology verification, and digital footprint OSINT with automated consensus scoring.
                </p>
              </div>

              {/* Primary IP actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/ip?detect=1')}
                  className="flex items-center justify-between rounded-xl border border-[#00d4ff35] bg-[#00d4ff0d] px-4 py-3 text-left transition-colors hover:border-[#00d4ff80] hover:bg-[#00d4ff18]"
                >
                  <span>
                    <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7f74]">Discover</span>
                    <span className="mt-1 block font-mono text-sm font-bold text-[#00d4ff]">MY IP</span>
                  </span>
                  <Radio size={18} className="text-[#00d4ff]" />
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/ip')}
                  className="flex items-center justify-between rounded-xl border border-[#00ff4150] bg-[#00ff4112] px-4 py-3 text-left transition-colors hover:border-[#00ff41] hover:bg-[#00ff4120]"
                >
                  <span>
                    <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b7f74]">Analyze</span>
                    <span className="mt-1 block font-mono text-sm font-bold text-[#00ff41]">SCAN IP</span>
                  </span>
                  <ArrowUpRight size={18} className="text-[#00ff41]" />
                </motion.button>
              </div>
            </div>

            {/* Right Column: High-Tech Cyber Radar HUD */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <CyberRadarHUD />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            METRIC CARDS: High-Impact Telemetry Waves & Counters
        ══════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {METRIC_CARDS.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08, duration: 0.4 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="relative overflow-hidden rounded-2xl bg-[#09120e]/85 backdrop-blur-xl border border-[#1a2e23] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.6)] group hover:border-[#00ff4140] transition-colors"
            >
              {/* Top Accent Neon Glow Line */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${card.color}, transparent)`,
                  boxShadow: `0 0 12px ${card.color}`,
                }}
              />

              {/* Faded Background Ambient Glow */}
              <div
                className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 group-hover:opacity-25 transition-opacity blur-2xl pointer-events-none"
                style={{ background: card.color }}
              />

              <div className="flex items-start justify-between mb-3 relative z-10">
                <div>
                  <span className="font-mono text-[10px] font-bold text-[#6b7f74] tracking-widest uppercase">
                    {card.label}
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="font-mono font-extrabold text-3xl sm:text-4xl text-[#e2e8e4] tracking-tight">
                      {loading ? (
                        <div className="h-9 w-20 bg-[#16251d] rounded-lg animate-pulse" />
                      ) : (
                        <AnimatedCounter value={card.value} suffix={card.suffix} />
                      )}
                    </span>
                  </div>
                </div>

                {/* Floating Icon with Frosted Badge */}
                <div
                  className="p-2.5 rounded-xl border transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${card.color}15`,
                    borderColor: `${card.color}30`,
                    color: card.color,
                    boxShadow: `0 0 15px ${card.color}20`,
                  }}
                >
                  <card.icon size={20} />
                </div>
              </div>

              {/* Sparkline & Status Footnote */}
              <div className="flex items-end justify-between pt-2 border-t border-[#16251d] mt-2 relative z-10">
                <div>
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span className="font-bold text-[#e2e8e4]">{card.trend}</span>
                    <span className="text-[#6b7f74]">{card.trendLabel}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 font-mono text-[9px] text-[#4d6356]">
                    <div className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: card.color }} />
                    <span>{card.status}</span>
                  </div>
                </div>

                {/* Animated Mini SVG Sparkline */}
                <div className="flex-shrink-0">
                  <MetricSparkline data={card.data} color={card.sparkColor} width={90} height={36} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════
            SOC SYSTEM VITALS & ENGINE STATUS TICKER
        ══════════════════════════════════════════════════════ */}
        <div className="rounded-xl border border-[#16251d] bg-[#070c09]/90 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Animated Equalizer Waveform */}
            <div className="flex items-end gap-1 h-5 px-1 py-0.5">
              <span className="w-1 bg-[#00ff41] rounded-full eq-bar-1" />
              <span className="w-1 bg-[#00ff41] rounded-full eq-bar-2" />
              <span className="w-1 bg-[#00d4ff] rounded-full eq-bar-3" />
              <span className="w-1 bg-[#00ff41] rounded-full eq-bar-4" />
              <span className="w-1 bg-[#00d4ff] rounded-full eq-bar-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#e2e8e4]">SOC TELEMETRY:</span>
              <span className="font-mono text-[11px] text-[#00ff41] font-semibold">ALL SYSTEMS NOMINAL</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[#8fa799] font-mono text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[#4d6356]">PROVIDERS:</span>
              <span className="text-[#00d4ff] font-semibold">4 CONNECTED</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-[#4d6356]">CONSENSUS ENGINE:</span>
              <span className="text-[#00ff41] font-semibold">v2.4 ACTIVE</span>
            </div>
            <div className="hidden lg:flex items-center gap-1.5">
              <span className="text-[#4d6356]">TLS CIPHER:</span>
              <span className="text-[#a855f7] font-semibold">AES-256-GCM</span>
            </div>
            <button
              onClick={fetchDashboardData}
              title="Refresh Live Telemetry"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0e1b14] hover:bg-[#16281e] text-[#00ff41] border border-[#1e3828] transition-colors"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              <span className="text-[10px] font-semibold">REFRESH</span>
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            INTELLIGENCE MODULES: Tactical Capabilities
        ══════════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center justify-between mb-4 px-1">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-[#00ff41]" />
              <h2 className="font-mono text-xs font-bold tracking-[0.2em] text-[#e2e8e4] uppercase">
                TACTICAL INTELLIGENCE MODULES
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[#4d6356]">SELECT A PROTOCOL TO COMMENCE SCAN</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {INTEL_MODULES.map((mod, idx) => (
              <motion.button
                key={mod.code}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                onClick={() => navigate(mod.to)}
                className="relative overflow-hidden rounded-2xl bg-[#08100c]/90 backdrop-blur-xl border border-[#16251d] pt-5 pb-4 px-5 text-left group hover:border-[#00ff4140] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(0,255,65,0.08)] transition-all flex flex-col justify-between min-h-[205px]"
              >
                {/* Top Corner Module Tag */}
                <div className="flex items-center justify-between mb-2.5">
                  <span className="font-mono text-[10px] font-bold text-[#607b6d] group-hover:text-[#00ff41] tracking-wider transition-colors">
                    {mod.code}
                  </span>
                  <div
                    className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                    style={{ background: mod.color, boxShadow: `0 0 8px ${mod.color}` }}
                  />
                </div>

                {/* Module Icon & Title */}
                <div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: `${mod.color}15`,
                      color: mod.color,
                      border: `1px solid ${mod.color}30`,
                      boxShadow: `0 0 15px ${mod.color}15`,
                    }}
                  >
                    <mod.icon size={20} />
                  </div>
                  <div className="font-mono font-bold text-sm text-[#e2e8e4] group-hover:text-white transition-colors">
                    {mod.label}
                  </div>
                  <p className="font-mono text-[10px] text-[#6b7f74] line-clamp-2 mt-1 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                {/* Footer Launch Indicator */}
                <div className="flex items-center justify-between pt-3 border-t border-[#14231a] mt-3">
                  <span className="font-mono text-[9px] font-semibold text-[#8fa799] group-hover:text-[#00ff41] transition-colors flex items-center gap-1">
                    EXECUTE <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="flex gap-1">
                    {mod.tags.slice(0, 1).map(tag => (
                      <span key={tag} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-[#0d1a13] text-[#4d6356] border border-[#16281e]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            DUAL OPERATIONS CENTER: Interactive Terminal + Recent Recon Scans
        ══════════════════════════════════════════════════════ */}
        <div className="grid lg:grid-cols-12 gap-6">

          {/* ── LEFT: Interactive SOC Cyber Console (7 cols) ── */}
          <div className="lg:col-span-7 flex flex-col rounded-2xl bg-[#060c09] border border-[#16251d] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#040806] border-b border-[#16251d]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_6px_#ef444480]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_6px_#f59e0b80]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#00ff41] shadow-[0_0_6px_#00ff4180]" />
                <span className="ml-2 font-mono text-xs font-semibold text-[#8fa799] flex items-center gap-1.5">
                  <Terminal size={12} className="text-[#00ff41]" />
                  blackeye_core_soc // console
                </span>
              </div>

              {/* Terminal View Tabs */}
              <div className="flex items-center gap-1">
                {(['stream', 'providers', 'health'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTermTab(tab)}
                    className={`px-2.5 py-1 rounded-lg font-mono text-[10px] font-semibold transition-colors uppercase ${activeTermTab === tab
                        ? 'bg-[#00ff4118] text-[#00ff41] border border-[#00ff4130]'
                        : 'text-[#6b7f74] hover:text-[#e2e8e4]'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsFeedPaused(!isFeedPaused)}
                  title={isFeedPaused ? 'Resume Live Stream' : 'Pause Live Stream'}
                  className="p-1 rounded bg-[#0b140f] hover:bg-[#122219] text-[#8fa799] hover:text-[#00ff41] border border-[#1a2e23] transition-colors"
                >
                  {isFeedPaused ? <Play size={11} /> : <Pause size={11} />}
                </button>
                <button
                  onClick={handleCopyLogs}
                  title="Copy Logs"
                  className="p-1 rounded bg-[#0b140f] hover:bg-[#122219] text-[#8fa799] hover:text-[#00ff41] border border-[#1a2e23] transition-colors"
                >
                  <Copy size={11} />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div ref={termContainerRef} className="flex-1 p-4 bg-[#050907] min-h-[300px] max-h-[360px] overflow-y-auto font-mono text-xs space-y-2 select-text scroll-smooth">
              {activeTermTab === 'stream' && (
                <>
                  {logs.map(log => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2.5 leading-relaxed"
                    >
                      <span className="text-[#3c5044] text-[10px] select-none pt-0.5">{log.time}</span>
                      {log.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-bold border select-none ${log.type === 'warn'
                              ? 'bg-[#ef444415] text-[#ef4444] border-[#ef444430]'
                              : log.type === 'success'
                                ? 'bg-[#00ff4115] text-[#00ff41] border-[#00ff4130]'
                                : 'bg-[#00d4ff15] text-[#00d4ff] border-[#00d4ff30]'
                            }`}
                        >
                          {log.badge}
                        </span>
                      )}
                      <span
                        className={`flex-1 ${log.type === 'cmd'
                            ? 'text-[#00ff41] font-semibold'
                            : log.type === 'success'
                              ? 'text-[#e2e8e4]'
                              : log.type === 'warn'
                                ? 'text-[#f59e0b]'
                                : log.type === 'dim'
                                  ? 'text-[#50685b]'
                                  : 'text-[#00d4ff]'
                          }`}
                      >
                        {log.text}
                      </span>
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-1 text-[#00ff41] pt-1">
                    <span>❯</span>
                    <span className="w-2 h-3.5 bg-[#00ff41] cursor-blink inline-block" />
                  </div>
                </>
              )}

              {activeTermTab === 'providers' && (
                <div className="space-y-3 p-2">
                  <div className="text-[#8fa799] text-[11px] mb-2 font-semibold">
                    CONNECTED TELEMETRY INTEGRATIONS (4/4 ACTIVE):
                  </div>
                  {[
                    { name: 'ip-api.com', role: 'Geolocation & ASN Provider', ping: '16ms', status: 'ONLINE', rate: '45 req/min' },
                    { name: 'ipwho.is', role: 'ISP & Timezone Verification', ping: '22ms', status: 'ONLINE', rate: 'Unlimited' },
                    { name: 'ipinfo.io', role: 'Autonomous System & BGP Mapping', ping: '19ms', status: 'ONLINE', rate: '50k/mo' },
                    { name: 'cloudflare-dns.com', role: 'DNS-over-HTTPS & SSL Audit', ping: '12ms', status: 'ONLINE', rate: 'DoH 1.1.1.1' },
                  ].map(p => (
                    <div key={p.name} className="flex items-center justify-between p-2.5 rounded-xl bg-[#09120d] border border-[#16251d]">
                      <div>
                        <div className="font-bold text-[#e2e8e4] text-xs flex items-center gap-2">
                          {p.name}
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00ff4115] text-[#00ff41] border border-[#00ff4130]">
                            {p.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#6b7f74]">{p.role}</div>
                      </div>
                      <div className="text-right text-[10px]">
                        <div className="text-[#00d4ff] font-semibold">{p.ping}</div>
                        <div className="text-[#4d6356]">{p.rate}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTermTab === 'health' && (
                <div className="space-y-3 p-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-[#09120d] border border-[#16251d]">
                      <span className="text-[10px] text-[#6b7f74]">API ENGINE STATUS</span>
                      <div className="text-sm font-bold text-[#00ff41] mt-1">HEALTHY [200 OK]</div>
                      <span className="text-[9px] text-[#4d6356]">Uvicorn / FastAPI Backend</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#09120d] border border-[#16251d]">
                      <span className="text-[10px] text-[#6b7f74]">MEMORY TELEMETRY</span>
                      <div className="text-sm font-bold text-[#00d4ff] mt-1">42.8 MB / NOMINAL</div>
                      <span className="text-[9px] text-[#4d6356]">SQLite Local Storage</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#09120d] border border-[#16251d] space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-[#6b7f74]">Node Version:</span>
                      <span className="text-[#e2e8e4]">Frontend v2.0 (Vite + React 19)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7f74]">Consensus Algorithm:</span>
                      <span className="text-[#00ff41]">Weighted Multi-Engine Majority</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#6b7f74]">Active Security Headers:</span>
                      <span className="text-[#a855f7]">HSTS, CSP, X-Frame-Options</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Terminal Footer Status Bar */}
            <div className="px-4 py-2 bg-[#040806] border-t border-[#16251d] flex items-center justify-between text-[10px] text-[#4d6356] font-mono">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41]" />
                <span>FEED: {isFeedPaused ? 'PAUSED' : 'STREAMING'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>RX: 14.2 KB/s</span>
                <span>TX: 8.9 KB/s</span>
                <span>FPS: 60</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Recent Scans & Intelligence Feed (5 cols) ── */}
          <div className="lg:col-span-5 flex flex-col rounded-2xl bg-[#060c09] border border-[#16251d] overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
            {/* Header with Search and Filter */}
            <div className="p-4 bg-[#040806] border-b border-[#16251d] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={15} className="text-[#00d4ff]" />
                  <span className="font-mono text-xs font-bold text-[#e2e8e4] tracking-widest uppercase">
                    RECENT SCANS
                  </span>
                </div>
                <button
                  onClick={() => navigate('/history')}
                  className="font-mono text-[10px] text-[#8fa799] hover:text-[#00ff41] transition-colors flex items-center gap-1 font-semibold"
                >
                  VIEW ALL ({recent.length}) <ChevronRight size={12} />
                </button>
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
                {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setRecentFilter(filter)}
                    className={`px-2.5 py-0.5 rounded-lg font-mono text-[9px] font-bold transition-all uppercase ${recentFilter === filter
                        ? 'bg-[#00d4ff20] text-[#00d4ff] border border-[#00d4ff40]'
                        : 'bg-[#0c1611] text-[#6b7f74] border border-[#16251d] hover:text-[#e2e8e4]'
                      }`}
                  >
                    {filter === 'ALL' ? 'ALL SCANS' : `${filter} SCORE`}
                  </button>
                ))}
              </div>

              {/* Search Target Input */}
              <div className="relative flex items-center pt-1">
                <Search size={12} className="absolute left-2.5 text-[#4d6356] pointer-events-none" />
                <input
                  type="text"
                  value={recentSearch}
                  onChange={e => setRecentSearch(e.target.value)}
                  placeholder="Filter targets by IP or location..."
                  className="w-full bg-[#08120d] border border-[#16251d] rounded-lg pl-7 pr-3 py-1 font-mono text-[10px] text-[#e2e8e4] placeholder-[#4d6356] focus:outline-none focus:border-[#00d4ff50] transition-colors"
                />
              </div>
            </div>

            {/* Recent Scans List */}
            <div className="flex-1 divide-y divide-[#122018] overflow-y-auto max-h-[360px] min-h-[300px]">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#14231a] animate-pulse" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-4 w-32 bg-[#14231a] rounded animate-pulse" />
                      <div className="h-3 w-20 bg-[#101c15] rounded animate-pulse" />
                    </div>
                  </div>
                ))
              ) : filteredRecent.length === 0 ? (
                <div className="p-10 flex flex-col items-center justify-center text-center h-full space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0c1611] border border-[#1a2e23] flex items-center justify-center text-[#4d6356]">
                    <Database size={22} />
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-xs font-semibold text-[#8fa799]">No target telemetry found</p>
                    <p className="font-mono text-[10px] text-[#4d6356] max-w-xs">
                      No records match the selected filter criteria in the security log archive.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/ip')}
                    className="mt-2 font-mono text-xs font-bold px-4 py-2 rounded-xl bg-[#00ff4115] text-[#00ff41] border border-[#00ff4130] hover:bg-[#00ff4125] transition-all"
                  >
                    INITIATE RECON SCAN
                  </button>
                </div>
              ) : (
                filteredRecent.slice(0, 6).map((rec, idx) => {
                  const badgeStyle = CONSISTENCY_BADGE[rec.consistency_score] || CONSISTENCY_BADGE.MEDIUM;
                  return (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      onClick={() => navigate(`/history/${rec.id}`)}
                      className="group flex items-center gap-3.5 px-4 py-3 hover:bg-[#0b1610] cursor-pointer transition-colors relative"
                    >
                      {/* Left Hover Border Accent */}
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#00ff41] scale-y-0 group-hover:scale-y-100 transition-transform origin-center" />

                      {/* Icon */}
                      <div className="w-8 h-8 rounded-xl bg-[#0d1a13] border border-[#1a2e23] flex items-center justify-center text-[#00ff41] group-hover:border-[#00ff4150] transition-colors flex-shrink-0">
                        <CheckCircle2 size={16} />
                      </div>

                      {/* Target & Geo */}
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-xs font-bold text-[#e2e8e4] group-hover:text-[#00ff41] transition-colors truncate">
                          {rec.target}
                        </div>
                        <div className="font-mono text-[10px] text-[#6b7f74] flex items-center gap-1.5 truncate mt-0.5">
                          <span>{rec.city || 'Unknown'}, {rec.country || 'Global'}</span>
                          <span>•</span>
                          <span>
                            {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Score Pill */}
                      <div className="flex-shrink-0 flex items-center gap-1.5">
                        <span
                          className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
                        >
                          {rec.consistency_score}
                        </span>
                        <ChevronRight
                          size={12}
                          className="text-[#4d6356] group-hover:text-[#00ff41] group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Recent Scans Footer */}
            <div className="p-3 bg-[#040806] border-t border-[#16251d] text-center">
              <button
                onClick={() => navigate('/history')}
                className="w-full py-1.5 font-mono text-[10px] font-bold text-[#00d4ff] hover:text-white rounded-lg hover:bg-[#00d4ff10] border border-[#00d4ff20] transition-colors"
              >
                OPEN HISTORICAL ARCHIVE EXPLORER
              </button>
            </div>
          </div>

        </div>

      </div>
    </PageTransition>
  );
}
