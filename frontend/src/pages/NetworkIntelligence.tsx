import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Network, Globe, Copy, Check, AlertTriangle, ShieldAlert, Server, Router, Search, Zap, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { runGeolocation } from '../services/api';
import PageTransition from '../components/PageTransition';

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setOk(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setOk(false), 2000);
  };
  return (
    <button
      onClick={copy}
      title="Copy value"
      className="p-1 rounded bg-[#080d0a] border border-[#1a2620] hover:border-[#00d4ff50] text-[#6b7f74] hover:text-[#00d4ff] transition-all ml-2"
    >
      {ok ? <Check size={11} className="text-[#00d4ff]" /> : <Copy size={11} />}
    </button>
  );
}

const SAMPLE_IPS = [
  { ip: '1.1.1.1', label: 'Cloudflare Anycast' },
  { ip: '8.8.8.8', label: 'Google Public DNS' },
  { ip: '9.9.9.9', label: 'Quad9 Recursive' },
  { ip: '208.67.222.222', label: 'Cisco OpenDNS' }
];

export default function NetworkIntelligence() {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e?: React.FormEvent, customIp?: string) => {
    if (e) e.preventDefault();
    const target = (customIp || ip).trim();
    if (!target) { setError('Please enter a target IP address.'); return; }

    setLoading(true);
    setData(null);
    setError('');

    try {
      const res = await runGeolocation(target);
      if (res.data.success) {
        setData(res.data.normalized);
        toast.success('Network topology & ASN data retrieved');
      } else {
        setError(res.data.errors?.[0] || 'Network lookup failed.');
      }
    } catch {
      setError('Backend network service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sample: string) => {
    setIp(sample);
    handleSubmit(undefined, sample);
  };

  const getInfraIcon = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('corporate') || t.includes('business')) return <Server size={14} className="text-[#00d4ff]" />;
    if (t.includes('cellular') || t.includes('mobile')) return <Network size={14} className="text-[#00d4ff]" />;
    return <Router size={14} className="text-[#00d4ff]" />;
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Cyber Header Banner Card */}
        <div className="cyber-panel rounded-2xl p-6 border border-[#00d4ff25] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-[#00d4ff10] via-transparent to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#00d4ff15] border border-[#00d4ff40] font-mono text-[10px] text-[#00d4ff] tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] pulse-dot" />
                  MODULE: NET-02 // ROUTING & TOPOLOGY
                </span>
                <span className="font-mono text-[11px] text-[#6b7f74]">BGP • ASN • CARRIER TRACE</span>
              </div>
              <h1 className="font-mono font-extrabold text-2xl md:text-3xl text-[#e2e8e4] tracking-wide flex items-center gap-3">
                <Network size={28} className="text-[#00d4ff] drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
                NETWORK INTELLIGENCE & ASN TOPOLOGY
              </h1>
              <p className="font-mono text-xs md:text-sm text-[#8fa89b] max-w-2xl leading-relaxed">
                Inspect autonomous system numbers (ASN), internet service provider infrastructure, connection types, and proxy/VPN flags.
              </p>
            </div>
          </div>
        </div>

        {/* Tactical Search Box */}
        <div className="cyber-panel cyber-panel-glow rounded-2xl p-5 md:p-6 border border-[#00d4ff30] space-y-4">
          <form onSubmit={(e) => handleSubmit(e)} className="w-full">
            <div className="cyber-input-wrap cyber-input-wrap-cyan flex flex-col sm:flex-row items-stretch sm:items-center p-2 gap-2 sm:gap-3 bg-[#050706] border border-[#1a2620] rounded-xl shadow-inner">
              
              {/* Dedicated Icon Pod */}
              <div className="hidden sm:flex w-11 h-11 rounded-lg bg-[#0a0f0d] border border-[#00d4ff30] items-center justify-center text-[#00d4ff] shrink-0 ml-1">
                <Network size={20} className="drop-shadow-[0_0_8px_rgba(0,212,255,0.4)]" />
              </div>

              {/* Text Input */}
              <div className="flex-1 flex items-center relative px-2">
                <input
                  type="text"
                  value={ip}
                  onChange={(e) => { setIp(e.target.value); setError(''); }}
                  placeholder="Enter IP address (e.g. 1.1.1.1, 8.8.8.8)"
                  className="w-full bg-transparent border-0 outline-none font-mono text-sm md:text-base text-[#e2e8e4] placeholder-[#4a5e52] focus:ring-0 focus:outline-none py-2"
                  disabled={loading}
                />
                {ip && !loading && (
                  <button
                    type="button"
                    onClick={() => setIp('')}
                    className="p-1 rounded-full text-[#6b7f74] hover:text-[#ef4444] transition-colors"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Action Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading || !ip.trim()}
                className="btn-sweep px-7 py-3 bg-[#00d4ff] text-[#050505] font-mono font-bold text-xs md:text-sm tracking-wider rounded-xl disabled:opacity-40 shadow-[0_0_20px_rgba(0,212,255,0.3)] flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#050505] border-t-transparent rounded-full animate-spin" />
                    <span>ANALYZING...</span>
                  </>
                ) : (
                  <>
                    <Search size={15} />
                    <span>ANALYZE NETWORK</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Quick Target Presets Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1a2620]/60">
            <div className="flex items-center gap-1.5 text-[#6b7f74] font-mono text-xs mr-1">
              <Zap size={13} className="text-[#00d4ff]" />
              <span className="text-[11px] uppercase tracking-wider">TACTICAL PRESETS:</span>
            </div>
            {SAMPLE_IPS.map((s) => (
              <button
                key={s.ip}
                type="button"
                onClick={() => handleSampleClick(s.ip)}
                className="group font-mono text-xs px-3 py-1.5 rounded-lg bg-[#080d0a] border border-[#1a2620] hover:border-[#00d4ff50] text-[#8fa89b] hover:text-[#00d4ff] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="font-semibold">{s.ip}</span>
                <span className="text-[10px] text-[#4a5e52] group-hover:text-[#00ff41]">• {s.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-[#ef444415] border border-[#ef444440] rounded-xl text-[#ef4444] font-mono text-xs flex items-center gap-2.5 shadow-md"
            >
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="cyber-panel rounded-2xl p-8 border border-[#00d4ff30] space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#00d4ff] pulse-dot" />
              <p className="font-mono text-xs md:text-sm text-[#00d4ff] tracking-wider animate-pulse">
                [BLACK EYE NETWORK] Resolving BGP Autonomous System, pinging routing endpoints, inspecting hops...
              </p>
            </div>
            <div className="h-28 bg-[#1a262030] rounded-xl shimmer" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-48 bg-[#1a262020] rounded-xl shimmer" />
              <div className="h-48 bg-[#1a262020] rounded-xl shimmer" />
            </div>
          </div>
        )}

        {/* Results View */}
        <AnimatePresence>
          {data && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* ASN Topology Visualization */}
              <div className="cyber-panel border border-[#00d4ff30] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  
                  {/* IP Node */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-[#080d0a] border-2 border-[#00ff41] flex items-center justify-center relative shadow-[0_0_20px_rgba(0,255,65,0.35)]">
                      <Globe size={22} className="text-[#00ff41]" />
                      <div className="absolute inset-0 rounded-2xl border border-[#00ff41] ripple-anim" />
                    </div>
                    <span className="font-mono text-xs md:text-sm font-bold text-[#00ff41]">{data.ip}</span>
                    <span className="font-mono text-[9px] text-[#6b7f74] uppercase tracking-wider">TARGET IP</span>
                  </div>

                  {/* Tracer Beam 1 */}
                  <div className="hidden md:flex flex-1 items-center px-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00ff41]" />
                    <div className="flex-1 h-0.5 bg-[#1a2620] relative">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00ff41] to-[#00d4ff]"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00d4ff]" />
                  </div>

                  {/* ASN Node */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-[#080d0a] border-2 border-[#00d4ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                      <Server size={22} className="text-[#00d4ff]" />
                    </div>
                    <span className="font-mono text-xs md:text-sm font-bold text-[#00d4ff]">{data.asn || 'ASN N/A'}</span>
                    <span className="font-mono text-[9px] text-[#6b7f74] uppercase tracking-wider">AUTONOMOUS SYSTEM</span>
                  </div>

                  {/* Tracer Beam 2 */}
                  <div className="hidden md:flex flex-1 items-center px-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00d4ff]" />
                    <div className="flex-1 h-0.5 bg-[#1a2620] relative">
                      <motion.div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00d4ff] to-[#a855f7]"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 }}
                      />
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                  </div>

                  {/* ISP Node */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-[#080d0a] border-2 border-[#a855f7] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                      <Router size={22} className="text-[#a855f7]" />
                    </div>
                    <span className="font-mono text-xs md:text-sm font-bold text-[#a855f7] max-w-[130px] text-center truncate" title={data.isp}>
                      {data.isp || 'ISP N/A'}
                    </span>
                    <span className="font-mono text-[9px] text-[#6b7f74] uppercase tracking-wider">SERVICE PROVIDER</span>
                  </div>

                </div>
              </div>

              {/* Data and Badges Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                
                {/* Routing Specifications */}
                <div className="cyber-panel border border-[#1a2620] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1a2620] pb-3">
                    <div className="flex items-center gap-2">
                      <Network size={16} className="text-[#00d4ff]" />
                      <span className="font-mono text-xs md:text-sm font-bold text-[#e2e8e4] tracking-wider uppercase">
                        ROUTING & AUTONOMOUS SPECS
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#6b7f74]">VERIFIED TELEMETRY</span>
                  </div>

                  <div className="space-y-1.5 font-mono text-xs">
                    {[
                      { label: 'Internet Service Provider (ISP)', value: data.isp },
                      { label: 'Registered Organization', value: data.org },
                      { label: 'Autonomous System Number (ASN)', value: data.asn, mono: true },
                      { label: 'Associated Domain', value: data.domain, mono: true },
                      { label: 'Infrastructure Connection Type', value: data.connection_type, icon: getInfraIcon(data.connection_type) },
                    ].map(f => (
                      <div
                        key={f.label}
                        className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#1a2620]/60 last:border-0 hover:bg-[#1a262015] px-3 rounded-lg transition-colors gap-1 sm:gap-4"
                      >
                        <span className="text-[#6b7f74] text-xs">{f.label}</span>
                        <div className="flex items-center gap-2 self-start sm:self-center">
                          {f.icon && f.icon}
                          <span className={`font-semibold ${f.mono ? 'text-[#00d4ff]' : 'text-[#e2e8e4]'} ${!f.value || f.value === 'null' ? 'text-[#4a5e52]' : ''}`}>
                            {f.value || 'Not available'}
                          </span>
                          {f.value && f.value !== 'null' && <CopyBtn text={f.value} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Infrastructure Flags */}
                <div className="cyber-panel border border-[#1a2620] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1a2620] pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert size={16} className="text-[#f59e0b]" />
                      <span className="font-mono text-xs md:text-sm font-bold text-[#e2e8e4] tracking-wider uppercase">
                        SECURITY FLAGS
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#6b7f74]">AUDIT RISK</span>
                  </div>

                  <div className="flex flex-col gap-2.5 font-mono text-xs">
                    {[
                      { label: 'VPN Relay Detected', flag: data.is_vpn },
                      { label: 'Proxy / Anonymizer', flag: data.is_proxy },
                      { label: 'Tor Exit Node', flag: data.is_tor },
                      { label: 'Data Center / Hosting', flag: data.is_hosting },
                      { label: 'Mobile Cellular Network', flag: data.is_mobile },
                    ].map(item => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between p-3 rounded-xl bg-[#050706] border border-[#1a2620]"
                      >
                        <span className="text-[#8fa89b] text-xs">{item.label}</span>
                        {item.flag === null ? (
                          <span className="font-mono text-[10px] text-[#4a5e52]">N/A</span>
                        ) : item.flag ? (
                          <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[#ef444415] text-[#ef4444] border border-[#ef444440] shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                            DETECTED
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-[#00ff4110] text-[#00ff41] border border-[#00ff4130]">
                            CLEAN
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
