import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Phone, AlertTriangle, Check, Globe, MapPin, Clock, Zap, X, Search } from 'lucide-react';
import { runPhone } from '../services/api';
import type { PhoneResult } from '../types';
import PageTransition from '../components/PageTransition';

function Badge({ ok }: { ok: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs border font-bold ${
      ok ? 'text-[#00ff41] bg-[#00ff4110] border-[#00ff4130] shadow-[0_0_10px_rgba(0,255,65,0.15)]' 
         : 'text-[#ef4444] bg-[#ef444410] border-[#ef444430] shadow-[0_0_10px_rgba(239,68,68,0.15)]'
    }`}>
      {ok ? <Check size={12} /> : '✕'} {ok ? 'VALID FORMAT' : 'INVALID SYNTAX'}
    </span>
  );
}

const LiveClock = ({ timezones }: { timezones: string[] }) => {
  const [time, setTime] = useState<string>('');
  
  useEffect(() => {
    if (!timezones || timezones.length === 0) return;
    const tz = timezones[0];
    const updateTime = () => {
      try {
        const d = new Date().toLocaleTimeString('en-US', { timeZone: tz, hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setTime(d);
      } catch { setTime('00:00:00'); }
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [timezones]);

  if (!time) return null;
  return (
    <div className="flex items-center gap-2 bg-[#050706] px-3 py-1.5 rounded-lg border border-[#1a2620]">
      <Clock size={13} className="text-[#a855f7]" />
      <span className="font-mono text-xs text-[#a855f7] tabular-nums tracking-widest">{time}</span>
    </div>
  );
};

const SAMPLE_NUMBERS = [
  { num: '+14155552671', label: 'US Telecom' },
  { num: '+442079460919', label: 'UK London' },
  { num: '+919876543210', label: 'India Mobile' },
  { num: '+81312345678', label: 'Japan Tokyo' }
];

export default function PhoneIntelligence() {
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PhoneResult | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e?: React.FormEvent, customNum?: string) => {
    if (e) e.preventDefault();
    const target = (customNum || number).trim();
    if (!target) { setError('Please enter a target phone number.'); return; }
    
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const res = await runPhone(target);
      if (res.data.success) {
        setResult(res.data.data);
        toast.success('Phone metadata retrieved');
      } else {
        setError(res.data.errors?.[0] || 'Phone analysis failed.');
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Phone metadata service offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleSampleClick = (sample: string) => {
    setNumber(sample);
    handleSubmit(undefined, sample);
  };

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return '🏳️';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const getNumberTypeIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('mobile')) return '📱';
    if (t.includes('fixed') || t.includes('landline')) return '☎️';
    if (t.includes('voip')) return '💻';
    return '📞';
  };

  return (
    <PageTransition>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Cyber Header Banner Card */}
        <div className="cyber-panel rounded-2xl p-6 border border-[#f59e0b25] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-[#f59e0b10] via-transparent to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#f59e0b15] border border-[#f59e0b40] font-mono text-[10px] text-[#f59e0b] tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] pulse-dot" />
                  MODULE: TEL-04 // TELEPHONY PARSER
                </span>
                <span className="font-mono text-[11px] text-[#6b7f74]">ITU E.164 STANDARDS</span>
              </div>
              <h1 className="font-mono font-extrabold text-2xl md:text-3xl text-[#e2e8e4] tracking-wide flex items-center gap-3">
                <Phone size={28} className="text-[#f59e0b] drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                PHONE NUMBER INTELLIGENCE
              </h1>
              <p className="font-mono text-xs md:text-sm text-[#8fa89b] max-w-2xl leading-relaxed">
                Parse international dialing allocations, carrier identifications, routing formats, and geographic timezones.
              </p>
            </div>
          </div>
        </div>

        {/* Tactical Search Box */}
        <div className="cyber-panel cyber-panel-glow rounded-2xl p-5 md:p-6 border border-[#f59e0b30] space-y-4">
          <form onSubmit={(e) => handleSubmit(e)} className="w-full">
            <div className="cyber-input-wrap cyber-input-wrap-amber flex flex-col sm:flex-row items-stretch sm:items-center p-2 gap-2 sm:gap-3 bg-[#050706] border border-[#1a2620] rounded-xl shadow-inner">
              
              {/* Dedicated Icon Pod */}
              <div className="hidden sm:flex w-11 h-11 rounded-lg bg-[#0a0f0d] border border-[#f59e0b30] items-center justify-center text-[#f59e0b] shrink-0 ml-1">
                <Phone size={20} className="drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
              </div>

              {/* Text Input */}
              <div className="flex-1 flex items-center relative px-2">
                <input
                  type="tel"
                  value={number}
                  onChange={(e) => { setNumber(e.target.value); setError(''); }}
                  placeholder="Enter phone number (e.g. +14155552671 or +919876543210)"
                  className="w-full bg-transparent border-0 outline-none font-mono text-sm md:text-base text-[#e2e8e4] placeholder-[#4a5e52] focus:ring-0 focus:outline-none py-2"
                  disabled={loading}
                />
                {number && !loading && (
                  <button
                    type="button"
                    onClick={() => setNumber('')}
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
                disabled={loading || !number.trim()}
                className="btn-sweep px-7 py-3 bg-[#f59e0b] text-[#050505] font-mono font-bold text-xs md:text-sm tracking-wider rounded-xl disabled:opacity-40 shadow-[0_0_20px_rgba(245,158,11,0.3)] flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#050505] border-t-transparent rounded-full animate-spin" />
                    <span>ANALYZING...</span>
                  </>
                ) : (
                  <>
                    <Search size={15} />
                    <span>PARSE NUMBER</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Quick Target Presets Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1a2620]/60">
            <div className="flex items-center gap-1.5 text-[#6b7f74] font-mono text-xs mr-1">
              <Zap size={13} className="text-[#f59e0b]" />
              <span className="text-[11px] uppercase tracking-wider">TACTICAL PRESETS:</span>
            </div>
            {SAMPLE_NUMBERS.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => handleSampleClick(s.num)}
                className="group font-mono text-xs px-3 py-1.5 rounded-lg bg-[#080d0a] border border-[#1a2620] hover:border-[#f59e0b50] text-[#8fa89b] hover:text-[#f59e0b] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="font-semibold">{s.num}</span>
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

        {/* Results View */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              {/* Top Summary Card */}
              <div className="cyber-panel border border-[#f59e0b30] rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-[#f59e0b10] to-transparent pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-2">
                    <span className="font-mono text-[10px] text-[#6b7f74] tracking-widest uppercase block">
                      ITU-T E.164 STANDARDIZED FORMAT
                    </span>
                    <div className="font-mono font-black text-2xl md:text-4xl text-[#f59e0b] drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                      {result.international_format}
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <span className="text-3xl" title={result.country}>
                        {getFlagEmoji(result.country_code)}
                      </span>
                      <span className="font-mono text-sm md:text-base font-bold text-[#e2e8e4]">
                        {result.country}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-[#050706] p-3 rounded-xl border border-[#1a2620] space-y-1">
                      <span className="font-mono text-[9px] text-[#6b7f74] uppercase block">SYNTAX VALIDATION</span>
                      <Badge ok={result.is_valid} />
                    </div>
                    <div className="bg-[#050706] p-3 rounded-xl border border-[#1a2620] space-y-1">
                      <span className="font-mono text-[9px] text-[#6b7f74] uppercase block">ROUTING POSSIBILITY</span>
                      <Badge ok={result.is_possible} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Grid (2 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Locality Data */}
                <div className="cyber-panel border border-[#1a2620] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1a2620] pb-3">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-[#00d4ff]" />
                      <span className="font-mono text-xs md:text-sm font-bold text-[#e2e8e4] tracking-wider uppercase">
                        GEOGRAPHIC LOCALITY
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#6b7f74]">REGION SPECS</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-[#1a2620]/60">
                      <span className="text-[#6b7f74]">Country Calling Code</span>
                      <span className="text-[#00d4ff] font-bold text-sm">{result.country_code}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-[#1a2620]/60">
                      <span className="text-[#6b7f74]">National Standard Format</span>
                      <span className="text-[#e2e8e4] font-semibold">{result.national_format}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-[#6b7f74]">Active Timezone(s)</span>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[#00d4ff]">{result.timezone?.join(', ') || 'N/A'}</span>
                        {result.timezone && result.timezone.length > 0 && <LiveClock timezones={result.timezone} />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Carrier Data */}
                <div className="cyber-panel border border-[#1a2620] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1a2620] pb-3">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#a855f7]" />
                      <span className="font-mono text-xs md:text-sm font-bold text-[#e2e8e4] tracking-wider uppercase">
                        CARRIER & SUBSCRIBER TYPE
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#6b7f74]">ALLOCATION</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center py-1.5 border-b border-[#1a2620]/60">
                      <span className="text-[#6b7f74]">Allocated Carrier</span>
                      <span className="text-[#e2e8e4] font-semibold">{result.carrier || 'Unregistered / Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-[#6b7f74]">Subscription Line Type</span>
                      <div className="flex items-center gap-2 bg-[#050706] px-3 py-1 rounded-lg border border-[#1a2620]">
                        <span className="text-base">{getNumberTypeIcon(result.number_type)}</span>
                        <span className="text-[#e2e8e4] font-bold capitalize">
                          {result.number_type.replace('_', ' ').toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Ethical Disclaimer */}
              <div className="p-4 rounded-xl bg-[#050706] border border-[#f59e0b30] flex gap-3.5 items-start shadow-md font-mono text-xs">
                <AlertTriangle size={16} className="text-[#f59e0b] shrink-0 mt-0.5" />
                <p className="text-[#8fa89b] leading-relaxed">
                  <span className="text-[#f59e0b] font-bold">ETHICAL OSINT NOTICE:</span> Phone metadata is parsed exclusively from public numbering databases and carrier allocation schedules. It does <strong className="text-[#e2e8e4]">NOT</strong> reveal GPS live locations, owner identity, or subscriber records.
                </p>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
