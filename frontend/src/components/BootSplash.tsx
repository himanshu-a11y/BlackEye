import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BOOT_LINES = [
  { text: 'INITIALIZING BlackEye v1.0...', delay: 0 },
  { text: '', delay: 300 },
  { text: '[✓] SECURITY KERNEL         LOADED', delay: 500,  color: '#00ff41' },
  { text: '[✓] API ENGINE               ONLINE', delay: 800,  color: '#00ff41' },
  { text: '[✓] PROVIDER MESH           READY',  delay: 1100, color: '#00ff41' },
  { text: '[✓] GEOLOCATION ENGINE      READY',  delay: 1400, color: '#00ff41' },
  { text: '[✓] DATABASE                 ONLINE', delay: 1700, color: '#00ff41' },
  { text: '[✓] NETWORK ANALYZER        STANDBY', delay: 2000, color: '#00ff41' },
  { text: '[✓] SECURITY CHECK          PASSED',  delay: 2300, color: '#00ff41' },
  { text: '', delay: 2600 },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', delay: 2700 },
  { text: '  BlackEye READY — OBSERVE. ANALYZE. VERIFY.', delay: 2900, color: '#00d4ff' },
  { text: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', delay: 3000 },
];

const LOGO_CHARS = 'BlackEye'.split('');
const SEGMENTS = 12;
const MATRIX_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ';

interface Props { onComplete: () => void; }

export default function BootSplash({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [visibleChars, setVisibleChars] = useState<number[]>([]);
  const [filledSegs,   setFilledSegs]   = useState(0);
  const [done, setDone] = useState(false);
  const [flicker, setFlicker] = useState(false);

  /* ── Matrix Rain ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const fontSize = 13;
    let drops: number[] = [];
    const initDrops = () => {
      const cols = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -50);
    };
    initDrops();
    window.addEventListener('resize', initDrops);

    const draw = () => {
      ctx.fillStyle = 'rgba(5,5,5,0.055)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      drops.forEach((y, i) => {
        const ch = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const bright = Math.random() > 0.92;
        ctx.fillStyle = bright ? 'rgba(0,255,65,0.95)' : 'rgba(0,255,65,0.25)';
        ctx.fillText(ch, i * fontSize, y * fontSize);
        if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i] += 0.5;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('resize', initDrops);
    };
  }, []);

  /* ── Boot sequence ── */
  useEffect(() => {
    // Letter-by-letter logo
    LOGO_CHARS.forEach((_, i) =>
      setTimeout(() => setVisibleChars(v => [...v, i]), 150 + i * 120)
    );

    // Terminal lines
    BOOT_LINES.forEach((_, i) =>
      setTimeout(() => {
        setVisibleLines(v => [...v, i]);
        const pct = Math.round(((i + 1) / BOOT_LINES.length) * SEGMENTS);
        setFilledSegs(pct);
      }, BOOT_LINES[i].delay)
    );

    // Flicker + exit
    setTimeout(() => setFlicker(true),   3400);
    setTimeout(() => setDone(true),       3600);
    setTimeout(onComplete,               4200);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] overflow-hidden ${flicker ? 'flicker' : ''}`}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6 }}
        >
          {/* Matrix rain canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 opacity-20 pointer-events-none"
          />

          {/* Vignette overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, #050505 100%)'
            }}
          />

          <div className="relative z-10 flex flex-col items-center w-full px-6">
            {/* Radar */}
            <div className="relative w-28 h-28 mb-8 flex-shrink-0">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className="absolute rounded-full border border-[#00ff41]"
                  style={{
                    inset: `${i * 7}px`,
                    opacity: 0.15 + i * 0.1
                  }}
                />
              ))}
              {/* Sweep */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="radar-sweep absolute top-1/2 left-1/2 w-full h-0.5 origin-left"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.9))',
                    transformOrigin: '0 50%',
                  }}
                />
              </div>
              {/* Ripple rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-3 h-3">
                  <div className="w-3 h-3 rounded-full bg-[#00ff41] pulse-dot" />
                  <div className="ripple-anim absolute inset-0 rounded-full border border-[#00ff41] opacity-50" />
                </div>
              </div>
            </div>

            {/* Letter-by-letter logo */}
            <div className="flex mb-1">
              {LOGO_CHARS.map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
                  animate={visibleChars.includes(i)
                    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                    : {}
                  }
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="font-mono font-bold text-4xl text-[#00ff41] tracking-[0.25em]"
                  style={{
                    textShadow: visibleChars.includes(i)
                      ? '0 0 10px rgba(0,255,65,1), 0 0 30px rgba(0,255,65,0.5), 0 0 60px rgba(0,255,65,0.2)'
                      : 'none'
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>
            <div className="font-mono text-[10px] text-[#3d4f46] tracking-[0.6em] mb-8 uppercase">
              Security Testing &amp; Network Intelligence
            </div>

            {/* Terminal box */}
            <div className="w-full max-w-xl bg-[#080808] border border-[#1a2620] rounded-xl overflow-hidden shadow-2xl"
              style={{ boxShadow: '0 0 60px rgba(0,255,65,0.06), 0 30px 80px rgba(0,0,0,0.8)' }}
            >
              {/* Window chrome */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#050505] border-b border-[#1a2620]">
                <div className="w-3 h-3 rounded-full bg-[#ef4444] opacity-80" />
                <div className="w-3 h-3 rounded-full bg-[#f59e0b] opacity-80" />
                <div className="w-3 h-3 rounded-full bg-[#00ff41] opacity-80" />
                <span className="ml-2 font-mono text-[10px] text-[#3d4f46]">blackeye_boot.sh</span>
              </div>

              <div className="p-5 space-y-0.5 min-h-[220px]">
                {BOOT_LINES.map((line, i) => (
                  <AnimatePresence key={i}>
                    {visibleLines.includes(i) && (
                      <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.15 }}
                        className="font-mono text-xs leading-5"
                        style={{ color: line.color || '#3d4f46' }}
                      >
                        {line.text || '\u00a0'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
                <span className="inline-block w-2 h-3.5 bg-[#00ff41] cursor-blink align-middle" />
              </div>
            </div>

            {/* Segmented progress bar */}
            <div className="w-full max-w-xl mt-4">
              <div className="flex justify-between font-mono text-[10px] text-[#3d4f46] mb-2">
                <span>LOADING SYSTEM</span>
                <span>{Math.round((filledSegs / SEGMENTS) * 100)}%</span>
              </div>
              <div className="progress-segments">
                {Array.from({ length: SEGMENTS }).map((_, i) => (
                  <div
                    key={i}
                    className={`progress-seg ${i < filledSegs ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
