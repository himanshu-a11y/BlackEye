import { useEffect, useRef } from 'react';
import Globe from 'globe.gl';

interface CyberGlobeProps {
  targetLat: number | null;
  targetLng: number | null;
  targetIp: string | null;
  isScanning: boolean;
  onAltitudeChange: (altitudeKm: number) => void;
}



export default function CyberGlobe({ targetLat, targetLng, targetIp, isScanning, onAltitudeChange }: CyberGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Globe.gl with realistic night earth & atmospheric illumination
    const globe = (Globe as any)()(containerRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
      .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
      .showAtmosphere(true)
      .atmosphereColor('#00d4ff')
      .atmosphereAltitude(0.22)
      .arcsData([])
      .ringsData([])
      .ringColor(() => '#ef4444')
      .ringMaxRadius(14)
      .ringPropagationSpeed(3.5)
      .ringRepeatPeriod(700);

    // Auto rotate by default (Tactical Cyber Recon style)
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.enableZoom = true;

    const syncAltitude = () => {
      const distance = globe.camera().position.length();
      onAltitudeChange(Math.max(0, Math.round((distance - 1) * 6371)));
    };
    controls.addEventListener('change', syncAltitude);
    syncAltitude();

    // Adjust sizing
    const handleResize = () => {
      if (containerRef.current) {
        globe.width(containerRef.current.clientWidth);
        globe.height(containerRef.current.clientHeight);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    globeInstanceRef.current = globe;

    return () => {
      window.removeEventListener('resize', handleResize);
      controls.removeEventListener('change', syncAltitude);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [onAltitudeChange]);

  // Handle target focus when lat/lng are provided
  useEffect(() => {
    const globe = globeInstanceRef.current;
    if (!globe) return;

    const controls = globe.controls();

    if (targetLat !== null && targetLng !== null && !isScanning) {
      // Pause auto-rotation when focusing target
      controls.autoRotate = false;

      // Add target ring & pulsing beacon
      globe
        .ringsData([
          { lat: targetLat, lng: targetLng },
          { lat: targetLat, lng: targetLng }
        ])
        .htmlElementsData([
          { lat: targetLat, lng: targetLng, name: targetIp }
        ])
        .htmlElement(() => {
          const el = document.createElement('div');
          el.className = 'cyber-target-marker';
          el.innerHTML = `
            <div class="cyber-target-pulse"></div>
            <div class="cyber-target-ring"></div>
            <div class="cyber-target-crosshair"></div>
            <div class="cyber-target-center"></div>
          `;
          return el;
        });

      globe.arcsData([]);

      // Fly camera smoothly to target location and zoom in close
      globe.pointOfView(
        { lat: targetLat, lng: targetLng, altitude: 0.2 },
        2500 // 2.5 second smooth flight & zoom animation
      );
    } else if (isScanning) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 3.0; // Fast scan spin
    } else {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      globe.arcsData([]);
      globe.ringsData([]);
      globe.htmlElementsData([]);
    }
  }, [targetLat, targetLng, targetIp, isScanning]);

  return <div ref={containerRef} className="w-full h-full bg-[#050505]" />;
}
