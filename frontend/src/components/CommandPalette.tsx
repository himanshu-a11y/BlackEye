import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Globe, Network, Phone, User, History, Settings, Info, Zap, ShieldCheck } from 'lucide-react';

const COMMANDS = [
  { id: 'ip',       label: 'IP Geolocation',     desc: 'Analyze any IPv4 or IPv6 address',   icon: Globe,       path: '/ip',       shortcut: 'G' },
  { id: 'myip',     label: 'Detect My Public IP', desc: 'Discover your current public IP',    icon: Zap,         path: '/ip?detect=1', shortcut: 'D' },
  { id: 'network',  label: 'Network Intelligence',desc: 'ASN, ISP, routing analysis',         icon: Network,     path: '/network',  shortcut: 'N' },
  { id: 'domain',   label: 'Domain Recon & Audit',desc: 'DNS, SSL certificate & header audit', icon: ShieldCheck, path: '/domain',   shortcut: 'O' },
  { id: 'phone',    label: 'Phone Intelligence',  desc: 'Phone number metadata lookup',       icon: Phone,       path: '/phone',    shortcut: 'P' },
  { id: 'username', label: 'Username Enumeration',desc: 'Check username across 30+ platforms',icon: User,        path: '/username', shortcut: 'U' },
  { id: 'history',  label: 'Test History',        desc: 'View all past tests',               icon: History,     path: '/history',  shortcut: 'H' },
  { id: 'settings', label: 'Settings',            desc: 'Configure providers & appearance',  icon: Settings,    path: '/settings', shortcut: 'S' },
  { id: 'about',    label: 'About & Methodology', desc: 'How BlackEye works',                icon: Info,        path: '/about',    shortcut: 'A' },
];

interface Props { open: boolean; onClose: () => void; }

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (open) { setQuery(''); setSelected(0); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => { setSelected(0); }, [query]);

  const go = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => (s + 1) % filtered.length); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => (s - 1 + filtered.length) % filtered.length); }
    if (e.key === 'Enter' && filtered[selected]) go(filtered[selected].path);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-lg z-50"
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-[#0d1110] border border-[#00ff4130] rounded-xl overflow-hidden shadow-2xl glow-green">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1a2620]">
                <Search size={14} className="text-[#00ff41] flex-shrink-0" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent font-mono text-sm text-[#e2e8e4] placeholder-[#3d4f46] border-none outline-none"
                />
                <div className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-[#1a2620] rounded font-mono text-[10px] text-[#6b7f74]">ESC</kbd>
                </div>
              </div>
              {/* Label */}
              <div className="px-4 py-2 border-b border-[#0d1110]">
                <span className="font-mono text-[10px] text-[#3d4f46] tracking-widest">BlackEye — COMMAND CENTER</span>
              </div>
              {/* Results */}
              <div className="max-h-80 overflow-y-auto">
                {filtered.map((cmd, i) => (
                  <motion.button
                    key={cmd.id}
                    onClick={() => go(cmd.path)}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                      selected === i ? 'bg-[#00ff4110]' : 'hover:bg-[#0d1110]'
                    }`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selected === i ? 'bg-[#00ff4120] text-[#00ff41]' : 'bg-[#1a2620] text-[#6b7f74]'
                    }`}>
                      <cmd.icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-mono text-sm ${selected === i ? 'text-[#00ff41]' : 'text-[#e2e8e4]'}`}>
                        {cmd.label}
                      </div>
                      <div className="font-mono text-xs text-[#3d4f46] truncate">{cmd.desc}</div>
                    </div>
                    {selected === i && (
                      <kbd className="px-1.5 py-0.5 bg-[#1a2620] rounded font-mono text-[10px] text-[#00ff41]">↵</kbd>
                    )}
                  </motion.button>
                ))}
                {filtered.length === 0 && (
                  <div className="px-4 py-8 text-center font-mono text-xs text-[#3d4f46]">
                    No commands found for "{query}"
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
