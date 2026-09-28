import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Shield, Radio, Sparkles } from 'lucide-react';

interface RadarTarget {
  id: string;
  ip: string;
  host: string;
  location: string;
  countryCode: string;
  status: 'ONLINE' | 'ANALYZED' | 'THREAT_LOW' | 'ACTIVE';
  angle: number; // degrees 0-360
  distance: number; // percentage from center 0.25 - 0.88
  latency: number;
}

const DEFAULT_TARGETS: RadarTarget[] = [
  { id: 't1', ip: '1.1.1.1', host: 'one.one.one.one', location: 'Brisbane, AU', countryCode: 'AU', status: 'ACTIVE', angle: 42, distance: 0.38, latency: 12 },
  { id: 't2', ip: '8.8.8.8', host: 'dns.google', location: 'Ashburn, US', countryCode: 'US', status: 'ONLINE', angle: 130, distance: 0.62, latency: 24 },
  { id: 't3', ip: '140.82.121.4', host: 'github.com', location: 'San Francisco, US', countryCode: 'US', status: 'ANALYZED', angle: 215, distance: 0.52, latency: 45 },
  { id: 't4', ip: '104.21.58.12', host: 'cloudflare.net', location: 'Frankfurt, DE', countryCode: 'DE', status: 'ACTIVE', angle: 295, distance: 0.78, latency: 18 },
  { id: 't5', ip: '185.199.108.153', host: 'cdn.jsdelivr.net', location: 'London, GB', countryCode: 'GB', status: 'ONLINE', angle: 340, distance: 0.44, latency: 31 },
];

export default function CyberRadarHUD() {
  const navigate = useNavigate();
  const [activeTarget, setActiveTarget] = useState<RadarTarget | null>(null);
  const [azimuth, setAzimuth] = useState(0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Azimuth rotation tracker for readout
  useEffect(() => {
    const interval = setInterval(() => {
      setAzimuth(prev => (prev + 2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  return (
    <div
      className="relative w-full max-w-[340px] md:max-w-[380px] aspect-square mx-auto select-none group"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Outer ambient glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00ff4115] via-[#00d4ff10] to-[#a855f715] blur-2xl pointer-events-none -z-10 group-hover:opacity-100 opacity-60 transition-opacity duration-700" />

      {/* Outer Tactical Bezel / Hex Bracket Frame */}
      <div className="absolute inset-0 rounded-full border border-[#00ff4130] bg-[#060c08]/80 backdrop-blur-xl shadow-[inset_0_0_40px_rgba(0,0,0,0.8),0_0_30px_rgba(0,255,65,0.08)] overflow-hidden">

        {/* Rotating Compass Tick Marks Ring */}
        <div className="absolute inset-2 rounded-full border border-[#1a2e23] pointer-events-none">
          {/* Degree Ticks */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => (
            <div
              key={deg}
              className="absolute w-full h-full left-0 top-0 flex flex-col justify-between items-center pointer-events-none"
              style={{ transform: `rotate(${deg}deg)` }}
            >
              <div className="w-[1px] h-2 bg-[#00ff4150]" />
              <div className="w-[1px] h-2 bg-[#00ff4150]" />
            </div>
          ))}
        </div>

        {/* Concentric Range Rings */}
        <div className="absolute inset-[15%] rounded-full border border-[#00ff4120] pointer-events-none" />
        <div className="absolute inset-[30%] rounded-full border border-[#00ff4125] border-dashed pointer-events-none" />
        <div className="absolute inset-[45%] rounded-full border border-[#00ff4120] pointer-events-none" />
        <div className="absolute inset-[60%] rounded-full border border-[#00ff4130] pointer-events-none" />
        
        {/* Cardinal Axis Crosshairs */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[#00ff4130] to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] -translate-y-1/2 bg-gradient-to-r from-transparent via-[#00ff4130] to-transparent pointer-events-none" />

        {/* 45-degree diagonal grid lines */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 rotate-45 bg-[#00ff4110] pointer-events-none" />
        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 -rotate-45 bg-[#00ff4110] pointer-events-none" />

        {/* Radar Range Labels */}
        <div className="absolute top-[16%] left-1/2 -translate-x-1/2 font-mono text-[8px] text-[#00ff4160] tracking-wider pointer-events-none">
          3000 KM
        </div>
        <div className="absolute top-[31%] left-1/2 -translate-x-1/2 font-mono text-[8px] text-[#00ff4160] tracking-wider pointer-events-none">
          1500 KM
        </div>
        <div className="absolute top-[46%] left-1/2 -translate-x-1/2 font-mono text-[8px] text-[#00ff4160] tracking-wider pointer-events-none">
          500 KM
        </div>

        {/* Animated Rotating Radar Sweep Cone */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none origin-center"
          style={{
            animation: 'radar-sweep 4s linear infinite',
            background: 'conic-gradient(from 0deg, rgba(0, 255, 65, 0.35) 0deg, rgba(0, 255, 65, 0.12) 28deg, rgba(0, 212, 255, 0.03) 55deg, transparent 75deg)',
          }}
        />

        {/* Outer Pulsing Echo Ring */}
        <div className="absolute inset-0 rounded-full border border-[#00ff41] opacity-30 animate-ping pointer-events-none" style={{ animationDuration: '3.5s' }} />

        {/* Interactive Target Blips */}
        {DEFAULT_TARGETS.map(target => {
          const rad = (target.angle - 90) * (Math.PI / 180);
          const radiusPercent = target.distance * 50; // max 50% from center
          const leftPercent = 50 + radiusPercent * Math.cos(rad);
          const topPercent = 50 + radiusPercent * Math.sin(rad);

          const isHovered = activeTarget?.id === target.id;

          return (
            <div
              key={target.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
              onMouseEnter={() => setActiveTarget(target)}
              onMouseLeave={() => setActiveTarget(null)}
              onClick={() => navigate(`/ip?target=${target.ip}`)}
            >
              {/* Target Blip Ping Ring */}
              <div className="absolute -inset-2 rounded-full border border-[#00ff4180] animate-ping pointer-events-none" style={{ animationDuration: '2s' }} />
              
              {/* Target Dot */}
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-transform duration-200 ${
                  isHovered ? 'scale-150 shadow-[0_0_15px_#00ff41]' : 'scale-100 hover:scale-125'
                }`}
                style={{
                  background: isHovered
                    ? '#00ff41'
                    : target.status === 'ACTIVE'
                    ? 'radial-gradient(circle, #00d4ff 40%, #00ff41 100%)'
                    : '#00ff41',
                  boxShadow: '0 0 10px rgba(0,255,65,0.8)',
                }}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#050505]" />
              </div>

              {/* Mini Target Tag */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-[#06110a]/90 border border-[#00ff4140] pointer-events-none whitespace-nowrap opacity-80 group-hover:opacity-100 transition-opacity">
                <span className="font-mono text-[8px] text-[#00ff41] font-semibold tracking-wide">
                  {target.ip}
                </span>
              </div>
            </div>
          );
        })}

        {/* Center Target Core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-[#00ff41] flex items-center justify-center pointer-events-none bg-[#0a180e]">
          <div className="w-2 h-2 rounded-full bg-[#00d4ff] pulse-dot shadow-[0_0_8px_#00d4ff]" />
          <div className="absolute -inset-1 rounded-full border border-[#00d4ff40] animate-pulse" />
        </div>

        {/* Mouse Interactive Reticle */}
        {mousePos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute pointer-events-none z-30 -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${50 + mousePos.x * 45}%`,
              top: `${50 + mousePos.y * 45}%`,
            }}
          >
            <div className="w-8 h-8 rounded-full border border-[#00d4ff70] flex items-center justify-center">
              <Crosshair size={14} className="text-[#00d4ff] animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </motion.div>
        )}

        {/* Corner HUD Data Readouts */}
        <div className="absolute top-3 left-4 pointer-events-none flex items-center gap-1.5">
          <Radio size={10} className="text-[#00ff41] animate-pulse" />
          <span className="font-mono text-[9px] text-[#00ff41] tracking-widest font-semibold">
            AZIMUTH {String(azimuth).padStart(3, '0')}°
          </span>
        </div>

        <div className="absolute top-3 right-4 pointer-events-none flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff] pulse-dot" />
          <span className="font-mono text-[9px] text-[#00d4ff] tracking-widest font-semibold">
            4.2 RPM
          </span>
        </div>

        <div className="absolute bottom-3 left-4 pointer-events-none">
          <span className="font-mono text-[8px] text-[#6b7f74] tracking-widest">
            TARGETS: <strong className="text-[#00ff41]">{DEFAULT_TARGETS.length} ACTIVE</strong>
          </span>
        </div>

        <div className="absolute bottom-3 right-4 pointer-events-none">
          <span className="font-mono text-[8px] text-[#6b7f74] tracking-widest">
            SCOPE: <strong className="text-[#e2e8e4]">GLOBAL</strong>
          </span>
        </div>
      </div>

      {/* Target Detail Popover Card when hovering a target blip */}
      <AnimatePresence>
        {activeTarget && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-40 w-64 p-3 rounded-xl bg-[#09140e]/95 backdrop-blur-md border border-[#00ff4150] shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(0,255,65,0.2)]"
          >
            <div className="flex items-center justify-between border-b border-[#1a2f22] pb-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                <Shield size={12} className="text-[#00ff41]" />
                <span className="font-mono text-xs font-bold text-[#e2e8e4] tracking-wide">
                  {activeTarget.ip}
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-[#00ff4118] text-[#00ff41] border border-[#00ff4130]">
                {activeTarget.status}
              </span>
            </div>

            <div className="space-y-1 font-mono text-[10px]">
              <div className="flex justify-between text-[#6b7f74]">
                <span>Host:</span>
                <span className="text-[#00d4ff] truncate max-w-[140px]">{activeTarget.host}</span>
              </div>
              <div className="flex justify-between text-[#6b7f74]">
                <span>Location:</span>
                <span className="text-[#e2e8e4]">{activeTarget.location}</span>
              </div>
              <div className="flex justify-between text-[#6b7f74]">
                <span>Latency / Ping:</span>
                <span className="text-[#00ff41]">{activeTarget.latency} ms</span>
              </div>
            </div>

            <div className="mt-2 pt-1.5 border-t border-[#1a2f22] flex items-center justify-between">
              <span className="font-mono text-[8px] text-[#6b7f74]">Click to run deep inspection</span>
              <Sparkles size={10} className="text-[#00ff41] animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
