import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';

import BootSplash from './components/BootSplash';
import Layout from './components/Layout';
import CommandPalette from './components/CommandPalette';
import Dashboard from './pages/Dashboard';
import IpGeolocation from './pages/IpGeolocation';
import NetworkIntelligence from './pages/NetworkIntelligence';
import PhoneIntelligence from './pages/PhoneIntelligence';
import UsernameEnum from './pages/UsernameEnum';
import DomainRecon from './pages/DomainRecon';
import History from './pages/History';
import HistoryDetail from './pages/HistoryDetail';
import Settings from './pages/Settings';
import About from './pages/About';

export default function App() {
  const [booted, setBooted] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(v => !v);
      }
      if (e.key === 'Escape') setCmdOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <>
      <div className="scan-line" />
      <AnimatePresence mode="wait">
        {!booted ? (
          <BootSplash key="boot" onComplete={() => setBooted(true)} />
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <BrowserRouter>
              <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
              <Layout onOpenCmd={() => setCmdOpen(true)}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/ip" element={<IpGeolocation />} />
                    <Route path="/network" element={<NetworkIntelligence />} />
                    <Route path="/domain" element={<DomainRecon />} />
                    <Route path="/phone" element={<PhoneIntelligence />} />
                    <Route path="/username" element={<UsernameEnum />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/history/:id" element={<HistoryDetail />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/about" element={<About />} />
                  </Routes>
                </AnimatePresence>
              </Layout>
            </BrowserRouter>
          </motion.div>
        )}
      </AnimatePresence>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0d1110',
            color: '#e2e8e4',
            border: '1px solid #1a2620',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#00ff41', secondary: '#0d1110' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#0d1110' } },
        }}
      />
    </>
  );
}
