import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Globe, Network, Phone, User, ShieldCheck,
  History, Settings, Info, ChevronLeft, ChevronRight,
  Terminal, Command, Menu, X, Wifi, WifiOff, Activity
} from 'lucide-react';

/* ── Section colour tokens ─────────────────────────────────── */
const SECTION_COLORS: Record<string, { accent: string; glow: string; badge: string; text: string }> = {
  TOOLS: { accent: '#00ff41', glow: 'rgba(0,255,65,0.5)', badge: 'from-[#00ff4118] to-[#00ff4106]', text: 'text-[#00ff41]' },
  DATA: { accent: '#00d4ff', glow: 'rgba(0,212,255,0.5)', badge: 'from-[#00d4ff18] to-[#00d4ff06]', text: 'text-[#00d4ff]' },
  SYSTEM: { accent: '#a855f7', glow: 'rgba(168,85,247,0.5)', badge: 'from-[#a855f718] to-[#a855f706]', text: 'text-[#a855f7]' },
};

const NAV_SECTIONS = [
  {
    label: 'TOOLS',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/ip', icon: Globe, label: 'IP Geolocation' },
      { to: '/network', icon: Network, label: 'Network Intel' },
      { to: '/domain', icon: ShieldCheck, label: 'Domain Recon' },
      { to: '/phone', icon: Phone, label: 'Phone Intel' },
      { to: '/username', icon: User, label: 'Username Enum' },
    ]
  },
  {
    label: 'DATA',
    items: [
      { to: '/history', icon: History, label: 'History' },
    ]
  },
  {
    label: 'SYSTEM',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
      { to: '/about', icon: Info, label: 'About' },
    ]
  }
];

const ALL_NAV = NAV_SECTIONS.flatMap(s => s.items);

interface LayoutProps {
  children: React.ReactNode;
  onOpenCmd: () => void;
}

/* Animated scan-line sweep on the active item */
function ScanLine() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      <motion.div
        className="absolute left-0 right-0 h-px opacity-25"
        style={{ background: 'linear-gradient(90deg,transparent,#00ff41,transparent)' }}
        animate={{ top: ['0%', '100%'] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', repeatDelay: 2.5 }}
      />
    </div>
  );
}

export default function Layout({ children, onOpenCmd }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const pingApi = async () => {
    try {
      const r = await fetch('http://localhost:8000/api/v1/health', { signal: AbortSignal.timeout(3000) });
      setApiOnline(r.ok);
    } catch { setApiOnline(false); }
  };
  useEffect(() => {
    pingApi();
    const t = setInterval(pingApi, 15000);
    return () => clearInterval(t);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const currentLabel = ALL_NAV.find(n => n.to === location.pathname)?.label?.toUpperCase() || 'DASHBOARD';

  const activeSectionColor = (() => {
    for (const sec of NAV_SECTIONS)
      if (sec.items.some(i => i.to === location.pathname)) return SECTION_COLORS[sec.label];
    return SECTION_COLORS.TOOLS;
  })();

  /* ───────────────────────────────────────────── */
  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden">

      {/* ═══ DESKTOP SIDEBAR ═══ */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 230 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col border-r border-[#1a2620] relative z-10 flex-shrink-0 overflow-hidden"
        style={{ background: 'linear-gradient(175deg,#07100a 0%,#050706 60%,#050505 100%)' }}
      >
        {/* Right edge glow */}
        <div className="absolute inset-y-0 right-0 w-px pointer-events-none"
          style={{ background: `linear-gradient(180deg,transparent 0%,${activeSectionColor.glow} 50%,transparent 100%)` }} />

        {/* ── LOGO ─────────────────────────────────── */}
        <div className={`flex items-center gap-4 px-5 py-6 flex-shrink-0 relative overflow-hidden ${collapsed ? 'justify-center' : ''}`}
          style={{ borderBottom: '1px solid #1c2820' }}>
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at top left,#00ff4112 0%,transparent 70%)' }} />

          {/* SVG radar icon */}
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 rounded-full blur-md opacity-40" style={{ background: '#00ff41' }} />
            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full relative z-10">
              <circle cx="16" cy="16" r="14" stroke="#00ff41" strokeWidth="1.5" />
              <circle cx="16" cy="16" r="8" stroke="#00ff41" strokeWidth="1" strokeDasharray="2 3" />
              <circle cx="16" cy="16" r="3" fill="#00ff41" />
              <line x1="16" y1="2" x2="16" y2="8" stroke="#00ff41" strokeWidth="1.5" />
              <line x1="16" y1="24" x2="16" y2="30" stroke="#00ff41" strokeWidth="1.5" />
              <line x1="2" y1="16" x2="8" y2="16" stroke="#00ff41" strokeWidth="1.5" />
              <line x1="24" y1="16" x2="30" y2="16" stroke="#00ff41" strokeWidth="1.5" />
            </svg>
            <div className="absolute w-10 h-10 -inset-0.5 rounded-full border border-[#00ff4130]"
              style={{ animation: 'pulse-ring 3s ease-out infinite' }} />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} className="overflow-hidden"
              >
                <div className="font-mono font-black text-base tracking-[0.18em] whitespace-nowrap"
                  style={{ background: 'linear-gradient(90deg,#00ff41 0%,#00e8a0 50%,#00d4ff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  BlackEye
                </div>
                <div className="font-mono text-[10px] tracking-[0.28em] whitespace-nowrap uppercase"
                  style={{ color: '#3a5042' }}>
                  Security Platform
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── NAV ──────────────────────────────────── */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-6 scrollbar-none">
          {NAV_SECTIONS.map(section => {
            const sc = SECTION_COLORS[section.label];
            return (
              <div key={section.label}>

                {/* Section heading */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 px-2 mb-2"
                    >
                      <div className="h-px flex-1" style={{ background: `linear-gradient(90deg,${sc.accent}50,transparent)` }} />
                      <span className={`font-mono text-[10px] font-bold tracking-[0.35em] ${sc.text}`}
                        style={{ opacity: 0.75 }}>
                        {section.label}
                      </span>
                      <div className="h-px w-3" style={{ background: `${sc.accent}30` }} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-1">
                  {section.items.map(({ to, icon: Icon, label }) => (
                    <NavLink
                      key={to} to={to} end={to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group relative
                         ${collapsed ? 'justify-center' : ''}
                         ${isActive ? '' : 'text-[#4a6055] hover:text-[#a8bfb2] hover:bg-[#0c120f]'}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active bg */}
                          {isActive && (
                            <>
                              <motion.div
                                layoutId={`active-bg-${section.label}`}
                                className={`absolute inset-0 rounded-xl bg-gradient-to-r ${sc.badge}`}
                                style={{ border: `1px solid ${sc.accent}28` }}
                              />
                              {/* Left glow bar */}
                              <motion.div
                                layoutId={`active-bar-${section.label}`}
                                className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full"
                                style={{ background: sc.accent, boxShadow: `0 0 10px ${sc.glow}, 0 0 20px ${sc.glow}` }}
                              />
                            </>
                          )}

                          {/* Icon */}
                          <div className="relative z-10 flex-shrink-0">
                            <Icon
                              size={18}
                              style={isActive
                                ? { color: sc.accent, filter: `drop-shadow(0 0 6px ${sc.glow})` }
                                : undefined}
                              className={isActive ? '' : 'transition-all duration-200 group-hover:scale-110'}
                            />
                          </div>

                          {/* Label — bigger, bolder */}
                          <AnimatePresence>
                            {!collapsed && (
                              <motion.span
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="font-mono text-[15px] font-bold tracking-wide relative z-10 whitespace-nowrap"
                                style={isActive ? { color: sc.accent } : undefined}
                              >
                                {label}
                              </motion.span>
                            )}
                          </AnimatePresence>

                          {/* Tooltip (collapsed) */}
                          {collapsed && (
                            <div
                              className="absolute left-full ml-3 px-3 py-2 rounded-xl text-sm font-mono font-semibold
                                         whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50
                                         transition-opacity duration-150 tracking-wide"
                              style={{
                                background: '#0b1410',
                                border: `1px solid ${sc.accent}35`,
                                color: sc.accent,
                                boxShadow: `0 8px 32px rgba(0,0,0,0.7), 0 0 14px ${sc.accent}18`
                              }}
                            >
                              {label}
                              <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent"
                                style={{ borderRightColor: `${sc.accent}35` }} />
                            </div>
                          )}

                          {isActive && <ScanLine />}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        {/* ── FOOTER ───────────────────────────────── */}
        <div
          className={`px-3 pb-4 pt-3 flex-shrink-0 space-y-2 ${collapsed ? 'flex flex-col items-center' : ''}`}
          style={{ borderTop: '1px solid #1c2820' }}
        >
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: '#0a100d', border: '1px solid #1c2820' }}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${apiOnline === null ? 'bg-[#f59e0b] pulse-dot' :
                  apiOnline ? 'bg-[#00ff41] pulse-dot' : 'bg-[#ef4444]'
                  }`} />
                <Activity size={11} className="text-[#3a5042]" />
                <span className="font-mono text-[10px] text-[#3a5042] tracking-widest flex-1 uppercase">
                  API {apiOnline === null ? 'Checking' : apiOnline ? 'Online' : 'Offline'}
                </span>
                {apiOnline
                  ? <Wifi size={10} className="text-[#3a5042]" />
                  : <WifiOff size={10} className="text-[#ef444480]" />}
              </motion.div>
            )}
          </AnimatePresence>

          {collapsed && (
            <div
              className={`w-2 h-2 rounded-full ${apiOnline === null ? 'bg-[#f59e0b] pulse-dot' :
                apiOnline ? 'bg-[#00ff41] pulse-dot' : 'bg-[#ef4444]'
                }`}
              title={apiOnline ? 'API Online' : 'API Offline'}
            />
          )}

          <button
            onClick={onOpenCmd}
            className={`flex items-center gap-2.5 text-[#3a5042] hover:text-[#00ff41] transition-all
                        w-full px-3 py-2.5 rounded-xl ${collapsed ? 'justify-center' : ''}`}
            style={{ border: '1px solid transparent' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#0c120f';
              e.currentTarget.style.borderColor = '#00ff4120';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
            }}
            title="Command Palette (Ctrl+K)"
          >
            <Command size={14} />
            {!collapsed && <span className="font-mono text-[11px] tracking-[0.22em] font-semibold">CTRL + K</span>}
          </button>
        </div>

        {/* ── COLLAPSE TOGGLE ──────────────────────── */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center
                     transition-all z-20 text-[#4a6055] hover:text-[#00ff41]"
          style={{ background: '#0b1410', border: '1px solid #1c2820' }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 12px rgba(0,255,65,0.3)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </motion.aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#1a2620] flex-shrink-0"
          style={{ background: 'rgba(5,7,5,0.97)', backdropFilter: 'blur(20px)' }}
        >
          <button
            className="md:hidden text-[#6b7f74] hover:text-[#00ff41] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="md:hidden font-mono font-black text-sm tracking-[0.2em]"
            style={{ background: 'linear-gradient(90deg,#00ff41,#00d4ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BlackEye
          </div>

          {/* Breadcrumb */}
          <div className="hidden md:flex items-center gap-2">
            <Terminal size={12} className="text-[#3a5042]" />
            <span className="font-mono text-[11px] text-[#3a5042] tracking-wide">blackeye</span>
            <span className="font-mono text-[11px] text-[#1a2620]">/</span>
            <span className="font-mono text-[11px] font-semibold tracking-wide" style={{ color: activeSectionColor.accent }}>
              {currentLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Clock */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
              style={{ background: '#0a100d', border: '1px solid #1c2820' }}>
              <span className="font-mono text-[11px] text-[#3a5042] tracking-widest tabular-nums">{timeStr}</span>
            </div>

            {/* API dot */}
            <div className="hidden md:flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${apiOnline ? 'bg-[#00ff41] pulse-dot' :
                apiOnline === false ? 'bg-[#ef4444]' : 'bg-[#f59e0b] pulse-dot'
                }`} />
              <span className={`font-mono text-[10px] tracking-widest hidden lg:inline ${apiOnline ? 'text-[#00ff4180]' : 'text-[#ef444480]'
                }`}>
                {apiOnline === null ? 'CHECKING' : apiOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>

            {/* CMD shortcut */}
            <button
              onClick={onOpenCmd}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px]
                         text-[#4a6055] hover:text-[#00ff41] transition-all"
              style={{ background: '#0b1410', border: '1px solid #1c2820' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#00ff4130')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = '#1c2820')}
            >
              <Command size={11} /><span>K</span>
            </button>
          </div>
        </header>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-b border-[#1a2620] overflow-hidden"
              style={{ background: '#060b08' }}
            >
              <nav className="p-3 space-y-1">
                {ALL_NAV.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to} to={to} end={to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl font-mono text-sm font-semibold tracking-wide transition-all
                       ${isActive
                        ? 'text-[#00ff41] border border-[#00ff4128]'
                        : 'text-[#4a6055] hover:text-[#a8bfb2]'}`
                    }
                    style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg,#00ff4112,#00ff4106)' } : {}}
                  >
                    <Icon size={18} />{label}
                  </NavLink>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page */}
        <main className="flex-1 overflow-y-auto bg-grid">
          <div className="min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
