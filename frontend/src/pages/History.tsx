import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { History as HistIcon, Search, Trash2, Download, AlertTriangle, LayoutGrid, List, Globe, Activity, Database, ShieldCheck, Filter } from 'lucide-react';
import { getHistory, deleteHistoryItem, clearHistory, exportHistory } from '../services/api';
import type { HistoryRecord } from '../types';
import PageTransition from '../components/PageTransition';

const CS: Record<string, string> = {
  HIGH: 'text-[#00ff41] border-[#00ff4130] bg-[#00ff4110]',
  MEDIUM: 'text-[#f59e0b] border-[#f59e0b30] bg-[#f59e0b10]',
  LOW: 'text-[#ef4444] border-[#ef444430] bg-[#ef444410]',
  'A+': 'text-[#00ff41] border-[#00ff4130] bg-[#00ff4110]',
  'A':  'text-[#00d4ff] border-[#00d4ff30] bg-[#00d4ff10]',
  'B':  'text-[#38bdf8] border-[#38bdf830] bg-[#38bdf810]',
  'C':  'text-[#f59e0b] border-[#f59e0b30] bg-[#f59e0b10]',
  'D':  'text-[#f97316] border-[#f9731630] bg-[#f9731610]',
  'F':  'text-[#ef4444] border-[#ef444430] bg-[#ef444410]',
};

// Helper to highlight search terms
const Highlight = ({ text, highlight }: { text: string; highlight: string }) => {
  if (!highlight.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? <mark key={i} className="bg-[#00ff4130] text-[#00ff41] bg-transparent">{part}</mark> : <span key={i}>{part}</span>
      )}
    </span>
  );
};

export default function History() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterScore, setFilterScore] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getHistory({ page, search });
      let data = res.data.data?.items || [];
      if (filterScore !== 'ALL') {
         data = data.filter((r: HistoryRecord) => r.consistency_score === filterScore);
      }
      setRecords(data);
      setTotal(res.data.data?.total || 0);
    } catch { toast.error('Failed to load history'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, search, filterScore]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteHistoryItem(id);
    toast.success('Deleted');
    load();
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all history?')) return;
    await clearHistory();
    toast.success('History cleared');
    load();
  };

  const handleExport = async (fmt: 'json' | 'csv') => {
    try {
      const res = await exportHistory(fmt);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url; a.download = `blackeye-history.${fmt}`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('Export failed'); }
  };

  const getFlagEmoji = (countryCode?: string) => {
    if (!countryCode) return '🏳️';
    const codePoints = countryCode.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <PageTransition>
      <div className="min-h-screen w-full max-w-7xl mx-auto space-y-8 px-4 py-5 sm:px-6 lg:px-8">
        {/* Cyber Header Banner */}
        <div className="cyber-panel relative overflow-hidden rounded-2xl border border-[#00d4ff25] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.25)] md:p-6">
          <div className="pointer-events-none absolute right-0 top-0 h-36 w-96 bg-gradient-to-l from-[#00d4ff10] via-transparent to-transparent" />
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded bg-[#00d4ff12] px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-[#00d4ff] border border-[#00d4ff35]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00d4ff] pulse-dot" />
                  MODULE: DATA-01 // TELEMETRY
                </span>
                <span className="font-mono text-[10px] text-[#6b7f74]">LOCAL ARCHIVE</span>
              </div>
              <div className="flex items-center gap-3">
                <HistIcon size={28} className="text-[#00d4ff] drop-shadow-[0_0_10px_rgba(0,212,255,0.45)]" />
                <h1 className="font-mono text-2xl font-extrabold tracking-wide text-[#e2e8e4] md:text-3xl">TELEMETRY HISTORY</h1>
              </div>
              <p className="mt-2 max-w-xl font-mono text-xs leading-relaxed text-[#8fa89b]">
                Review, filter, and export the results of previous intelligence operations.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="min-w-[82px] rounded-xl border border-[#1a2620] bg-[#050706] px-3 py-2">
                <Database size={14} className="mb-1 text-[#00d4ff]" />
                <div className="font-mono text-lg font-bold text-[#e2e8e4]">{total}</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#6b7f74]">Stored</div>
              </div>
              <div className="min-w-[82px] rounded-xl border border-[#00ff4130] bg-[#00ff4108] px-3 py-2">
                <Activity size={14} className="mb-1 text-[#00ff41]" />
                <div className="font-mono text-lg font-bold text-[#00ff41]">{records.length}</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#6b7f74]">Visible</div>
              </div>
              <div className="min-w-[82px] rounded-xl border border-[#a855f730] bg-[#a855f708] px-3 py-2">
                <ShieldCheck size={14} className="mb-1 text-[#a855f7]" />
                <div className="font-mono text-lg font-bold text-[#a855f7]">{filterScore}</div>
                <div className="font-mono text-[9px] uppercase tracking-wider text-[#6b7f74]">Filter</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2 border-t border-[#1a2620] pt-4">
            <div className="mr-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[#6b7f74]"><Activity size={13} className="text-[#00d4ff]" /> Archive controls</div>
            <div className="flex rounded-lg border border-[#1a2620] bg-[#050505] p-1">
              <button onClick={() => setViewMode('table')} aria-label="Table view" aria-pressed={viewMode === 'table'} className={`rounded p-1.5 transition-colors ${viewMode === 'table' ? 'bg-[#00d4ff15] text-[#00d4ff]' : 'text-[#6b7f74] hover:text-[#e2e8e4]'}`}>
                <List size={14} />
              </button>
              <button onClick={() => setViewMode('grid')} aria-label="Grid view" aria-pressed={viewMode === 'grid'} className={`rounded p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-[#00d4ff15] text-[#00d4ff]' : 'text-[#6b7f74] hover:text-[#e2e8e4]'}`}>
                <LayoutGrid size={14} />
              </button>
            </div>
            <button onClick={() => handleExport('json')} className="flex items-center gap-1.5 rounded-lg border border-[#1a2620] bg-[#050505] px-3 py-1.5 font-mono text-xs text-[#6b7f74] transition-all hover:border-[#00d4ff50] hover:text-[#00d4ff]"><Download size={12} /> JSON</button>
            <button onClick={() => handleExport('csv')} className="flex items-center gap-1.5 rounded-lg border border-[#1a2620] bg-[#050505] px-3 py-1.5 font-mono text-xs text-[#6b7f74] transition-all hover:border-[#00d4ff50] hover:text-[#00d4ff]"><Download size={12} /> CSV</button>
            <button onClick={handleClear} className="flex items-center gap-1.5 rounded-lg border border-[#ef444430] bg-[#ef444410] px-3 py-1.5 font-mono text-xs text-[#ef4444] transition-all hover:bg-[#ef444420]"><Trash2 size={12} /> CLEAR</button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="cyber-panel cyber-panel-glow flex flex-col gap-4 rounded-2xl border border-[#00d4ff25] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.2)] md:flex-row">
          <div className="relative flex-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4f46]" />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search IP, city, country, or ISP..."
              style={{ paddingLeft: '2.75rem' }}
              className="w-full rounded-xl border border-[#294333] bg-[#07100b] py-3 pr-4 font-mono text-sm text-[#e2e8e4] placeholder-[#3d4f46] transition-colors focus:border-[#00d4ff80]"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            <Filter size={14} className="shrink-0 text-[#a855f7]" />
            {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(score => (
              <button key={score} onClick={() => { setFilterScore(score as any); setPage(1); }}
                className={`rounded-xl border px-4 py-2.5 font-mono text-xs tracking-widest transition-all whitespace-nowrap ${
                  filterScore === score ? 'bg-[#00ff4115] text-[#00ff41] border-[#00ff4140]' : 'bg-[#050505] text-[#6b7f74] border-[#1a2620] hover:border-[#00ff4120]'
                }`}
              >
                {score} MATCH
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
               {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#0a0f0c] border border-[#1a2620] rounded-xl shimmer" />)}
            </motion.div>
          ) : records.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-card border border-[#1a2620] rounded-xl p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#050505] border border-[#1a2620] flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-[#3d4f46]" />
              </div>
              <h3 className="font-mono text-sm text-[#e2e8e4] mb-2">NO RECORDS FOUND</h3>
              <p className="font-mono text-xs text-[#6b7f74]">Try adjusting your search or filters.</p>
            </motion.div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <motion.div key="table" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card border border-[#1a2620] rounded-xl overflow-hidden shadow-lg">
              <div className="hidden md:grid grid-cols-[1fr_1.5fr_1.5fr_1fr_100px_40px] gap-4 px-5 py-3 border-b border-[#1a2620] bg-[#050505] text-[10px] font-mono text-[#3d4f46] tracking-widest">
                <span>TARGET</span><span>LOCATION</span><span>ISP</span><span>TIMESTAMP</span><span>SCORE</span><span />
              </div>
              <div className="divide-y divide-[#1a2620]">
                {records.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} onClick={() => navigate(`/history/${r.id}`)}
                    className="grid md:grid-cols-[1fr_1.5fr_1.5fr_1fr_100px_40px] gap-4 px-5 py-4 items-center hover:bg-[#0a0f0c] transition-colors cursor-pointer group relative"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00d4ff] scale-y-0 group-hover:scale-y-100 transition-transform" />
                    
                    <span className="font-mono text-xs font-bold text-[#e2e8e4] group-hover:text-[#00d4ff] transition-colors flex items-center gap-2">
                       <Globe size={12} className="text-[#3d4f46] group-hover:text-[#00d4ff] transition-colors hidden md:block" />
                       <Highlight text={r.target} highlight={search} />
                    </span>
                    <span className="font-mono text-xs text-[#6b7f74] flex items-center gap-2">
                       <span className="text-sm">{getFlagEmoji(r.country_code)}</span>
                       <Highlight text={`${r.city}, ${r.country}`} highlight={search} />
                    </span>
                    <span className="font-mono text-[10px] text-[#6b7f74] truncate"><Highlight text={r.isp || '—'} highlight={search} /></span>
                    <span className="font-mono text-[10px] text-[#3d4f46]">{new Date(r.timestamp).toLocaleString()}</span>
                    <span className={`justify-self-start px-2 py-0.5 border rounded font-mono text-[10px] ${CS[r.consistency_score] || 'text-[#6b7f74] border-[#1a2620]'}`}>
                      {r.consistency_score || '—'}
                    </span>
                    <button onClick={e => handleDelete(r.id, e)} className="text-[#3d4f46] hover:text-[#ef4444] transition-colors justify-self-end w-8 h-8 flex items-center justify-center rounded hover:bg-[#ef444415]">
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Grid View */
            <motion.div key="grid" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {records.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} onClick={() => navigate(`/history/${r.id}`)}
                  className="glass-card border border-[#1a2620] rounded-xl p-5 hover:border-[#00d4ff40] cursor-pointer group transition-all hover:shadow-[0_0_20px_rgba(0,212,255,0.1)] relative"
                >
                  <button onClick={e => handleDelete(r.id, e)} className="absolute top-4 right-4 text-[#3d4f46] hover:text-[#ef4444] transition-colors opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#ef444415]">
                    <Trash2 size={14} />
                  </button>
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1a2620]">
                    <div className="w-10 h-10 rounded-lg bg-[#050505] border border-[#1a2620] flex items-center justify-center group-hover:border-[#00d4ff] transition-colors">
                      <Globe size={16} className="text-[#00d4ff]" />
                    </div>
                    <div>
                       <div className="font-mono text-sm font-bold text-[#e2e8e4]"><Highlight text={r.target} highlight={search} /></div>
                       <div className="font-mono text-[9px] text-[#3d4f46]">{new Date(r.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                     <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#6b7f74]">Location</span>
                        <span className="font-mono text-[10px] text-[#e2e8e4] flex items-center gap-1">{getFlagEmoji(r.country_code)} <Highlight text={r.country} highlight={search} /></span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] text-[#6b7f74]">ISP</span>
                        <span className="font-mono text-[10px] text-[#e2e8e4] truncate max-w-[120px] text-right"><Highlight text={r.isp || 'N/A'} highlight={search} /></span>
                     </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-[#1a2620]">
                     <span className="font-mono text-[9px] text-[#6b7f74]">PROVIDER MATCH</span>
                     <span className={`px-2 py-0.5 border rounded font-mono text-[10px] ${CS[r.consistency_score] || 'text-[#6b7f74] border-[#1a2620]'}`}>
                       {r.consistency_score || '—'}
                     </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
