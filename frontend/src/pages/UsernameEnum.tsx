import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  User, ExternalLink, AlertTriangle, Loader2, MessageCircle,
  Hash, Globe, Code, Copy, Gamepad2, Video, Share2, Zap, X
} from 'lucide-react';
import { runUsername } from '../services/api';
import type { UsernameResult, UsernameCheck } from '../types';
import PageTransition from '../components/PageTransition';

const STATUS_STYLE: Record<string, string> = {
  FOUND:        'text-[#00ff41] bg-[#00ff4112] border-[#00ff4140] shadow-[0_0_10px_rgba(0,255,65,0.15)]',
  NOT_FOUND:    'text-[#4a5e52] bg-[#050706] border-[#1a2620]',
  UNKNOWN:      'text-[#f59e0b] bg-[#f59e0b12] border-[#f59e0b40]',
  RATE_LIMITED: 'text-[#f59e0b] bg-[#f59e0b12] border-[#f59e0b40]',
  TIMEOUT:      'text-[#ef4444] bg-[#ef444412] border-[#ef444440]',
  ERROR:        'text-[#ef4444] bg-[#ef444412] border-[#ef444440]',
};

const SAMPLE_USERNAMES = [
  { user: 'torvalds', label: 'Linux Creator' },
  { user: 'gvanrossum', label: 'Python Creator' },
  { user: 'satyanadella', label: 'Tech Executive' },
  { user: 'mojombo', label: 'GitHub Co-Founder' }
];

const getPlatformIcon = (name: string, category = '', size = 18) => {
  const n = name.toLowerCase();
  if (n.includes('github') || n.includes('gitlab') || n.includes('bitbucket') || n.includes('replit') || n.includes('code') || n.includes('hack')) return <Code size={size} />;
  if (n.includes('steam') || n.includes('chess') || n.includes('twitch') || category === 'Gaming') return <Gamepad2 size={size} />;
  if (n.includes('vimeo') || n.includes('sound') || n.includes('spotify') || category === 'Media') return <Video size={size} />;
  if (n.includes('reddit') || n.includes('telegram')) return <MessageCircle size={size} />;
  if (n.includes('twitter') || n === 'x') return <Hash size={size} />;
  if (category === 'Social') return <Share2 size={size} />;
  return <Globe size={size} />;
};

export default function UsernameEnum() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UsernameResult | null>(null);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterFoundOnly, setFilterFoundOnly] = useState<boolean>(false);

  // Scan progress state
  const [scanProgress, setScanProgress] = useState(0);
  const [currentChecking, setCurrentChecking] = useState('');

  const handleSubmit = async (e?: React.FormEvent, customUser?: string) => {
    if (e) e.preventDefault();
    const target = (customUser || username).trim().replace(/^@/, '');
    if (!target) { setError('Please enter a target username.'); return; }

    setLoading(true);
    setResult(null);
    setError('');
    setScanProgress(0);

    const previewPlatforms = ['GitHub', 'GitLab', 'Reddit', 'DockerHub', 'Steam', 'Medium', 'PyPI', 'HackerNews'];
    let idx = 0;
    const progressInterval = setInterval(() => {
      setCurrentChecking(previewPlatforms[idx % previewPlatforms.length]);
      setScanProgress(p => Math.min(p + (100 / previewPlatforms.length / 2), 95));
      idx++;
    }, 250);

    try {
      const res = await runUsername(target);
      clearInterval(progressInterval);
      setScanProgress(100);

      if (res.data.success) {
        setTimeout(() => {
          setResult(res.data.data);
          const found = res.data.data.checks.filter((c: UsernameCheck) => c.status === 'FOUND').length;
          toast.success(`Found on ${found} out of ${res.data.data.checks.length} platforms!`);
        }, 300);
      } else {
        setError(res.data.errors?.[0] || 'Lookup failed.');
      }
    } catch (e: any) {
      clearInterval(progressInterval);
      setError(e?.response?.data?.detail || 'Username enumeration service offline.');
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const handleSampleClick = (u: string) => {
    setUsername(u);
    handleSubmit(undefined, u);
  };

  const copyFoundUrls = () => {
    if (!result) return;
    const found = result.checks
      .filter((c) => c.status === 'FOUND')
      .map((c) => `${c.platform}: ${c.url}`)
      .join('\n');
    navigator.clipboard.writeText(found);
    toast.success('Copied found profile links to clipboard');
  };

  const categories = ['ALL', 'Developer', 'Social', 'Gaming', 'Media'];

  const filteredChecks = result?.checks.filter((c: UsernameCheck) => {
    if (filterFoundOnly && c.status !== 'FOUND') return false;
    if (selectedCategory !== 'ALL' && c.category !== selectedCategory) return false;
    return true;
  }) || [];

  const foundCount = result?.checks.filter(c => c.status === 'FOUND').length || 0;
  const notFoundCount = result?.checks.filter(c => c.status === 'NOT_FOUND').length || 0;

  return (
    <PageTransition>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        
        {/* Cyber Header Banner Card */}
        <div className="cyber-panel rounded-2xl p-6 border border-[#a855f725] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-32 bg-gradient-to-l from-[#a855f710] via-transparent to-transparent pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-[#a855f715] border border-[#a855f740] font-mono text-[10px] text-[#a855f7] tracking-widest uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] pulse-dot" />
                  MODULE: OSINT-03 // IDENTITY ENUM
                </span>
                <span className="font-mono text-[11px] text-[#6b7f74]">32 PUBLIC PLATFORMS</span>
              </div>
              <h1 className="font-mono font-extrabold text-2xl md:text-3xl text-[#e2e8e4] tracking-wide flex items-center gap-3">
                <User size={28} className="text-[#a855f7] drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                MULTI-PLATFORM USERNAME DISCOVERY
              </h1>
              <p className="font-mono text-xs md:text-sm text-[#8fa89b] max-w-2xl leading-relaxed">
                Scan public usernames across 32 developer ecosystems, social networks, gaming communities, and creator registries.
              </p>
            </div>

            {result && foundCount > 0 && (
              <button
                onClick={copyFoundUrls}
                className="px-4 py-2 bg-[#050706] border border-[#a855f740] hover:border-[#a855f7] rounded-xl font-mono text-xs text-[#e2e8e4] flex items-center gap-2 transition-all hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] self-start md:self-center shrink-0"
              >
                <Copy size={14} className="text-[#a855f7]" />
                <span>COPY FOUND PROFILES</span>
              </button>
            )}
          </div>
        </div>

        {/* Tactical Search Box */}
        <div className="cyber-panel cyber-panel-glow rounded-2xl p-5 md:p-6 border border-[#a855f730] space-y-4">
          <form onSubmit={(e) => handleSubmit(e)} className="w-full">
            <div className="cyber-input-wrap cyber-input-wrap-purple flex flex-col sm:flex-row items-stretch sm:items-center p-2 gap-2 sm:gap-3 bg-[#050706] border border-[#1a2620] rounded-xl shadow-inner">
              
              {/* Dedicated @ Badge Pod (Guaranteed no overlap) */}
              <div className="hidden sm:flex w-11 h-11 rounded-lg bg-[#0a0f0d] border border-[#a855f730] items-center justify-center text-[#a855f7] font-mono font-black text-xl shrink-0 ml-1">
                @
              </div>

              {/* Text Input */}
              <div className="flex-1 flex items-center relative px-2">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="Enter username (e.g. torvalds, gvanrossum)"
                  className="w-full bg-transparent border-0 outline-none font-mono text-sm md:text-base text-[#e2e8e4] placeholder-[#4a5e52] focus:ring-0 focus:outline-none py-2"
                  disabled={loading}
                />
                {username && !loading && (
                  <button
                    type="button"
                    onClick={() => setUsername('')}
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
                disabled={loading || !username.trim()}
                className="btn-sweep px-7 py-3 bg-[#a855f7] text-[#050505] font-mono font-bold text-xs md:text-sm tracking-wider rounded-xl disabled:opacity-40 shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>ENUMERATING...</span>
                  </>
                ) : (
                  <>
                    <User size={15} />
                    <span>DISCOVER PROFILES</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Quick Target Presets Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#1a2620]/60">
            <div className="flex items-center gap-1.5 text-[#6b7f74] font-mono text-xs mr-1">
              <Zap size={13} className="text-[#a855f7]" />
              <span className="text-[11px] uppercase tracking-wider">TACTICAL TARGETS:</span>
            </div>
            {SAMPLE_USERNAMES.map((s) => (
              <button
                key={s.user}
                type="button"
                onClick={() => handleSampleClick(s.user)}
                className="group font-mono text-xs px-3 py-1.5 rounded-lg bg-[#080d0a] border border-[#1a2620] hover:border-[#a855f750] text-[#8fa89b] hover:text-[#a855f7] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span className="font-semibold">@{s.user}</span>
                <span className="text-[10px] text-[#4a5e52] group-hover:text-[#00d4ff]">• {s.label}</span>
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

          {/* Live Progress Bar */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-3 border-t border-[#1a2620] overflow-hidden space-y-2"
              >
                <div className="flex justify-between font-mono text-xs text-[#a855f7] tracking-widest">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-ping" />
                    PROBING {currentChecking}...
                  </span>
                  <span>{Math.round(scanProgress)}%</span>
                </div>
                <div className="h-2 bg-[#050706] rounded-full overflow-hidden border border-[#1a2620]">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#a855f7] via-[#00d4ff] to-[#00ff41]"
                    animate={{ width: `${scanProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Section */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Executive Summary Bar */}
              <div className="cyber-panel border border-[#1a2620] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0a0f0d] border border-[#a855f740] flex items-center justify-center text-[#a855f7] shadow-[0_0_15px_rgba(168,85,247,0.2)] shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] text-[#6b7f74] tracking-widest uppercase block">
                      TARGET IDENTITY DOSSIER
                    </span>
                    <span className="font-mono font-black text-2xl text-[#e2e8e4]">
                      @{result.username}
                    </span>
                  </div>
                </div>

                {/* Score Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2.5 bg-[#050706] border border-[#00ff4130] px-3.5 py-2 rounded-xl shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#00ff41] pulse-dot" />
                    <span className="font-mono text-base font-bold text-[#00ff41]">
                      {foundCount}
                    </span>
                    <span className="font-mono text-xs text-[#8fa89b]">FOUND</span>
                  </div>

                  <div className="flex items-center gap-2.5 bg-[#050706] border border-[#1a2620] px-3.5 py-2 rounded-xl shadow-sm">
                    <span className="font-mono text-base font-bold text-[#6b7f74]">
                      {notFoundCount}
                    </span>
                    <span className="font-mono text-xs text-[#6b7f74]">AVAILABLE</span>
                  </div>

                  <div className="flex items-center gap-2.5 bg-[#050706] border border-[#1a2620] px-3.5 py-2 rounded-xl shadow-sm">
                    <span className="font-mono text-base font-bold text-[#00d4ff]">
                      {result.checks.length}
                    </span>
                    <span className="font-mono text-xs text-[#8fa89b]">CHECKED</span>
                  </div>
                </div>
              </div>

              {/* Segmented Category Filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs border-b border-[#1a2620] pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[#6b7f74]">CATEGORY:</span>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl transition-all border ${
                        selectedCategory === cat
                          ? 'bg-[#a855f720] text-[#a855f7] border-[#a855f750] font-bold shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                          : 'border-[#1a2620] text-[#6b7f74] hover:text-[#e2e8e4] bg-[#050706]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Found only toggle */}
                <button
                  onClick={() => setFilterFoundOnly(!filterFoundOnly)}
                  className={`px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-2 ${
                    filterFoundOnly
                      ? 'bg-[#00ff4115] text-[#00ff41] border-[#00ff4150] shadow-[0_0_10px_rgba(0,255,65,0.15)] font-bold'
                      : 'border-[#1a2620] text-[#6b7f74] hover:text-[#e2e8e4] bg-[#050706]'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${filterFoundOnly ? 'bg-[#00ff41]' : 'bg-[#3d4f46]'}`} />
                  <span>Found Only ({foundCount})</span>
                </button>
              </div>

              {/* Profiles Grid (2 Columns) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredChecks.map((check, i) => {
                  const isFound = check.status === 'FOUND';
                  return (
                    <motion.div
                      key={check.platform}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.25) }}
                      className={`cyber-panel rounded-xl p-4 border transition-all flex items-center gap-3.5 ${
                        isFound
                          ? 'border-[#00ff4130] bg-[#00ff4104] hover:border-[#00ff4160] shadow-[0_0_15px_rgba(0,255,65,0.04)]'
                          : 'border-[#1a2620] hover:border-[#1a2620]/80'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                          isFound
                            ? 'bg-[#00ff4112] border-[#00ff4135] text-[#00ff41]'
                            : 'bg-[#080d0a] border-[#1a2620] text-[#6b7f74]'
                        }`}
                      >
                        {getPlatformIcon(check.platform, check.category, 18)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-sm truncate ${
                              isFound ? 'text-[#e2e8e4]' : 'text-[#6b7f74]'
                            }`}
                          >
                            {check.platform}
                          </span>
                          {check.category && (
                            <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-[#050706] border border-[#1a2620] text-[#6b7f74]">
                              {check.category}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[10px] text-[#4a5e52] mt-0.5 flex items-center gap-2">
                          {check.response_time > 0 && <span>{check.response_time}ms</span>}
                          {isFound && <span className="text-[#00ff41] font-semibold">• Profile Match Verified</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-0.5 rounded font-mono text-[10px] tracking-wider border font-bold ${
                            STATUS_STYLE[check.status] || STATUS_STYLE.UNKNOWN
                          }`}
                        >
                          {check.status}
                        </span>

                        {isFound && (
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={check.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-lg bg-[#050706] border border-[#1a2620] hover:border-[#00d4ff50] flex items-center justify-center text-[#00d4ff] hover:text-[#00ff41] transition-all shadow-sm"
                            title={`Open ${check.platform} profile`}
                          >
                            <ExternalLink size={14} />
                          </motion.a>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
