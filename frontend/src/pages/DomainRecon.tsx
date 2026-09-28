import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ShieldAlert, Shield, Globe, Lock, Server,
  Search, Copy, Check, ExternalLink, AlertTriangle, Terminal,
  CheckCircle2, XCircle, RefreshCw, FileText, X, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { runDomainRecon } from '../services/api';
import type { DomainReconData, SecurityHeaderItem, DnsRecord } from '../types';
import PageTransition from '../components/PageTransition';

function CopyBtn({ text, label }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setOk(true);
    toast.success(`${label || 'Value'} copied to clipboard`);
    setTimeout(() => setOk(false), 2000);
  };
  return (
    <button
      onClick={copy}
      title="Copy to clipboard"
      className="p-1.5 rounded-md bg-[#080d0a] border border-[#1a2620] hover:border-[#00ff4150] text-[#6b7f74] hover:text-[#00ff41] transition-all inline-flex items-center gap-1 text-xs shrink-0"
    >
      {ok ? <Check size={12} className="text-[#00ff41]" /> : <Copy size={12} />}
      {label && <span className="font-mono text-[10px]">{label}</span>}
    </button>
  );
}

const GRADE_COLORS: Record<string, { text: string; bg: string; border: string; glow: string; bar: string }> = {
  'A+': { text: '#00ff41', bg: 'rgba(0,255,65,0.12)', border: '#00ff41', glow: 'rgba(0,255,65,0.3)', bar: 'from-[#00ff41] to-[#00d4ff]' },
  'A':  { text: '#00d4ff', bg: 'rgba(0,212,255,0.12)', border: '#00d4ff', glow: 'rgba(0,212,255,0.3)', bar: 'from-[#00d4ff] to-[#38bdf8]' },
  'B':  { text: '#38bdf8', bg: 'rgba(56,189,248,0.12)', border: '#38bdf8', glow: 'rgba(56,189,248,0.2)', bar: 'from-[#38bdf8] to-[#f59e0b]' },
  'C':  { text: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', glow: 'rgba(245,158,11,0.2)', bar: 'from-[#f59e0b] to-[#f97316]' },
  'D':  { text: '#f97316', bg: 'rgba(249,115,22,0.12)', border: '#f97316', glow: 'rgba(249,115,22,0.2)', bar: 'from-[#f97316] to-[#ef4444]' },
  'F':  { text: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: '#ef4444', glow: 'rgba(239,68,68,0.3)', bar: 'from-[#ef4444] to-[#b91c1c]' },
};

const SAMPLE_DOMAINS = [
  { name: 'cloudflare.com', desc: 'CDN & DNS' },
  { name: 'github.com', desc: 'Code Host' },
  { name: 'python.org', desc: 'Tech Foundation' },
  { name: 'wikipedia.org', desc: 'Global Info' }
];

export default function DomainRecon() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DomainReconData | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'headers' | 'ssl' | 'dns'>('headers');
  const [headerFilter, setHeaderFilter] = useState<'all' | 'issues' | 'secure'>('all');
  const [dnsFilter, setDnsFilter] = useState<string>('ALL');

  const handleSubmit = async (e?: React.FormEvent, customDomain?: string) => {
    if (e) e.preventDefault();
    const target = (customDomain || domain).trim();
    if (!target) {
      setError('Please enter a target domain name.');
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await runDomainRecon(target);
      if (res.data.success) {
        setResult(res.data.data);
        toast.success(`Analysis ready for ${res.data.domain}`);
      } else {
        setError(res.data.errors?.[0] || 'Audit failed.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Reconnaissance service offline or unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sample: string) => {
    setDomain(sample);
    handleSubmit(undefined, sample);
  };

  const gradeInfo = result ? (GRADE_COLORS[result.audit.grade] || GRADE_COLORS['C']) : GRADE_COLORS['C'];

  // Header items filtering
  const filteredHeaders = result?.audit.headers_analysis.filter((h: SecurityHeaderItem) => {
    if (headerFilter === 'issues') return h.status !== 'SECURE';
    if (headerFilter === 'secure') return h.status === 'SECURE';
    return true;
  }) || [];

  // DNS records filtering
  const dnsRecordEntries = result?.dns ? Object.entries(result.dns) : [];
  const activeDnsRecords: DnsRecord[] = [];
  dnsRecordEntries.forEach(([rtype, list]) => {
    if (dnsFilter === 'ALL' || dnsFilter === rtype) {
      activeDnsRecords.push(...list);
    }
  });

  return (
    <PageTransition>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Cyber Header Banner Card */}
        <div className="cyber-panel rounded-2xl p-6 border border-[#00ff4125] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-[#00ff4110] via-transparent to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#00ff4115] border border-[#00ff4140] font-mono text-[10px] text-[#00ff41] tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41] pulse-dot" />
                  MODULE: RECON-01 // AUDIT
                </span>
                <span className="font-mono text-[11px] text-[#6b7f74]">DNS • SSL • HTTP HEADERS</span>
              </div>
              <h1 className="font-mono font-extrabold text-2xl md:text-3xl text-[#e2e8e4] tracking-wide flex items-center gap-3">
                <ShieldCheck size={28} className="text-[#00ff41] drop-shadow-[0_0_10px_rgba(0,255,65,0.5)]" />
                DOMAIN & WEB SECURITY AUDIT
              </h1>
              <p className="font-mono text-xs md:text-sm text-[#8fa89b] max-w-2xl leading-relaxed">
                Asynchronous deep DNS reconnaissance, cryptographic SSL/TLS certificate validation, and defensive HTTP security posture grading.
              </p>
            </div>

            {result && (
              <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-[#050706] border border-[#1a2620] hover:border-[#00ff4160] rounded-xl font-mono text-xs text-[#e2e8e4] flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.15)]"
                >
                  <FileText size={14} className="text-[#00ff41]" />
                  <span>EXPORT PDF</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
                    toast.success('Raw JSON copied to clipboard');
                  }}
                  className="px-3.5 py-2 bg-[#050706] border border-[#1a2620] hover:border-[#00d4ff60] rounded-xl font-mono text-xs text-[#e2e8e4] flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                >
                  <Copy size={14} className="text-[#00d4ff]" />
                  <span>RAW JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tactical Search & Input Box */}
        <div className="cyber-panel cyber-panel-glow rounded-2xl p-5 md:p-6 border border-[#00ff4130] space-y-4">
          <form onSubmit={(e) => handleSubmit(e)} className="w-full">
            <div className="cyber-input-wrap flex flex-col sm:flex-row items-stretch sm:items-center p-2 gap-2 sm:gap-3 bg-[#050706] border border-[#1a2620] rounded-xl shadow-inner">
              
              {/* Dedicated Icon Pod (Eliminates text overlap) */}
              <div className="hidden sm:flex w-11 h-11 rounded-lg bg-[#0a0f0d] border border-[#00ff4130] items-center justify-center text-[#00ff41] shrink-0 ml-1">
                <Globe size={20} className="drop-shadow-[0_0_8px_rgba(0,255,65,0.4)]" />
              </div>

              {/* Text Input with generous spacing */}
              <div className="flex-1 flex items-center relative px-2">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => { setDomain(e.target.value); setError(''); }}
                  placeholder="Enter target domain (e.g. cloudflare.com, github.com)"
                  className="w-full bg-transparent border-0 outline-none font-mono text-sm md:text-base text-[#e2e8e4] placeholder-[#4a5e52] focus:ring-0 focus:outline-none py-2"
                  disabled={loading}
                />
                {domain && !loading && (
                  <button
                    type="button"
                    onClick={() => setDomain('')}
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
                disabled={loading || !domain.trim()}
                className="btn-sweep px-7 py-3 bg-[#00ff41] text-[#050505] font-mono font-bold text-xs md:text-sm tracking-wider rounded-xl disabled:opacity-40 shadow-[0_0_20px_rgba(0,255,65,0.3)] flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>AUDITING...</span>
                  </>
                ) : (
                  <>
                    <Search size={15} />
                    <span>ANALYZE DOMAIN</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Quick Target Presets Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1a2620]/60">
            <div className="flex items-center gap-1.5 text-[#6b7f74] font-mono text-xs mr-1">
              <Zap size={13} className="text-[#00ff41]" />
              <span className="text-[11px] uppercase tracking-wider">TACTICAL PRESETS:</span>
            </div>
            {SAMPLE_DOMAINS.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => handleSampleClick(s.name)}
                className="group font-mono text-xs px-3 py-1.5 rounded-lg bg-[#080d0a] border border-[#1a2620] hover:border-[#00ff4150] text-[#8fa89b] hover:text-[#00ff41] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="font-semibold">{s.name}</span>
                <span className="text-[10px] text-[#4a5e52] group-hover:text-[#00d4ff]">• {s.desc}</span>
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

        {/* Loading State / Telemetry Indicator */}
        {loading && (
          <div className="cyber-panel rounded-2xl p-8 border border-[#00ff4130] space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#00ff41] pulse-dot" />
              <p className="font-mono text-xs md:text-sm text-[#00ff41] tracking-wider animate-pulse">
                [BLACK EYE ENGINE] Querying Cloudflare & Google DoH, negotiating SSL/TLS handshake on port 443, auditing HTTP security directives...
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
              <div className="h-28 bg-[#1a262030] rounded-xl shimmer" />
              <div className="h-28 bg-[#1a262030] rounded-xl shimmer" />
              <div className="h-28 bg-[#1a262030] rounded-xl shimmer" />
              <div className="h-28 bg-[#1a262030] rounded-xl shimmer" />
            </div>
            <div className="h-56 bg-[#1a262020] rounded-xl shimmer" />
          </div>
        )}

        {/* Audit Results Dashboard */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Executive Overview Grid (4 Cards) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Target Identity */}
                <div className="cyber-panel rounded-xl p-5 border border-[#1a2620] space-y-3 relative overflow-hidden group hover:border-[#00ff4140] transition-colors">
                  <div className="flex items-center justify-between text-[#6b7f74] font-mono text-[10px] tracking-wider uppercase">
                    <span>TARGET DOMAIN</span>
                    <Globe size={14} className="text-[#00ff41]" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-lg md:text-xl text-[#e2e8e4] truncate" title={result.domain}>
                      {result.domain}
                    </div>
                    <div className="font-mono text-[11px] text-[#6b7f74] flex items-center gap-1.5 mt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff41]" />
                      <span>Status Code: </span>
                      <span className="text-[#00ff41] font-bold">{result.audit.status_code || 200} OK</span>
                    </div>
                  </div>
                  <div className="pt-1 flex items-center justify-between">
                    <a
                      href={`https://${result.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-[#00d4ff] hover:underline flex items-center gap-1"
                    >
                      Visit Site <ExternalLink size={12} />
                    </a>
                    <CopyBtn text={result.domain} label="Domain" />
                  </div>
                </div>

                {/* 2. Resolved IPs */}
                <div className="cyber-panel rounded-xl p-5 border border-[#1a2620] space-y-3 relative overflow-hidden group hover:border-[#00d4ff40] transition-colors">
                  <div className="flex items-center justify-between text-[#6b7f74] font-mono text-[10px] tracking-wider uppercase">
                    <span>PRIMARY NETWORK IP</span>
                    <Server size={14} className="text-[#00d4ff]" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-lg md:text-xl text-[#00d4ff] truncate">
                      {result.primary_ips[0] || 'None Resolved'}
                    </div>
                    <div className="font-mono text-[11px] text-[#6b7f74] mt-1">
                      {result.primary_ips.length} A-Record{result.primary_ips.length !== 1 ? 's' : ''} detected
                    </div>
                  </div>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="font-mono text-xs text-[#8fa89b]">DNS-over-HTTPS</span>
                    {result.primary_ips[0] && <CopyBtn text={result.primary_ips[0]} label="IP" />}
                  </div>
                </div>

                {/* 3. Server Info & Exposure */}
                <div className="cyber-panel rounded-xl p-5 border border-[#1a2620] space-y-3 relative overflow-hidden group hover:border-[#a855f740] transition-colors">
                  <div className="flex items-center justify-between text-[#6b7f74] font-mono text-[10px] tracking-wider uppercase">
                    <span>SERVER EXPOSURE</span>
                    <Terminal size={14} className="text-[#a855f7]" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-lg md:text-xl text-[#e2e8e4] truncate" title={result.audit.server_info}>
                      {result.audit.server_info}
                    </div>
                    <div className="font-mono text-[11px] text-[#6b7f74] mt-1">
                      TLS: <span className="text-[#00ff41] font-semibold">{result.ssl.tls_version || 'Active'}</span>
                    </div>
                  </div>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="font-mono text-xs text-[#8fa89b]">
                      {result.ssl.issuer ? result.ssl.issuer.split(' ')[0] : 'Encrypted'}
                    </span>
                    <CopyBtn text={result.audit.server_info} label="Server" />
                  </div>
                </div>

                {/* 4. Security Score & Grade */}
                <div
                  className="cyber-panel rounded-xl p-5 border space-y-2 relative overflow-hidden shadow-lg"
                  style={{ borderColor: gradeInfo.border, backgroundColor: gradeInfo.bg }}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] tracking-wider uppercase text-[#e2e8e4]">
                    <span>POSTURE SCORE</span>
                    <span className="font-bold text-xs" style={{ color: gradeInfo.text }}>
                      {result.audit.score} / 100
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center font-mono font-black text-2xl border shadow-lg shrink-0"
                      style={{
                        color: gradeInfo.text,
                        backgroundColor: '#050706',
                        borderColor: gradeInfo.border,
                        boxShadow: `0 0 15px ${gradeInfo.glow}`,
                      }}
                    >
                      {result.audit.grade}
                    </div>
                    <div>
                      <div className="font-mono font-bold text-sm text-[#e2e8e4]">
                        {result.audit.score >= 80 ? 'Robust Defense' : result.audit.score >= 50 ? 'Hardening Needed' : 'Vulnerable Headers'}
                      </div>
                      <div className="font-mono text-[10px] text-[#8fa89b]">
                        {result.audit.headers_analysis.filter(h => h.status === 'SECURE').length} / {result.audit.headers_analysis.length} Headers Configured
                      </div>
                    </div>
                  </div>
                  {/* Score Progress Bar */}
                  <div className="h-1.5 w-full bg-[#050706] rounded-full overflow-hidden border border-[#1a2620]">
                    <div
                      className={`h-full bg-gradient-to-r ${gradeInfo.bar}`}
                      style={{ width: `${Math.max(result.audit.score, 5)}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Segmented Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-[#1a2620] pb-2 font-mono text-xs overflow-x-auto">
                <button
                  onClick={() => setActiveTab('headers')}
                  className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'headers'
                      ? 'bg-[#00ff4118] text-[#00ff41] border border-[#00ff4150] shadow-[0_0_15px_rgba(0,255,65,0.15)] font-bold'
                      : 'text-[#6b7f74] hover:text-[#e2e8e4] bg-[#050706] border border-[#1a2620]'
                  }`}
                >
                  <Shield size={15} />
                  <span>Security Headers</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#050706] text-[10px] border border-[#1a2620]">
                    {result.audit.headers_analysis.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('ssl')}
                  className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'ssl'
                      ? 'bg-[#00d4ff18] text-[#00d4ff] border border-[#00d4ff50] shadow-[0_0_15px_rgba(0,212,255,0.15)] font-bold'
                      : 'text-[#6b7f74] hover:text-[#e2e8e4] bg-[#050706] border border-[#1a2620]'
                  }`}
                >
                  <Lock size={15} />
                  <span>SSL / TLS Certificate</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#050706] text-[10px] border border-[#1a2620]">
                    {result.ssl.valid ? 'Valid' : 'Alert'}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('dns')}
                  className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'dns'
                      ? 'bg-[#a855f718] text-[#a855f7] border border-[#a855f750] shadow-[0_0_15px_rgba(168,85,247,0.15)] font-bold'
                      : 'text-[#6b7f74] hover:text-[#e2e8e4] bg-[#050706] border border-[#1a2620]'
                  }`}
                >
                  <Globe size={15} />
                  <span>DNS Records</span>
                  <span className="px-1.5 py-0.2 rounded bg-[#050706] text-[10px] border border-[#1a2620]">
                    {Object.values(result.dns).reduce((acc, l) => acc + l.length, 0)}
                  </span>
                </button>
              </div>

              {/* TAB 1: SECURITY HEADERS AUDIT */}
              {activeTab === 'headers' && (
                <div className="space-y-4">
                  {/* Filter Sub-Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#6b7f74]">FILTER VIEW:</span>
                      <button
                        onClick={() => setHeaderFilter('all')}
                        className={`px-3 py-1 rounded-lg border transition-colors ${
                          headerFilter === 'all'
                            ? 'bg-[#1a2620] text-[#e2e8e4] border-[#00ff4140]'
                            : 'border-[#1a2620] text-[#6b7f74] hover:text-[#e2e8e4]'
                        }`}
                      >
                        All ({result.audit.headers_analysis.length})
                      </button>
                      <button
                        onClick={() => setHeaderFilter('issues')}
                        className={`px-3 py-1 rounded-lg border transition-colors ${
                          headerFilter === 'issues'
                            ? 'bg-[#ef444420] text-[#ef4444] border-[#ef444450]'
                            : 'border-[#1a2620] text-[#6b7f74] hover:text-[#ef4444]'
                        }`}
                      >
                        Issues ({result.audit.headers_analysis.filter(h => h.status !== 'SECURE').length})
                      </button>
                      <button
                        onClick={() => setHeaderFilter('secure')}
                        className={`px-3 py-1 rounded-lg border transition-colors ${
                          headerFilter === 'secure'
                            ? 'bg-[#00ff4120] text-[#00ff41] border-[#00ff4150]'
                            : 'border-[#1a2620] text-[#6b7f74] hover:text-[#00ff41]'
                        }`}
                      >
                        Secure ({result.audit.headers_analysis.filter(h => h.status === 'SECURE').length})
                      </button>
                    </div>
                  </div>

                  {/* Headers Cards Grid */}
                  <div className="grid grid-cols-1 gap-3.5">
                    {filteredHeaders.map((item, idx) => {
                      const isSecure = item.status === 'SECURE';
                      const isWarning = item.status === 'WARNING';
                      return (
                        <div
                          key={idx}
                          className="cyber-panel rounded-xl border border-[#1a2620] p-5 font-mono space-y-3 hover:border-[#1a2620]/90 transition-all shadow-sm"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-center gap-3">
                              {isSecure ? (
                                <CheckCircle2 size={18} className="text-[#00ff41] shrink-0" />
                              ) : isWarning ? (
                                <AlertTriangle size={18} className="text-[#f59e0b] shrink-0" />
                              ) : (
                                <XCircle size={18} className="text-[#ef4444] shrink-0" />
                              )}
                              <span className="font-bold text-sm md:text-base text-[#e2e8e4]">
                                {item.header}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-[10px] px-2.5 py-0.5 rounded uppercase font-semibold border ${
                                  item.importance === 'CRITICAL'
                                    ? 'text-[#ef4444] bg-[#ef444415] border-[#ef444440]'
                                    : item.importance === 'HIGH'
                                    ? 'text-[#f59e0b] bg-[#f59e0b15] border-[#f59e0b40]'
                                    : 'text-[#6b7f74] bg-[#1a2620] border-[#1a2620]'
                                }`}
                              >
                                {item.importance}
                              </span>
                              <span
                                className={`text-[10px] px-2.5 py-0.5 rounded font-bold border ${
                                  isSecure
                                    ? 'text-[#00ff41] bg-[#00ff4115] border-[#00ff4140]'
                                    : isWarning
                                    ? 'text-[#f59e0b] bg-[#f59e0b15] border-[#f59e0b40]'
                                    : 'text-[#ef4444] bg-[#ef444415] border-[#ef444440]'
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-[#8fa89b] leading-relaxed">
                            {item.description}
                          </p>

                          {/* Current Value Box */}
                          {item.current_value && (
                            <div className="bg-[#050706] p-3 rounded-xl border border-[#1a2620] text-xs text-[#00d4ff] flex items-center justify-between gap-3 break-all">
                              <code>{item.current_value}</code>
                              <CopyBtn text={item.current_value} label="Copy" />
                            </div>
                          )}

                          {/* Remediation Box */}
                          {!isSecure && (
                            <div className="bg-[#121a15]/60 p-3.5 rounded-xl border border-[#1a2620] text-xs space-y-1.5">
                              <span className="text-[#f59e0b] font-semibold text-[11px] flex items-center gap-1.5">
                                <AlertTriangle size={12} /> Recommended Defense Action:
                              </span>
                              <div className="flex items-center justify-between gap-3 text-[#e2e8e4] bg-[#050706] p-2.5 rounded-lg border border-[#1a2620]">
                                <code className="break-all text-[#8fa89b]">{item.recommendation}</code>
                                <CopyBtn text={item.recommendation} label="Copy Directive" />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: SSL/TLS CERTIFICATE */}
              {activeTab === 'ssl' && (
                <div className="space-y-4">
                  {result.ssl.error ? (
                    <div className="cyber-panel rounded-2xl border border-[#ef444440] p-8 text-center space-y-3">
                      <ShieldAlert size={40} className="text-[#ef4444] mx-auto" />
                      <h3 className="font-mono font-bold text-lg text-[#ef4444]">
                        SSL / TLS Certificate Validation Error
                      </h3>
                      <p className="font-mono text-xs text-[#8fa89b] max-w-lg mx-auto">
                        {result.ssl.error}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Validity card */}
                      <div className="cyber-panel rounded-xl border border-[#1a2620] p-6 font-mono space-y-4">
                        <div className="flex items-center justify-between border-b border-[#1a2620] pb-3">
                          <span className="text-xs text-[#6b7f74] tracking-wider uppercase font-semibold">
                            CRYPTOGRAPHIC IDENTITY
                          </span>
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded font-bold border ${
                              result.ssl.valid
                                ? 'text-[#00ff41] bg-[#00ff4115] border-[#00ff4130]'
                                : 'text-[#ef4444] bg-[#ef444415] border-[#ef444430]'
                            }`}
                          >
                            {result.ssl.valid ? 'VALID CERTIFICATE' : 'INVALID / EXPIRED'}
                          </span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center py-1 border-b border-[#1a2620]/60">
                            <span className="text-[#6b7f74]">Subject (CN):</span>
                            <span className="text-[#e2e8e4] font-semibold">{result.ssl.subject || result.domain}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-[#1a2620]/60">
                            <span className="text-[#6b7f74]">Issuer (CA):</span>
                            <span className="text-[#00d4ff] font-semibold">{result.ssl.issuer || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-[#1a2620]/60">
                            <span className="text-[#6b7f74]">TLS Protocol:</span>
                            <span className="text-[#00ff41] font-semibold">{result.ssl.tls_version || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-[#6b7f74]">Cipher Suite:</span>
                            <span className="text-[#e2e8e4] font-mono text-[11px] truncate max-w-[200px]" title={result.ssl.cipher || ''}>
                              {result.ssl.cipher || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expiration card */}
                      <div className="cyber-panel rounded-xl border border-[#1a2620] p-6 font-mono space-y-4">
                        <div className="flex items-center justify-between border-b border-[#1a2620] pb-3">
                          <span className="text-xs text-[#6b7f74] tracking-wider uppercase font-semibold">
                            EXPIRATION TIMELINE
                          </span>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded border ${
                              result.ssl.days_left > 30
                                ? 'text-[#00ff41] bg-[#00ff4110] border-[#00ff4130]'
                                : 'text-[#f59e0b] bg-[#f59e0b10] border-[#f59e0b30]'
                            }`}
                          >
                            {result.ssl.days_left} Days Remaining
                          </span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between items-center py-1 border-b border-[#1a2620]/60">
                            <span className="text-[#6b7f74]">Valid From:</span>
                            <span className="text-[#e2e8e4]">
                              {result.ssl.valid_from ? new Date(result.ssl.valid_from).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1 border-b border-[#1a2620]/60">
                            <span className="text-[#6b7f74]">Valid Until:</span>
                            <span className="text-[#e2e8e4]">
                              {result.ssl.valid_to ? new Date(result.ssl.valid_to).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-1">
                            <span className="text-[#6b7f74]">Expired Status:</span>
                            <span className={result.ssl.is_expired ? 'text-[#ef4444] font-bold' : 'text-[#00ff41] font-bold'}>
                              {result.ssl.is_expired ? 'EXPIRED' : 'ACTIVE & VALID'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Subject Alternative Names (SANs) */}
                      {result.ssl.sans && result.ssl.sans.length > 0 && (
                        <div className="cyber-panel rounded-xl border border-[#1a2620] p-6 font-mono space-y-3 md:col-span-2">
                          <div className="flex items-center justify-between border-b border-[#1a2620] pb-2">
                            <span className="text-xs text-[#6b7f74] tracking-wider uppercase font-semibold">
                              SUBJECT ALTERNATIVE NAMES ({result.ssl.sans.length})
                            </span>
                            <span className="text-[10px] text-[#4a5e52]">San Domains Covered</span>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-1">
                            {result.ssl.sans.map((san, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 rounded-lg bg-[#050706] border border-[#1a2620] text-xs text-[#8fa89b] hover:text-[#00d4ff] hover:border-[#00d4ff40] transition-colors"
                              >
                                {san}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DNS RECORDS */}
              {activeTab === 'dns' && (
                <div className="space-y-4">
                  {/* Record Type Filters */}
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <span className="text-[#6b7f74]">RECORD TYPE:</span>
                    {['ALL', 'A', 'AAAA', 'MX', 'TXT', 'NS', 'CNAME', 'CAA'].map((t) => {
                      const count = t === 'ALL'
                        ? Object.values(result.dns).reduce((acc, l) => acc + l.length, 0)
                        : (result.dns[t] || []).length;
                      return (
                        <button
                          key={t}
                          onClick={() => setDnsFilter(t)}
                          className={`px-3 py-1 rounded-lg transition-colors border ${
                            dnsFilter === t
                              ? 'bg-[#a855f725] text-[#a855f7] border-[#a855f760] font-bold'
                              : 'border-[#1a2620] text-[#6b7f74] hover:text-[#e2e8e4] bg-[#050706]'
                          }`}
                        >
                          {t} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* DNS Table */}
                  <div className="cyber-panel rounded-xl border border-[#1a2620] overflow-hidden shadow-lg">
                    {activeDnsRecords.length === 0 ? (
                      <div className="p-8 text-center font-mono text-xs text-[#6b7f74]">
                        No DNS records found for filter &apos;{dnsFilter}&apos;.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left font-mono text-xs">
                          <thead>
                            <tr className="border-b border-[#1a2620] bg-[#050706] text-[#6b7f74]">
                              <th className="py-3.5 px-4 font-semibold">TYPE</th>
                              <th className="py-3.5 px-4 font-semibold">HOST NAME</th>
                              <th className="py-3.5 px-4 font-semibold">TTL</th>
                              <th className="py-3.5 px-4 font-semibold">TARGET / DATA</th>
                              <th className="py-3.5 px-4 text-right font-semibold">ACTION</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1a2620]/60">
                            {activeDnsRecords.map((r, i) => (
                              <tr key={i} className="hover:bg-[#1a262020] transition-colors">
                                <td className="py-3.5 px-4">
                                  <span className="px-2.5 py-0.5 rounded bg-[#a855f715] text-[#a855f7] border border-[#a855f730] font-bold">
                                    {r.type}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-[#e2e8e4] max-w-[200px] truncate">{r.name}</td>
                                <td className="py-3.5 px-4 text-[#6b7f74]">{r.ttl}s</td>
                                <td className="py-3.5 px-4 text-[#00d4ff] font-mono break-all max-w-[380px]">
                                  {r.data}
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <CopyBtn text={r.data} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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
