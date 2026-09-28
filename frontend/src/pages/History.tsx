import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { History as HistIcon, Search, Trash2, Download, AlertTriangle, LayoutGrid, List, Globe } from 'lucide-react';
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
        {/* Header & Actions */}
        <div className="flex flex-col gap-5 rounded-2xl border border-[#1a2620] bg-[#0b120e] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.25)] md:flex-row md:items-end md:justify-between md:p-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <HistIcon size={16} className="text-[#00d4ff]" />
              <h1 className="font-sans text-2xl font-bold tracking-tight text-[#e2e8e4]">Telemetry Logs</h1>
            </div>
            <p className="font-mono text-xs text-[#3d4f46]">{total} records stored in local database</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex bg-[#050505] border border-[#1a2620] rounded-lg p-1 mr-2">
              <button onClick={() => setViewMode('table')} className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-[#1a2620] text-[#00ff41]' : 'text-[#6b7f74] hover:text-[#e2e8e4]'}`}>
                <List size={14} />
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-[#1a2620] text-[#00ff41]' : 'text-[#6b7f74] hover:text-[#e2e8e4]'}`}>
                <LayoutGrid size={14} />
              </button>
            </div>
            
            <div className="flex gap-2">
              <button onClick={() => handleExport('json')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#050505] border border-[#1a2620] rounded-lg font-mono text-xs text-[#6b7f74] hover:text-[#00d4ff] hover:border-[#00d4ff30] transition-all shadow-sm">
                <Download size={12} /> JSON
              </button>
              <button onClick={() => handleExport('csv')} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#050505] border border-[#1a2620] rounded-lg font-mono text-xs text-[#6b7f74] hover:text-[#00d4ff] hover:border-[#00d4ff30] transition-all shadow-sm">
                <Download size={12} /> CSV
              </button>
              <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ef444410] border border-[#ef444430] rounded-lg font-mono text-xs text-[#ef4444] hover:bg-[#ef444420] transition-all">
                <Trash2 size={12} /> CLEAR
              </button>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="glass-card flex flex-col gap-4 rounded-2xl border border-[#294333] p-4 shadow-[0_14px_35px_rgba(0,0,0,0.2)] md:flex-row">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4f46]" />
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search IP, city, country, or ISP..."
              className="w-full rounded-xl border border-[#294333] bg-[#07100b] py-3 pl-9 pr-4 font-mono text-sm text-[#e2e8e4] placeholder-[#3d4f46] transition-colors focus:border-[#00d4ff80]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
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
