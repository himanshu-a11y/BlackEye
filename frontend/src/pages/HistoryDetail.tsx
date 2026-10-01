import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp, Activity, Database, Globe, Phone, ShieldCheck, UserRound, Search } from 'lucide-react';
import { getHistoryDetail } from '../services/api';
import PageTransition from '../components/PageTransition';

export default function HistoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [jsonOpen, setJsonOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistoryDetail(id!).then(r => setData(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-8 font-mono text-xs text-[#3d4f46]">Loading...</div>;
  if (!data) return <div className="p-8 font-mono text-xs text-[#ef4444]">Record not found.</div>;

  const type = String(data.test_type || 'geolocation');
  const rawData = data.raw_data || {};
  const typeMeta: Record<string, { label: string; description: string; color: string; icon: typeof Globe }> = {
    geolocation: { label: 'IP GEOLOCATION', description: 'Provider consensus and network location record', color: '#00d4ff', icon: Globe },
    domain: { label: 'DOMAIN RECON', description: 'DNS, SSL, and security header audit record', color: '#00ff41', icon: ShieldCheck },
    phone: { label: 'PHONE INTELLIGENCE', description: 'Phone metadata and carrier intelligence record', color: '#f59e0b', icon: Phone },
    username: { label: 'USERNAME ENUMERATION', description: 'Multi-platform public identity scan record', color: '#a855f7', icon: UserRound },
  };
  const meta = typeMeta[type] || { label: type.toUpperCase(), description: 'BlackEye intelligence operation record', color: '#00d4ff', icon: Activity };
  const TypeIcon = meta.icon;
  const usernameChecks = Array.isArray(rawData.checks) ? rawData.checks : [];
  const detailFields = type === 'geolocation'
    ? ['country', 'country_code', 'region', 'city', 'postal', 'timezone', 'isp', 'org', 'asn', 'domain', 'consistency_score']
    : ['target', 'test_type', 'timestamp'];
  const formatLabel = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  const valueFor = (key: string) => data[key] ?? '—';

  return (
    <PageTransition>
      <div className="mx-auto min-h-screen w-full max-w-6xl space-y-5 px-4 py-5 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#6b7f74] hover:text-[#00ff41] transition-colors">
          <ArrowLeft size={14} /> BACK
        </button>

        <div className="cyber-panel relative overflow-hidden rounded-2xl border p-5 md:p-6" style={{ borderColor: `${meta.color}35` }}>
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-96 opacity-80" style={{ background: `linear-gradient(to left, ${meta.color}12, transparent)` }} />
          <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[10px] tracking-widest" style={{ color: meta.color, borderColor: `${meta.color}45`, backgroundColor: `${meta.color}10` }}>
                  <span className="h-1.5 w-1.5 rounded-full pulse-dot" style={{ backgroundColor: meta.color }} />
                  ARCHIVE // {type.toUpperCase()}
                </span>
                <span className="font-mono text-[10px] text-[#6b7f74]">{data.test_id || data.id}</span>
              </div>
              <div className="flex items-center gap-3">
                <TypeIcon size={28} style={{ color: meta.color }} />
                <div>
                  <h1 className="font-mono text-2xl font-extrabold tracking-wide text-[#e2e8e4]">{meta.label}</h1>
                  <p className="mt-1 font-mono text-xs text-[#8fa89b]">{meta.description}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#1a2620] bg-[#050706] px-4 py-3 md:min-w-[190px]">
              <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#6b7f74]"><Database size={13} style={{ color: meta.color }} /> Record target</div>
              <div className="truncate font-mono text-base font-bold text-[#e2e8e4]">{data.target || rawData.username || '—'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="cyber-panel rounded-xl border border-[#1a2620] p-4"><Activity size={15} className="mb-2 text-[#00d4ff]" /><div className="font-mono text-[10px] uppercase tracking-widest text-[#6b7f74]">Operation</div><div className="mt-1 font-mono text-sm font-bold text-[#e2e8e4]">{type}</div></div>
          <div className="cyber-panel rounded-xl border border-[#1a2620] p-4"><Search size={15} className="mb-2 text-[#00ff41]" /><div className="font-mono text-[10px] uppercase tracking-widest text-[#6b7f74]">Payload</div><div className="mt-1 font-mono text-sm font-bold text-[#e2e8e4]">{Object.keys(rawData).length} fields</div></div>
          {type === 'username' ? (
            <>
              <div className="cyber-panel rounded-xl border border-[#a855f730] p-4"><UserRound size={15} className="mb-2 text-[#a855f7]" /><div className="font-mono text-[10px] uppercase tracking-widest text-[#6b7f74]">Platforms</div><div className="mt-1 font-mono text-sm font-bold text-[#e2e8e4]">{usernameChecks.length} checked</div></div>
              <div className="cyber-panel rounded-xl border border-[#00ff4130] p-4"><ShieldCheck size={15} className="mb-2 text-[#00ff41]" /><div className="font-mono text-[10px] uppercase tracking-widest text-[#6b7f74]">Found</div><div className="mt-1 font-mono text-sm font-bold text-[#00ff41]">{usernameChecks.filter((check: any) => check.status === 'FOUND').length}</div></div>
            </>
          ) : (
            <>
              <div className="cyber-panel rounded-xl border border-[#1a2620] p-4"><ShieldCheck size={15} className="mb-2 text-[#a855f7]" /><div className="font-mono text-[10px] uppercase tracking-widest text-[#6b7f74]">Score</div><div className="mt-1 font-mono text-sm font-bold text-[#e2e8e4]">{data.consistency_score || 'N/A'}</div></div>
              <div className="cyber-panel rounded-xl border border-[#1a2620] p-4"><Database size={15} className="mb-2 text-[#f59e0b]" /><div className="font-mono text-[10px] uppercase tracking-widest text-[#6b7f74]">Captured</div><div className="mt-1 font-mono text-sm font-bold text-[#e2e8e4]">{data.timestamp ? new Date(data.timestamp).toLocaleDateString() : '—'}</div></div>
            </>
          )}
        </div>

        <div className="cyber-panel rounded-2xl border border-[#1a2620] p-4 md:p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#6b7f74]"><Activity size={14} style={{ color: meta.color }} /> Record metadata</div>
          <div className="grid gap-x-8 md:grid-cols-2">
            {detailFields.map(key => (
              <div key={key} className="flex min-w-0 items-center justify-between gap-4 border-t border-[#1a2620] py-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#6b7f74]">{formatLabel(key)}</span>
                <span className="truncate text-right font-mono text-xs text-[#e2e8e4]">{String(valueFor(key))}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="cyber-panel overflow-hidden rounded-2xl border border-[#1a2620]">
          <button onClick={() => setJsonOpen(!jsonOpen)} className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-[#080d0a]">
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#6b7f74]"><Database size={14} className="text-[#00d4ff]" /> Raw operation payload</span>
            {jsonOpen ? <ChevronUp size={14} className="text-[#3d4f46]" /> : <ChevronDown size={14} className="text-[#3d4f46]" />}
          </button>
          {jsonOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden border-t border-[#1a2620]">
              <pre className="max-h-[420px] overflow-auto p-5 font-mono text-[10px] leading-relaxed text-[#6b7f74]">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
