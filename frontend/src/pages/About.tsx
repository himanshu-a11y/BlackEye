import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const FAQS = [
  { q: 'What is IP Geolocation?', a: 'IP geolocation is the process of estimating the geographic location of an internet-connected device using its IP address. Databases maintained by companies like MaxMind map IP ranges to approximate locations based on network registration data.' },
  { q: 'Why is IP Geolocation NOT exact?', a: 'IP addresses are assigned to ISPs and organizations — not to individual buildings or people. An ISP in Mumbai might serve customers across 100km. VPNs, CGNAT, and mobile networks add further inaccuracy. Expect city-level accuracy at best, and often only country-level.' },
  { q: 'What is an ASN?', a: 'An Autonomous System Number (ASN) is a unique identifier for a group of IP address ranges under a single routing policy, typically owned by one organization (ISP, university, corporation, or cloud provider).' },
  { q: 'What is CGNAT?', a: 'Carrier-Grade NAT shares a single public IP among many subscribers. This means multiple people in different locations can appear to have the same IP, making geolocation unreliable for such networks.' },
  { q: 'What is a VPN?', a: 'A VPN (Virtual Private Network) routes your traffic through a server in a different location. Your apparent IP will be the VPN server\'s IP, not your real one. This is a primary reason IP geolocation is unreliable.' },
  { q: 'IP Geolocation ≠ GPS', a: 'GPS uses satellite signals to provide device-level precision (meters). IP geolocation uses network databases to estimate city/region-level location. They are completely different technologies with vastly different accuracy levels.' },
];

const ROADMAP = [
  { version: 'v1.0', label: 'Current', items: ['IP Geolocation', 'Public IP Discovery', 'Network Intelligence', 'Phone Metadata', 'Username Enumeration', 'Test History', 'Provider Consistency'], done: true },
  { version: 'v2.0', label: 'Planned', items: ['Consent-Based Browser Geolocation', 'Real-time location visualization', 'Advanced network analysis'], done: false },
  { version: 'v3.0', label: 'Future', items: ['Additional intelligence providers', 'Advanced reporting', 'PDF reports', 'Team workspace'], done: false },
];

export default function About() {
  return (
    <PageTransition>
      <div className="min-h-screen w-full max-w-6xl mx-auto space-y-8 px-4 py-5 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Info size={16} className="text-[#00ff41]" />
            <h1 className="font-sans text-2xl font-bold tracking-tight text-[#e2e8e4]">About &amp; Methodology</h1>
          </div>
          <p className="font-mono text-xs text-[#3d4f46]">How BlackEye works and what its limitations are.</p>
        </div>

        {/* Key principle */}
        <div className="rounded-2xl border border-[#00ff4130] bg-[#0b120e] p-8 text-center shadow-[0_18px_45px_rgba(0,0,0,0.25)] glow-green md:p-10">
          <div className="font-mono font-bold text-3xl text-[#00ff41] text-glow-green mb-3">BlackEye</div>
          <div className="font-mono text-[#00d4ff] text-lg mb-4">Observe. Analyze. Verify.</div>
          <div className="font-mono text-xs text-[#6b7f74] space-y-1">
            <p>Never fabricate. Never overclaim.</p>
            <p>Always show the limitations of the data.</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="font-mono text-sm text-[#e2e8e4] tracking-wider">METHODOLOGY &amp; EDUCATION</h2>
          <div className="grid gap-4 lg:grid-cols-2">
          {FAQS.map((f, i) => (
            <motion.div key={f.q} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-[#0d1110] border border-[#1a2620] rounded-xl p-5">
              <h3 className="font-mono text-sm text-[#00d4ff] mb-2">{f.q}</h3>
              <p className="font-mono text-xs text-[#6b7f74] leading-relaxed">{f.a}</p>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="space-y-4">
          <h2 className="font-mono text-sm text-[#e2e8e4] tracking-wider">ROADMAP</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {ROADMAP.map((r, i) => (
              <motion.div key={r.version} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className={`bg-[#0d1110] border rounded-xl p-4 ${r.done ? 'border-[#00ff4130]' : 'border-[#1a2620]'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono font-bold text-sm text-[#e2e8e4]">{r.version}</span>
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${r.done ? 'text-[#00ff41] bg-[#00ff4110] border-[#00ff4130]' : 'text-[#3d4f46] border-[#1a2620]'}`}>
                    {r.label}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {r.items.map(item => (
                    <li key={item} className="flex items-center gap-2 font-mono text-[10px] text-[#6b7f74]">
                      <span className={r.done ? 'text-[#00ff41]' : 'text-[#3d4f46]'}>
                        {r.done ? '✓' : '○'}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Authorized use */}
        <div className="bg-[#0d1110] border border-[#f59e0b30] rounded-xl p-5">
          <h3 className="font-mono text-xs text-[#f59e0b] mb-3 tracking-wider">AUTHORIZED USE ONLY</h3>
          <p className="font-mono text-xs text-[#6b7f74] leading-relaxed">
            BlackEye is built for educational purposes and authorized security research only.
            All IP intelligence uses publicly available network registration data.
            This tool does not perform covert tracking, credential harvesting, or any unauthorized access.
            Use responsibly and in accordance with applicable laws.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
