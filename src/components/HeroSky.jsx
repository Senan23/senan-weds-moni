import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/* Deterministic cloud layout — spread across full screen height */
const CLOUD_POSITIONS = [
  { top: 2, scale: 1.2 }, { top: 10, scale: 0.7 }, { top: 18, scale: 1.0 },
  { top: 25, scale: 0.6 }, { top: 32, scale: 1.3 }, { top: 40, scale: 0.8 },
  { top: 48, scale: 1.1 }, { top: 55, scale: 0.5 }, { top: 62, scale: 0.9 },
  { top: 70, scale: 1.4 }, { top: 78, scale: 0.7 }, { top: 85, scale: 1.0 },
  { top: 15, scale: 0.8 }, { top: 45, scale: 1.1 }, { top: 72, scale: 0.6 },
];

/* Lantern configs — float upward (reduced) */
const LANTERN_CONFIGS = [
  { left: 15, delay: 0, dur: 20, size: 28 },
  { left: 70, delay: 6, dur: 24, size: 24 },
];

/* Kite configs — drift across sky (reduced) */
const KITE_CONFIGS = [
  { top: 18, color: '#FF6B6B', tailColor: '#FF6B6B', delay: 0, dur: 32 },
  { top: 55, color: '#4ECDC4', tailColor: '#4ECDC4', delay: 8, dur: 36 },
];

/* Bird flock configs */
const BIRD_CONFIGS = [
  { top: 8, scale: 0.7, delay: 0, dur: 18 },
  { top: 15, scale: 1.0, delay: 3, dur: 22 },
  { top: 22, scale: 0.5, delay: 7, dur: 16 },
  { top: 35, scale: 0.8, delay: 1, dur: 20 },
  { top: 50, scale: 0.6, delay: 5, dur: 25 },
  { top: 60, scale: 0.9, delay: 9, dur: 19 },
  { top: 42, scale: 0.55, delay: 12, dur: 21 },
];

/* CSS keyframes for scroll indicator bounce */
const scrollStyleId = 'scroll-indicator-styles';
if (typeof document !== 'undefined' && !document.getElementById(scrollStyleId)) {
  const style = document.createElement('style');
  style.id = scrollStyleId;
  style.textContent = `
    @keyframes scroll-bounce {
      0%, 100% { transform: translateY(0); opacity: 1; }
      50% { transform: translateY(10px); opacity: 0.5; }
    }
  `;
  document.head.appendChild(style);
}

export default function HeroSky() {
  const containerRef = useRef(null);
  const bannerPathRef = useRef(null);
  const ropePathRef = useRef(null);
  const cloudsRef = useRef([]);
  const lanternsRef = useRef([]);
  const kitesRef = useRef([]);
  const kiteStringsRef = useRef([]);
  const birdsRef = useRef([]);
  const birdWingsRef = useRef([]);
  const scrollIndicatorRef = useRef(null);
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    // 1. Slower right-to-left airplane motion
    const tl = gsap.timeline({ repeat: -1 });
    tl.fromTo(containerRef.current,
      { x: '110vw', y: '25dvh' },
      { x: '-350vw', y: '35dvh', duration: 45, ease: 'none' }
    );

    // 2. Rope wave animation
    gsap.to(ropePathRef.current, {
      duration: 0.8,
      attr: { d: "M0 30 Q 50 10, 100 30 T 200 30" },
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });

    // 3. Hyper-realistic cloth wind animation — multi-phase timeline
    const clothTl = gsap.timeline({ repeat: -1 });
    clothTl
      .to(bannerPathRef.current, {
        duration: 0.7,
        attr: { d: "M0 12 C 112 -8, 225 32, 337 5 C 450 -12, 562 35, 675 8 C 787 -8, 850 30, 900 12 L 900 108 C 850 120, 787 88, 675 112 C 562 125, 450 85, 337 108 C 225 122, 112 88, 0 108 Z" },
        ease: "sine.inOut"
      })
      .to(bannerPathRef.current, {
        duration: 0.6,
        attr: { d: "M0 22 C 112 30, 225 -5, 337 18 C 450 30, 562 -8, 675 22 C 787 32, 850 0, 900 22 L 900 98 C 850 85, 787 115, 675 95 C 562 82, 450 118, 337 98 C 225 85, 112 115, 0 98 Z" },
        ease: "sine.inOut"
      })
      .to(bannerPathRef.current, {
        duration: 0.8,
        attr: { d: "M0 8 C 112 -12, 225 28, 337 2 C 450 -15, 562 32, 675 5 C 787 -12, 850 25, 900 8 L 900 112 C 850 125, 787 85, 675 115 C 562 128, 450 82, 337 112 C 225 125, 112 85, 0 112 Z" },
        ease: "sine.inOut"
      })
      .to(bannerPathRef.current, {
        duration: 0.7,
        attr: { d: "M0 18 C 112 28, 225 0, 337 22 C 450 35, 562 -5, 675 18 C 787 28, 850 -2, 900 18 L 900 102 C 850 88, 787 118, 675 98 C 562 85, 450 120, 337 102 C 225 88, 112 118, 0 102 Z" },
        ease: "sine.inOut"
      })
      .to(bannerPathRef.current, {
        duration: 0.6,
        attr: { d: "M0 15 C 112 0, 225 25, 337 12 C 450 -2, 562 28, 675 15 C 787 2, 850 22, 900 15 L 900 105 C 850 118, 787 92, 675 108 C 562 120, 450 90, 337 105 C 225 118, 112 92, 0 105 Z" },
        ease: "sine.inOut"
      });

    // 4. Clouds scattered across full screen, some starting visible
    cloudsRef.current.forEach((cloud, i) => {
      if (!cloud) return;
      const startOnScreen = i < 6;

      const move = (first) => {
        const startX = first && startOnScreen
          ? (i * 15) % 80
          : 105 + Math.random() * 40;
        gsap.set(cloud, {
          x: `${startX}vw`,
          scale: CLOUD_POSITIONS[i].scale,
          opacity: first && startOnScreen ? 0.2 + Math.random() * 0.35 : 0
        });
        gsap.to(cloud, {
          x: '-30vw',
          opacity: 0.15 + Math.random() * 0.45,
          duration: 35 + Math.random() * 35,
          ease: 'none',
          onComplete: () => move(false)
        });
      };
      move(true);
    });

    // 5. Flying lanterns — float upward with gentle sway
    lanternsRef.current.forEach((lantern, i) => {
      if (!lantern) return;
      const cfg = LANTERN_CONFIGS[i];
      const floatUp = () => {
        gsap.set(lantern, { y: '110vh', opacity: 0 });
        gsap.to(lantern, {
          y: '-20vh',
          opacity: 0.85,
          duration: cfg.dur,
          delay: cfg.delay,
          ease: 'none',
          onComplete: () => { cfg.delay = 0; floatUp(); }
        });
      };
      floatUp();
      // Gentle horizontal sway
      gsap.to(lantern, {
        x: '+=20',
        duration: 3 + Math.random() * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // 6. Flying kites — drift across with bobbing motion
    kitesRef.current.forEach((kite, i) => {
      if (!kite) return;
      const cfg = KITE_CONFIGS[i];
      const drift = () => {
        gsap.set(kite, { x: '110vw', opacity: 0 });
        gsap.to(kite, {
          x: '-20vw',
          opacity: 0.9,
          duration: cfg.dur,
          delay: cfg.delay,
          ease: 'none',
          onComplete: () => { cfg.delay = 0; drift(); }
        });
      };
      drift();
      // Bobbing up and down
      gsap.to(kite, {
        y: '+=25',
        duration: 2 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // Kite string wave animation
    kiteStringsRef.current.forEach((str) => {
      if (!str) return;
      gsap.to(str, {
        attr: { d: "M20 35 Q 15 55, 22 75 Q 28 95, 18 120" },
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // 7. Flying birds — glide across with wing flapping
    birdsRef.current.forEach((bird, i) => {
      if (!bird) return;
      const cfg = BIRD_CONFIGS[i];
      const fly = () => {
        gsap.set(bird, { x: '110vw', opacity: 0 });
        gsap.to(bird, {
          x: '-15vw',
          opacity: 0.75,
          duration: cfg.dur,
          delay: cfg.delay,
          ease: 'none',
          onComplete: () => { cfg.delay = 0; fly(); }
        });
      };
      fly();
      // Gentle vertical bob
      gsap.to(bird, {
        y: `+=${8 + Math.random() * 12}`,
        duration: 1.5 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // Wing flap animation
    birdWingsRef.current.forEach((wing) => {
      if (!wing) return;
      gsap.to(wing, {
        attr: { d: "M0 8 Q 10 0, 20 8 Q 30 0, 40 8" },
        duration: 0.3 + Math.random() * 0.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });

    // Show scroll indicator after plane reaches ~center (~5s)
    const scrollTimer = setTimeout(() => {
      if (scrollIndicatorRef.current) {
        scrollIndicatorRef.current.style.opacity = '1';
      }
    }, 5000);

    return () => clearTimeout(scrollTimer);
  }, []);

  return (
    <section className="h-dvh w-full relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 60%, #ffffff 100%)' }}>
      
      {/* Clouds covering the entire screen */}
      {CLOUD_POSITIONS.map((pos, i) => (
        <div key={i} ref={el => cloudsRef.current[i] = el}
             className="absolute pointer-events-none"
             style={{ top: `${pos.top}%` }}>
           <svg width="220" height="110" viewBox="0 0 200 100">
             <path 
               fill={i % 3 === 0 ? "#fff" : i % 3 === 1 ? "#F5F5F5" : "rgba(255,255,255,0.3)"} 
               d="M40 60a30 30 0 0155-25 25 25 0 0145 10 20 20 0 0125 25H30a20 20 0 0110-10z" 
             />
           </svg>
        </div>
      ))}

      {/* Flying Lanterns */}
      {LANTERN_CONFIGS.map((cfg, i) => (
        <div key={`lantern-${i}`}
             ref={el => lanternsRef.current[i] = el}
             className="absolute pointer-events-none z-10"
             style={{ left: `${cfg.left}%`, opacity: 0 }}>
          <svg width={cfg.size} height={cfg.size * 1.4} viewBox="0 0 40 56">
            {/* Lantern glow */}
            <defs>
              <radialGradient id={`glow${i}`} cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#FF8C00" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#FF4500" stopOpacity="0.2" />
              </radialGradient>
            </defs>
            {/* Lantern body */}
            <ellipse cx="20" cy="24" rx="14" ry="18" fill={`url(#glow${i})`} />
            <ellipse cx="20" cy="24" rx="14" ry="18" fill="none" stroke="#FF8C00" strokeWidth="0.8" opacity="0.6" />
            {/* Top cap */}
            <rect x="15" y="5" width="10" height="4" rx="2" fill="#CC6600" opacity="0.7" />
            {/* Flame inside */}
            <ellipse cx="20" cy="26" rx="4" ry="6" fill="#FFDD44" opacity="0.8" />
            {/* Bottom opening */}
            <ellipse cx="20" cy="42" rx="10" ry="3" fill="none" stroke="#CC6600" strokeWidth="0.8" opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* Flying Kites */}
      {KITE_CONFIGS.map((cfg, i) => (
        <div key={`kite-${i}`}
             ref={el => kitesRef.current[i] = el}
             className="absolute pointer-events-none z-10"
             style={{ top: `${cfg.top}%`, opacity: 0 }}>
          <svg width="40" height="130" viewBox="0 0 40 130">
            {/* Kite diamond shape */}
            <polygon points="20,0 35,20 20,35 5,20" fill={cfg.color} opacity="0.85" />
            <polygon points="20,0 35,20 20,35 5,20" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.6" />
            {/* Cross struts */}
            <line x1="20" y1="0" x2="20" y2="35" stroke="#fff" strokeWidth="0.4" opacity="0.4" />
            <line x1="5" y1="20" x2="35" y2="20" stroke="#fff" strokeWidth="0.4" opacity="0.4" />
            {/* String — animated */}
            <path
              ref={el => kiteStringsRef.current[i] = el}
              d="M20 35 Q 22 55, 18 75 Q 14 95, 20 120"
              fill="none" stroke={cfg.tailColor} strokeWidth="0.8" opacity="0.6"
            />
            {/* Tail ribbons */}
            <path d="M12 32 Q 6 45, 10 58 Q 14 70, 8 82" fill="none" stroke={cfg.color} strokeWidth="1.2" opacity="0.5" />
            <path d="M28 32 Q 34 45, 30 58 Q 26 70, 32 82" fill="none" stroke={cfg.color} strokeWidth="1.2" opacity="0.5" />
          </svg>
        </div>
      ))}

      {/* Flying Birds */}
      {BIRD_CONFIGS.map((cfg, i) => (
        <div key={`bird-${i}`}
             ref={el => birdsRef.current[i] = el}
             className="absolute pointer-events-none z-10"
             style={{ top: `${cfg.top}%`, opacity: 0, transform: `scale(${cfg.scale})` }}>
          <svg width="40" height="16" viewBox="0 0 40 16">
            <path
              ref={el => birdWingsRef.current[i] = el}
              d="M0 4 Q 10 12, 20 4 Q 30 12, 40 4"
              fill="none"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}

      {/* THE FLIGHT GROUP: Plane -> Rope -> Banner */}
      <div ref={containerRef} className="absolute flex items-center overflow-visible z-20">
        
        {/* 1. Airplane */}
        <div className="relative" style={{ width: '60px' }}>
          <svg width="60" height="60" viewBox="0 0 24 24" fill="#fff" style={{ transform: 'rotate(-90deg)', filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.2))' }}>
            <path d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            {/* Cockpit window */}
            <ellipse cx="11.5" cy="3.8" rx="0.7" ry="0.5" fill="#87CEEB" opacity="0.8" />
            {/* Passenger windows */}
            {[6, 7.5, 9, 10.5, 12, 13.5].map((wy, i) => (
              <circle key={i} cx="11.5" cy={wy} r="0.35" fill="#87CEEB" opacity="0.7" />
            ))}
          </svg>
        </div>

        {/* 2. Rope */}
        <div className="relative" style={{ width: '200px', height: '60px', marginLeft: '-5px' }}>
           <svg width="200" height="60" viewBox="0 0 200 60">
              <path 
                ref={ropePathRef}
                d="M0 30 Q 50 45, 100 30 T 200 30" 
                fill="none" 
                stroke="rgba(255,255,255,0.6)" 
                strokeWidth="2" 
              />
           </svg>
        </div>

        {/* 3. Extended silk banner — text fits inside via viewBox scaling */}
        <div className="relative" style={{ marginLeft: '-5px' }}>
           <svg width="900" height="120" viewBox="0 0 900 120" preserveAspectRatio="xMidYMid meet">
              <path 
                ref={bannerPathRef}
                d="M0 15 C 112 0, 225 25, 337 12 C 450 -2, 562 28, 675 15 C 787 2, 850 22, 900 15 L 900 105 C 850 118, 787 92, 675 108 C 562 120, 450 90, 337 105 C 225 118, 112 92, 0 105 Z" 
                fill="var(--maroon)" 
                stroke="var(--gold)"
                strokeWidth="1.5"
              />
              {/* Text safely inset inside cloth — clipped to banner path */}
              <clipPath id="bannerClip">
                <rect x="60" y="25" width="780" height="70" />
              </clipPath>
              <text x="450" y="62" textAnchor="middle" fill="var(--gold)" clipPath="url(#bannerClip)" style={{ 
                fontSize: '26px', 
                fontFamily: "'Montserrat', sans-serif", 
                fontWeight: '900',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                dominantBaseline: 'middle'
              }}>
                28th and 29th May 2026
              </text>
           </svg>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div ref={scrollIndicatorRef}
        className="absolute bottom-6 left-1/2 flex flex-col items-center z-30 pointer-events-none"
        style={{ transform: 'translateX(-50%)', opacity: 0, transition: 'opacity 0.6s ease' }}>
        <span style={{ fontSize: '12px', color: '#fff', fontFamily: "'Montserrat', sans-serif", letterSpacing: '2px', textTransform: 'uppercase', textShadow: '0 1px 4px rgba(0,0,0,0.4)', marginBottom: '6px' }}>Scroll Down</span>
        <svg width="24" height="24" viewBox="0 0 24 24" style={{ animation: 'scroll-bounce 1.5s ease-in-out infinite' }}>
          <path d="M7 10l5 5 5-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))' }} />
        </svg>
      </div>
    </section>
  );
}
