import { motion } from 'framer-motion';
import { Settings as Cfg, Server, Database, Palette } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const PROVIDERS = [
  { name: 'ip-api.com',  status: 'CONNECTED', note: 'Free tier — 45 req/min' },
  { name: 'ipwho.is',   status: 'CONNECTED', note: 'Free — no key needed' },
  { name: 'ipinfo.io',  status: 'CONNECTED', note: 'Free tier — 50k/month' },
];

export default function Settings() {
  return (
    <PageTransition>
      <div className="min-h-screen w-full max-w-5xl mx-auto space-y-8 px-4 py-5 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Cfg size={16} className="text-[#00ff41]" />
            <h1 className="font-sans text-2xl font-bold tracking-tight text-[#e2e8e4]">Settings</h1>
          </div>
          <p className="font-mono text-xs text-[#3d4f46]">Configure providers, appearance, and data management.</p>
        </div>

        {/* Providers */}
        <div className="rounded-2xl border border-[#294333] bg-[#0b120e] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.25)] md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server size={13} className="text-[#00ff41]" />
            <span className="font-mono text-xs text-[#e2e8e4] tracking-wider">API CONFIGURATION</span>
          </div>
          <div className="space-y-3">
            {PROVIDERS.map((p, i) => (
              <motion.div key={p.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between py-2 border-b border-[#1a2620] last:border-0">
                <div>
                  <div className="font-mono text-sm text-[#e2e8e4]">{p.name}</div>
                  <div className="font-mono text-[10px] text-[#3d4f46]">{p.note}</div>
                </div>
                <span className="font-mono text-[10px] text-[#00ff41] bg-[#00ff4110] border border-[#00ff4130] px-2 py-0.5 rounded">
                  {p.status}
                </span>
              </motion.div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[10px] text-[#3d4f46]">
            API keys are stored in backend <code className="text-[#00d4ff]">.env</code> — never exposed to the client.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
        {/* Appearance */}
        <div className="rounded-2xl border border-[#294333] bg-[#0b120e] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.25)] md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={13} className="text-[#00d4ff]" />
            <span className="font-mono text-xs text-[#e2e8e4] tracking-wider">APPEARANCE</span>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#00ff4110] border border-[#00ff4130] rounded-lg cursor-pointer">
              <div className="w-3 h-3 rounded-full bg-[#00ff41]" />
              <span className="font-mono text-xs text-[#00ff41]">Dark (Default)</span>
            </div>
          </div>
          <p className="mt-3 font-mono text-[10px] text-[#3d4f46]">
            BlackEye is optimized for the dark cybersecurity theme. Additional themes in v2.0.
          </p>
        </div>

        {/* Data */}
        <div className="rounded-2xl border border-[#294333] bg-[#0b120e] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.25)] md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database size={13} className="text-[#f59e0b]" />
            <span className="font-mono text-xs text-[#e2e8e4] tracking-wider">DATA MANAGEMENT</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="/history" className="px-4 py-2 border border-[#1a2620] rounded-lg font-mono text-xs text-[#6b7f74] hover:text-[#00ff41] hover:border-[#00ff4130] transition-all">
              View History →
            </a>
          </div>
          <p className="mt-4 font-mono text-[10px] text-[#3d4f46]">
            All data is stored locally in SQLite. No data is sent to third parties beyond IP intelligence queries.
          </p>
        </div>
        </div>
      </div>
    </PageTransition>
  );
}
