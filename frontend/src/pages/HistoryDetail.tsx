import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
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

  return (
    <PageTransition>
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-mono text-xs text-[#6b7f74] hover:text-[#00ff41] transition-colors">
          <ArrowLeft size={14} /> BACK
        </button>
        <div>
          <h1 className="font-mono font-bold text-lg text-[#e2e8e4]">TEST DETAILS</h1>
          <p className="font-mono text-xs text-[#3d4f46]">{data.test_id}</p>
        </div>
        <div className="bg-[#0d1110] border border-[#1a2620] rounded-xl p-5 space-y-2">
          {Object.entries(data).filter(([k]) => k !== 'raw_providers').map(([k, v]) => (
            <div key={k} className="flex justify-between py-1.5 border-b border-[#1a2620] last:border-0">
              <span className="font-mono text-xs text-[#6b7f74]">{k.toUpperCase()}</span>
              <span className="font-mono text-xs text-[#e2e8e4] text-right max-w-xs truncate">
                {typeof v === 'object' ? JSON.stringify(v) : String(v ?? '—')}
              </span>
            </div>
          ))}
        </div>
        {/* Raw JSON */}
        <div className="bg-[#0d1110] border border-[#1a2620] rounded-xl overflow-hidden">
          <button onClick={() => setJsonOpen(!jsonOpen)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-[#080808] transition-colors">
            <span className="font-mono text-xs text-[#6b7f74]">RAW NORMALIZED DATA</span>
            {jsonOpen ? <ChevronUp size={14} className="text-[#3d4f46]" /> : <ChevronDown size={14} className="text-[#3d4f46]" />}
          </button>
          {jsonOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="overflow-hidden border-t border-[#1a2620]">
              <pre className="p-5 font-mono text-[10px] text-[#6b7f74] overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
