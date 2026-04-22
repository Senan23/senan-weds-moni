import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* Countdown hook — target: 29 May 2026 23:59:00 IST */
function useCountdown() {
  const target = new Date('2026-05-29T23:59:00+05:30').getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (Date.now() >= target) return;
    const id = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= target) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

/* CSS keyframes for rotating mandalas — injected once */
const styleId = 'mandala-spin-styles';
if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes mandala-spin-cw { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes mandala-spin-ccw { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
    @keyframes leaf-twirl {
      0% { transform: rotate(-2deg) scaleY(1); }
      25% { transform: rotate(1.5deg) scaleY(0.98); }
      50% { transform: rotate(-1deg) scaleY(1); }
      75% { transform: rotate(2deg) scaleY(0.99); }
      100% { transform: rotate(-2deg) scaleY(1); }
    }
    @keyframes diya-flame {
      0% { filter: brightness(1) saturate(1) drop-shadow(0 0 6px rgba(255,160,0,0.7)); transform: scaleY(1) scaleX(1); }
      15% { filter: brightness(1.15) saturate(1.1) drop-shadow(0 0 10px rgba(255,140,0,0.9)); transform: scaleY(1.04) scaleX(0.97); }
      30% { filter: brightness(0.95) saturate(0.95) drop-shadow(0 0 5px rgba(255,180,0,0.6)); transform: scaleY(0.97) scaleX(1.02); }
      50% { filter: brightness(1.2) saturate(1.15) drop-shadow(0 0 12px rgba(255,120,0,1)); transform: scaleY(1.06) scaleX(0.96); }
      65% { filter: brightness(0.9) saturate(1) drop-shadow(0 0 4px rgba(255,160,0,0.5)); transform: scaleY(0.98) scaleX(1.01); }
      80% { filter: brightness(1.1) saturate(1.05) drop-shadow(0 0 8px rgba(255,140,0,0.8)); transform: scaleY(1.03) scaleX(0.98); }
      100% { filter: brightness(1) saturate(1) drop-shadow(0 0 6px rgba(255,160,0,0.7)); transform: scaleY(1) scaleX(1); }
    @keyframes pulse-gold {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes star-twinkle {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.5); }
    }
    }
  `;
  document.head.appendChild(style);
}

export default function LetterDrop({ onComplete, onFlipComplete }) {
  const sectionRef = useRef(null);
  const pinRef = useRef(null);
  const doorRef = useRef(null);
  const knock1Ref = useRef(null);
  const knock2Ref = useRef(null);
  const letterRef = useRef(null);
  const overlayRef = useRef(null);

  // Triangular flap refs
  const coverContainerRef = useRef(null);
  const flapTopRef = useRef(null);
  const flapBottomRef = useRef(null);
  const invitationCardRef = useRef(null);
  const pageTurnRef = useRef(null);
  const tapPromptRef = useRef(null);
  const scrollIndicatorRef = useRef(null);

  const [letterLanded, setLetterLanded] = useState(false);
  const [letterZoomed, setLetterZoomed] = useState(false);
  const [showCover, setShowCover] = useState(false);
  const [coverOpened, setCoverOpened] = useState(false);
  const [cardFlipped, setCardFlipped] = useState(false);
  const hasKnockedRef = useRef(false);

  const countdown = useCountdown();


  const runKnockAndLetter = useCallback(() => {
    if (hasKnockedRef.current) return;
    hasKnockedRef.current = true;
    const tl = gsap.timeline();

    // Create one AudioContext and schedule both knocks in advance for perfect sync
    try {
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      const makeKnock = (when) => {
        const len = actx.sampleRate * 0.06;
        const buf = actx.createBuffer(1, len, actx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 10);
        const src = actx.createBufferSource(); src.buffer = buf;
        const g = actx.createGain();
        g.gain.setValueAtTime(0.5, actx.currentTime + when);
        g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + when + 0.12);
        const f = actx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600;
        src.connect(f).connect(g).connect(actx.destination);
        src.start(actx.currentTime + when);
      };
      // Sound 1 at 0s, Sound 2 at 0.4s — matching the text timeline positions
      makeKnock(0);
      makeKnock(0.4);
    } catch (e) {}

    // First "KNOCK" text + door shake — at position 0
    tl.to(doorRef.current, {
      x: 4, duration: 0.04, repeat: 2, yoyo: true,
      ease: 'power1.inOut',
      onComplete: () => gsap.set(doorRef.current, { x: 0 })
    }, 0);
    tl.fromTo(knock1Ref.current,
      { scale: 0, opacity: 0, rotateZ: -10 },
      { scale: 1.1, opacity: 1, rotateZ: -6, duration: 0.18, ease: 'back.out(4)' }, 0
    );

    // Second "KNOCK!" text + door shake — at position 0.4 (synced with 2nd sound)
    tl.to(doorRef.current, {
      x: -4, duration: 0.04, repeat: 2, yoyo: true,
      ease: 'power1.inOut',
      onComplete: () => gsap.set(doorRef.current, { x: 0 })
    }, 0.4);
    tl.fromTo(knock2Ref.current,
      { scale: 0, opacity: 0, rotateZ: 8 },
      { scale: 1.1, opacity: 1, rotateZ: 5, duration: 0.18, ease: 'back.out(4)' }, 0.4
    );

    // Fade both out together
    tl.to([knock1Ref.current, knock2Ref.current], { opacity: 0, scale: 0.4, duration: 0.3, ease: 'power3.in' }, 0.9);

    tl.to({}, { duration: 0.3 });

    tl.fromTo(letterRef.current,
      { y: 0, x: 0, opacity: 0, rotateZ: 0, rotateX: 0, scale: 1 },
      { y: 8, opacity: 1, duration: 0.3, ease: 'power1.in' }
    );
    tl.to(letterRef.current, { y: 35, x: -12, rotateZ: 10, duration: 0.35, ease: 'sine.inOut' });
    tl.to(letterRef.current, { y: 65, x: 8, rotateZ: -7, duration: 0.3, ease: 'sine.inOut' });
    tl.to(letterRef.current, { y: 90, x: -4, rotateZ: 4, duration: 0.25, ease: 'sine.inOut' });
    tl.to(letterRef.current, {
      y: 115, x: 0, rotateZ: -1, rotateX: 45, scale: 0.85,
      duration: 0.3, ease: 'bounce.out',
      onComplete: () => setLetterLanded(true)
    });
  }, []);

  const handleLetterClick = useCallback(() => {
    if (letterZoomed) return;
    setLetterZoomed(true);

    const letterEl = letterRef.current;
    const pinEl = pinRef.current;
    const overlayEl = overlayRef.current;

    // Get letter's center position relative to the viewport
    const rect = letterEl.getBoundingClientRect();
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const letterCX = rect.left + rect.width / 2;
    const letterCY = rect.top + rect.height / 2;

    // Set transform origin on the pin container to the letter's position
    pinEl.style.transformOrigin = `${letterCX}px ${letterCY}px`;

    const zoomTl = gsap.timeline({ onComplete: () => setShowCover(true) });

    // Enable 3D perspective on the pin container for fly-toward-viewer effect
    pinEl.style.perspective = '800px';
    pinEl.style.perspectiveOrigin = `${letterCX}px ${letterCY}px`;

    // Phase 1: Straighten the letter flat
    zoomTl.to(letterEl, {
      rotateX: 0, rotateZ: 0, scale: 1,
      duration: 0.2, ease: 'power2.out'
    }, 0);

    // Phase 2: Fly the entire scene toward the viewer using translateZ
    zoomTl.to(pinEl, {
      z: 1500, duration: 1.2, ease: 'power3.in'
    }, 0.15);

    // Phase 3: Letter grows as it flies toward the viewer
    zoomTl.to(letterEl, {
      scale: 4, z: 200, duration: 1.0, ease: 'power3.in'
    }, 0.2);

    // Phase 4: Maroon overlay fades in as scene flies past
    zoomTl.to(overlayEl, {
      opacity: 1, duration: 0.4, ease: 'power2.in'
    }, 0.8);

    // Phase 5: Letter fades as it fills view
    zoomTl.to(letterEl, {
      opacity: 0, duration: 0.25, ease: 'power1.in'
    }, 1.0);
  }, [letterZoomed]);

  // Triangular flaps turn like pages — one by one
  const handleCoverOpen = useCallback(() => {
    if (coverOpened) return;
    setCoverOpened(true);
    const tl = gsap.timeline({ onComplete: () => setTimeout(() => onComplete(), 300) });

    // Top flap — hinged at top screen edge, peels outward upward
    tl.to(flapTopRef.current, { rotateX: 180, duration: 1.2, ease: 'power2.inOut' }, 0);
    // Bottom flap — hinged at bottom screen edge, peels outward downward
    tl.to(flapBottomRef.current, { rotateX: -180, duration: 1.2, ease: 'power2.inOut' }, 0.6);

    tl.fromTo(invitationCardRef.current,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' }, 0.8
    );
  }, [coverOpened, onComplete]);

  const handlePageTurn = useCallback(() => {
    if (!pageTurnRef.current || cardFlipped) return;
    setCardFlipped(true);
    const tl = gsap.timeline();
    tl.to(pageTurnRef.current, {
      rotateY: 180,
      duration: 1.4,
      ease: 'power2.inOut'
    });
    tl.to(coverContainerRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => {
        if (coverContainerRef.current) coverContainerRef.current.style.display = 'none';
        if (onFlipComplete) onFlipComplete();
      }
    }, '+=0.4');
  }, [cardFlipped, onFlipComplete]);

  useEffect(() => {
    if (!sectionRef.current) return;
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: '+=150%',
      pin: pinRef.current,
      pinSpacing: true,
      onUpdate: (self) => {
        if (self.progress > 0.4 && !hasKnockedRef.current) runKnockAndLetter();
      }
    });
    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [runKnockAndLetter]);

  useEffect(() => {
    if (showCover && tapPromptRef.current && !coverOpened) {
      gsap.to(tapPromptRef.current, { scale: 1.1, duration: 0.9, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }
  }, [showCover, coverOpened]);

  const pad = n => String(n).padStart(2, '0');

  /* Door dimensions */
  const DOOR_W = 180;
  const DOOR_H = 320;

  return (
    <>
    <div ref={sectionRef} className="relative w-full">
      <div ref={pinRef} className="h-dvh w-full flex flex-col items-center justify-center overflow-hidden relative"
        style={{ background: '#fff' }}>

        {/* Overlay for zoom */}
        <div ref={overlayRef} className="fixed inset-0 z-40 pointer-events-none" style={{ background: '#800000', opacity: 0 }} />

        {/* ── WHITE WALL ── */}
        <div className="absolute top-0 left-0 right-0" style={{
          bottom: '22%',
          background: 'linear-gradient(to bottom, #ffffff 0%, #fafafa 60%, #f5f5f5 100%)'
        }} />

        {/* ── WALL / FLOOR PARTITION LINE ── */}
        <div className="absolute left-0 right-0" style={{
          top: '78%', height: '4px',
          background: 'linear-gradient(to right, #d0c8b8, #bbb0a0, #d0c8b8)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
        }} />

        {/* ── FLOOR — white granite tiles ── */}
        <div className="absolute left-0 right-0 bottom-0" style={{ height: '22%' }}>
          <div className="absolute inset-0" style={{ background: '#f0ede8' }} />
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
            <defs>
              <pattern id="granite" patternUnits="userSpaceOnUse" width="4" height="4">
                <rect width="4" height="4" fill="#f5f2ee" />
                <circle cx="1" cy="1" r="0.4" fill="#e0ddd8" opacity="0.5" />
                <circle cx="3" cy="3" r="0.3" fill="#d8d4ce" opacity="0.4" />
                <circle cx="2" cy="0.5" r="0.2" fill="#ccc8c2" opacity="0.3" />
              </pattern>
            </defs>
            {[0, 50].map(row => (
              [0, 50, 100, 150, 200, 250, 300, 350].map(col => (
                <g key={`${row}-${col}`}>
                  <rect x={col} y={row} width="50" height="50" fill="url(#granite)" stroke="#ddd8d0" strokeWidth="0.6" />
                  <rect x={col + 0.5} y={row + 0.5} width="49" height="49" fill="none" stroke="#fff" strokeWidth="0.3" opacity="0.4" />
                </g>
              ))
            ))}
          </svg>
        </div>



        {/* ── MAIN: Timer + Door + Mat + Letter (centered) ── */}
        <div className="relative flex flex-col items-center" style={{ zIndex: 2 }}>

          {/* COUNTDOWN TIMER — LED dot-matrix display */}
          <div style={{
            background: '#0a0a0a', borderRadius: '6px',
            padding: '8px 10px 6px', marginBottom: '10px',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 4px 18px rgba(0,0,0,0.5), inset 0 0 8px rgba(255,0,0,0.03)',
            border: '1px solid #1a1a1a'
          }}>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              {[
                { val: countdown.days, label: 'DAYS' },
                { val: countdown.hours, label: 'HRS' },
                { val: countdown.minutes, label: 'MIN' },
                { val: countdown.seconds, label: 'SEC' }
              ].map((item, idx) => (
                <React.Fragment key={item.label}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {pad(item.val).split('').map((digit, di) => (
                        <div key={di} style={{
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: '22px', color: '#ff1a1a', lineHeight: '1',
                          width: '18px', height: '28px',
                          background: '#050505',
                          borderRadius: '2px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: '1px solid #1a1a1a',
                          textShadow: '0 0 6px rgba(255,26,26,0.8), 0 0 12px rgba(255,26,26,0.4), 0 0 2px rgba(255,26,26,1)',
                          position: 'relative', overflow: 'hidden'
                        }}>
                          {/* Scanline effect */}
                          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px)', pointerEvents: 'none' }} />
                          {digit}
                        </div>
                      ))}
                    </div>
                    <div style={{
                      fontSize: '6px', color: '#444', fontFamily: "'Share Tech Mono', monospace",
                      marginTop: '2px', letterSpacing: '0px'
                    }}>{item.label}</div>
                  </div>
                  {idx < 3 && <span style={{ color: '#ff1a1a', fontFamily: "'Share Tech Mono', monospace", fontSize: '20px', marginTop: '-8px', padding: '0 1px', textShadow: '0 0 6px rgba(255,26,26,0.6)' }}>:</span>}
                </React.Fragment>
              ))}
            </div>
            <div style={{
              fontSize: '7px', color: '#444', fontFamily: "'Share Tech Mono', monospace",
              letterSpacing: '3px', marginTop: '3px', textTransform: 'uppercase'
            }}>TO GO</div>
          </div>

          {/* WHITE DOOR — centered, main element */}
          <div ref={doorRef} style={{ position: 'relative' }}>
            {/* "KNOCK" text — appears over door */}
            <div ref={knock1Ref} className="absolute z-30" style={{
              top: '60px', left: '-30px',
              opacity: 0, pointerEvents: 'none'
            }}>
              <div style={{
                fontFamily: "'Bangers', cursive", fontSize: '40px', color: '#FFD700',
                letterSpacing: '3px', lineHeight: 1,
                textShadow: '3px 3px 0 #5C0000, -1px -1px 0 #5C0000, 1px -1px 0 #5C0000, -1px 1px 0 #5C0000, 0 0 15px rgba(255,215,0,0.5)',
                WebkitTextStroke: '1.5px #B8860B', transform: 'skewX(-4deg) rotate(-8deg)'
              }}>KNOCK</div>
            </div>
            {/* "KNOCK!" text — appears over door after first */}
            <div ref={knock2Ref} className="absolute z-30" style={{
              top: '100px', right: '-20px',
              opacity: 0, pointerEvents: 'none'
            }}>
              <div style={{
                fontFamily: "'Bangers', cursive", fontSize: '40px', color: '#FFD700',
                letterSpacing: '3px', lineHeight: 1,
                textShadow: '3px 3px 0 #5C0000, -1px -1px 0 #5C0000, 1px -1px 0 #5C0000, -1px 1px 0 #5C0000, 0 0 15px rgba(255,215,0,0.5)',
                WebkitTextStroke: '1.5px #B8860B', transform: 'skewX(4deg) rotate(6deg)'
              }}>KNOCK!</div>
            </div>
            <svg width={DOOR_W} height={DOOR_H} viewBox={`0 0 ${DOOR_W} ${DOOR_H}`}>
              <rect x="0" y="0" width={DOOR_W} height={DOOR_H} rx="5" fill="#FAFAFA" stroke="#ccc" strokeWidth="3" />
              <path d={`M0 4 Q ${DOOR_W / 2} -18, ${DOOR_W} 4`} fill="#f0f0f0" stroke="#ddd" strokeWidth="1.5" />
              {/* Upper panel */}
              <rect x="18" y="30" width={DOOR_W - 36} height="105" rx="4" fill="none" stroke="#ddd" strokeWidth="1.8" opacity="0.6" />
              {/* Lower panel */}
              <rect x="18" y="155" width={DOOR_W - 36} height="105" rx="4" fill="none" stroke="#ddd" strokeWidth="1.8" opacity="0.6" />
              {/* Door knob */}
              <circle cx={DOOR_W - 22} cy="175" r="8" fill="#D4AF37" stroke="#B8860B" strokeWidth="2" />
              <circle cx={DOOR_W - 22} cy="175" r="3.5" fill="#B8860B" />
              {/* Keyhole */}
              <ellipse cx={DOOR_W - 22} cy="190" rx="3" ry="5.5" fill="#ddd" />
              {/* Mail slot */}
              <rect x="58" y="200" width="64" height="9" rx="4" fill="#e0e0e0" stroke="#ccc" strokeWidth="1.2" />
              <rect x="61" y="202" width="58" height="5" rx="2.5" fill="#d0d0d0" />
              {/* V & M */}
              <text x={DOOR_W / 2} y="22" textAnchor="middle" fill="#D4AF37" style={{
                fontSize: '12px', fontFamily: "'Playfair Display', serif", fontWeight: 'bold'
              }}>V & M</text>
            </svg>
          </div>

          {/* WELCOME MAT — same width as door */}
          {/* Baseboard / wall-floor separation line — full width behind door */}
          <div className="absolute left-0 right-0" style={{
            bottom: '90px', height: '0', zIndex: 0
          }}>
            <div style={{
              position: 'absolute', left: '-50vw', right: '-50vw', top: '-4px', height: '6px',
              background: 'linear-gradient(to bottom, #c8bfb0, #b5a994 40%, #c8bfb0)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }} />
            <div style={{
              position: 'absolute', left: '-50vw', right: '-50vw', top: '2px', height: '2px',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.08), transparent)'
            }} />
          </div>
          <div className="relative" style={{
            width: `${DOOR_W}px`,
            height: '90px',
            perspective: '400px',
            marginTop: '-2px',
            zIndex: 1
          }}>
            <div style={{
              width: '100%', height: '100%',
              transform: 'rotateX(55deg)', transformOrigin: 'top center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: '#C4A265', borderRadius: '8px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.25)'
              }} />
              <div style={{
                position: 'absolute', top: '5px', left: '5px', right: '5px', bottom: '5px',
                background: '#D4B87A', borderRadius: '6px'
              }} />
              <div style={{
                position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
                border: '2px dashed #8B6914', borderRadius: '5px'
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#2E5E1E', fontSize: '18px',
                fontFamily: "'Montserrat', sans-serif", fontWeight: '900',
                letterSpacing: '5px', textTransform: 'uppercase'
              }}>WELCOME</div>
            </div>
          </div>

          {/* THE LETTER */}
          <div ref={letterRef} className="absolute" style={{
            top: '240px', left: '50%', transform: 'translateX(-50%)',
            opacity: 0, zIndex: 30,
            cursor: letterLanded ? 'pointer' : 'default'
          }} onClick={letterLanded && !letterZoomed ? handleLetterClick : undefined}>
            <svg width="110" height="75" viewBox="0 0 110 75">
              <rect x="0" y="0" width="110" height="75" rx="4" fill="#800000" stroke="#5C0000" strokeWidth="1.5" />
              <polygon points="0,0 55,32 110,0" fill="#6B0000" stroke="#5C0000" strokeWidth="1" />
              <rect x="3" y="3" width="104" height="69" rx="3" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.5" />
              <g transform="translate(55, 42)" opacity="0.9">
                <circle cx="0" cy="0" r="8" fill="none" stroke="#D4AF37" strokeWidth="1" />
                <circle cx="0" cy="0" r="4" fill="none" stroke="#D4AF37" strokeWidth="0.7" />
                <circle cx="0" cy="0" r="1.5" fill="#D4AF37" />
                <ellipse cx="0" cy="-12" rx="3" ry="5.5" fill="none" stroke="#D4AF37" strokeWidth="0.7" />
                <ellipse cx="0" cy="12" rx="3" ry="5.5" fill="none" stroke="#D4AF37" strokeWidth="0.7" />
                <ellipse cx="-12" cy="0" rx="5.5" ry="3" fill="none" stroke="#D4AF37" strokeWidth="0.7" />
                <ellipse cx="12" cy="0" rx="5.5" ry="3" fill="none" stroke="#D4AF37" strokeWidth="0.7" />
              </g>
            </svg>
            {letterLanded && !letterZoomed && (
              <div className="absolute -bottom-10 left-1/2 animate-bounce" style={{
                transform: 'translateX(-50%)', background: '#D4AF37', color: '#000',
                padding: '3px 14px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold',
                letterSpacing: '2px', whiteSpace: 'nowrap', boxShadow: '0 2px 10px rgba(212,175,55,0.4)'
              }}>TAP TO OPEN</div>
            )}
          </div>
        </div>

        {/* Scroll Down Indicator — visible until letter lands */}
        {!letterLanded && (
          <div ref={scrollIndicatorRef}
            className="absolute bottom-4 left-0 right-0 flex flex-col items-center z-30 pointer-events-none">
            <span style={{ fontSize: '11px', color: '#999', fontFamily: "'Montserrat', sans-serif", letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '4px' }}>Swipe Down</span>
            <svg width="20" height="20" viewBox="0 0 24 24" style={{ animation: 'scroll-bounce 1.5s ease-in-out infinite' }}>
              <path d="M7 10l5 5 5-5" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

      </div>
    </div>

    {/* ══ FULLSCREEN COVER — triangular flaps turning like pages ══ */}
    {showCover && (
      <div ref={coverContainerRef} className="fixed inset-0 z-50"
        style={{ overflow: 'hidden', perspective: '1200px', background: '#FFF8E7' }}>

        {/* Back page — sits behind the front page */}
        <div className="absolute inset-0 flex items-center justify-center" style={{
          background: 'linear-gradient(145deg, #FFF8E7 0%, #FDEBD0 30%, #FAD7A0 60%, #FDEBD0 100%)',
          zIndex: 1
        }}>
          {/* Gold border */}
          <div className="absolute inset-0" style={{ border: '2px solid rgba(212,175,55,0.4)', margin: '16px', borderRadius: '8px' }}>
            <div className="absolute inset-0" style={{ border: '1px solid rgba(212,175,55,0.2)', margin: '6px', borderRadius: '5px' }} />
          </div>
          {/* Subtle gold sparkles */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={`star-${i}`} className="absolute rounded-full" style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              background: 'rgba(212,175,55,0.4)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `star-twinkle ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`
            }} />
          ))}
          <div style={{ textAlign: 'center', zIndex: 1, padding: '0 24px' }}>
          </div>
        </div>

        {/* Front page — turns like a book page */}
        <div ref={invitationCardRef} className="absolute inset-0" style={{ opacity: 0, zIndex: 2 }}>
        <div ref={pageTurnRef} className="absolute inset-0" style={{
          transformOrigin: 'center center',
          transformStyle: 'preserve-3d',
        }}>
        {/* Front face — beige invitation */}
        <div className="absolute inset-0 flex items-center justify-center" style={{
          background: 'linear-gradient(145deg, #FFF8E7 0%, #FDEBD0 30%, #FAD7A0 60%, #FDEBD0 100%)',
          backfaceVisibility: 'hidden'
        }}>
          {/* Decorative gold border frame */}
          <div className="absolute inset-0" style={{
            border: '3px solid #D4AF37',
            margin: '16px',
            borderRadius: '8px'
          }}>
            <div className="absolute inset-0" style={{
              border: '1px solid #D4AF37',
              margin: '6px',
              borderRadius: '5px',
              opacity: 0.4
            }} />
          </div>

          {/* Text content */}
          <div style={{ textAlign: 'center', color: '#1a1a5e', fontFamily: "'Playfair Display', serif", zIndex: 1 }}>
            <div style={{
              fontSize: '42px', fontWeight: '700', fontFamily: "'Great Vibes', cursive",
              color: '#1a1a5e', lineHeight: 1.3, marginBottom: '20px'
            }}>
              Vishwaksenan weds Monisha
            </div>
            <div style={{
              fontSize: '20px', fontFamily: "'Playfair Display', serif", fontWeight: '400',
              color: '#1a1a5e', lineHeight: 1.5, letterSpacing: '1px'
            }}>
              in a close family wedding at<br />Oppiliappan Kovil, Kumbakonam
            </div>
            <div style={{
              fontSize: '16px', fontFamily: "'Playfair Display', serif", fontWeight: '400',
              color: '#1a1a5e', lineHeight: 1.5, letterSpacing: '1px', marginTop: '16px'
            }}>
              ~ 28th May 2026 ~
            </div>
            <div
              onClick={handlePageTurn}
              style={{
                fontFamily: "'Playfair Display', serif", fontSize: '14px',
                letterSpacing: '4px', textTransform: 'uppercase',
                color: '#1a1a5e', cursor: 'pointer', marginTop: '28px',
                animation: 'pulse-gold 2s ease-in-out infinite'
              }}>
              Click Here
            </div>
          </div>
        </div>
        {/* Back face — blue/dark, visible when flipped */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(165deg, #060d1f 0%, #0b1630 25%, #0d1a35 50%, #091328 75%, #060d1f 100%)',
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)'
        }}>
          {/* Silver border on back */}
          <div className="absolute inset-0" style={{ border: '2px solid rgba(192,192,192,0.3)', margin: '16px', borderRadius: '8px' }} />
        </div>
        </div>
        </div>

        {/* TOP flap — triangle covering top half, hinged at top edge */}
        <div ref={flapTopRef} className="absolute" style={{
          top: 0, left: 0, right: 0, height: '50vh',
          background: '#800000',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          transformOrigin: 'center top',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          zIndex: 7
        }}>
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <line x1="1" y1="1" x2="50" y2="99" stroke="#D4AF37" strokeWidth="1.5" />
            <line x1="99" y1="1" x2="50" y2="99" stroke="#D4AF37" strokeWidth="1.5" />
            <line x1="1" y1="1" x2="50" y2="99" stroke="#D4AF37" strokeWidth="4" opacity="0.15" />
            <line x1="99" y1="1" x2="50" y2="99" stroke="#D4AF37" strokeWidth="4" opacity="0.15" />
            <line x1="1" y1="1" x2="99" y2="1" stroke="#D4AF37" strokeWidth="0.8" opacity="0.3" />
            <polygon points="5,5 95,5 50,94" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
          </svg>
        </div>

        {/* BOTTOM flap — triangle covering bottom half, hinged at bottom edge */}
        <div ref={flapBottomRef} className="absolute" style={{
          bottom: 0, left: 0, right: 0, height: '50vh',
          background: '#800000',
          clipPath: 'polygon(50% 0, 100% 100%, 0 100%)',
          transformOrigin: 'center bottom',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          zIndex: 6
        }}>
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
            <line x1="50" y1="1" x2="1" y2="99" stroke="#D4AF37" strokeWidth="1.5" />
            <line x1="50" y1="1" x2="99" y2="99" stroke="#D4AF37" strokeWidth="1.5" />
            <line x1="50" y1="1" x2="1" y2="99" stroke="#D4AF37" strokeWidth="4" opacity="0.15" />
            <line x1="50" y1="1" x2="99" y2="99" stroke="#D4AF37" strokeWidth="4" opacity="0.15" />
            <line x1="1" y1="99" x2="99" y2="99" stroke="#D4AF37" strokeWidth="0.8" opacity="0.3" />
            <polygon points="50,6 96,95 4,95" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.3" />
          </svg>
        </div>

        {/* CENTER — rotating mandalas + circle with V & M */}
        {!coverOpened && (
          <div className="absolute inset-0 flex items-center justify-center z-10"
               style={{ pointerEvents: 'auto', cursor: 'pointer' }}
               onClick={handleCoverOpen}>
            <div ref={tapPromptRef} className="relative flex items-center justify-center"
              style={{ width: '260px', height: '260px' }}>

              {/* Outer rotating lotus ring — clockwise, 16 petals */}
              <div style={{
                position: 'absolute', inset: 0,
                animation: 'mandala-spin-cw 18s linear infinite'
              }}>
                <svg width="260" height="260" viewBox="0 0 260 260">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <g key={`lo-${i}`} transform={`rotate(${i * 22.5}, 130, 130)`}>
                      {/* Lotus petal — layered curves */}
                      <path d="M130,22 C122,40 118,62 122,78 C126,86 130,88 130,88 C130,88 134,86 138,78 C142,62 138,40 130,22Z"
                        fill="none" stroke="#D4AF37" strokeWidth="0.9" opacity="0.55" />
                      <path d="M130,30 C124,44 121,60 124,72 C127,78 130,80 130,80 C130,80 133,78 136,72 C139,60 136,44 130,30Z"
                        fill="#D4AF37" fillOpacity="0.06" stroke="#D4AF37" strokeWidth="0.5" opacity="0.45" />
                      {/* Vein line */}
                      <line x1="130" y1="28" x2="130" y2="82" stroke="#D4AF37" strokeWidth="0.3" opacity="0.3" />
                      {/* Petal tip dot */}
                      <circle cx="130" cy="20" r="1.5" fill="#D4AF37" opacity="0.5" />
                    </g>
                  ))}
                  <circle cx="130" cy="130" r="118" fill="none" stroke="#D4AF37" strokeWidth="0.5" opacity="0.2" />
                </svg>
              </div>

              {/* Inner rotating lotus ring — counter-clockwise, 12 petals */}
              <div style={{
                position: 'absolute', top: '35px', left: '35px', right: '35px', bottom: '35px',
                animation: 'mandala-spin-ccw 12s linear infinite'
              }}>
                <svg width="190" height="190" viewBox="0 0 190 190">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <g key={`li-${i}`} transform={`rotate(${i * 30}, 95, 95)`}>
                      {/* Lotus petal — rounder, smaller */}
                      <path d="M95,18 C88,34 85,52 89,65 C92,72 95,74 95,74 C95,74 98,72 101,65 C105,52 102,34 95,18Z"
                        fill="none" stroke="#D4AF37" strokeWidth="0.8" opacity="0.5" />
                      <path d="M95,26 C90,38 88,50 90,60 C93,66 95,68 95,68 C95,68 97,66 100,60 C102,50 100,38 95,26Z"
                        fill="#D4AF37" fillOpacity="0.08" stroke="#D4AF37" strokeWidth="0.4" opacity="0.4" />
                      <line x1="95" y1="24" x2="95" y2="68" stroke="#D4AF37" strokeWidth="0.25" opacity="0.25" />
                      <circle cx="95" cy="16" r="1.2" fill="#D4AF37" opacity="0.45" />
                    </g>
                  ))}
                  {/* Scalloped edge connecting petals */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const a1 = (i * 30 - 90) * Math.PI / 180;
                    const a2 = ((i + 1) * 30 - 90) * Math.PI / 180;
                    const r = 62;
                    const ri = 52;
                    return (
                      <path key={`sc-${i}`}
                        d={`M ${95 + r * Math.cos(a1)} ${95 + r * Math.sin(a1)} Q ${95 + ri * Math.cos((a1 + a2) / 2)} ${95 + ri * Math.sin((a1 + a2) / 2)}, ${95 + r * Math.cos(a2)} ${95 + r * Math.sin(a2)}`}
                        fill="none" stroke="#D4AF37" strokeWidth="0.4" opacity="0.3" />
                    );
                  })}
                  <circle cx="95" cy="95" r="78" fill="none" stroke="#D4AF37" strokeWidth="0.4" opacity="0.2" strokeDasharray="3 2" />
                </svg>
              </div>

              {/* Static center circle with V & M */}
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px', height: '80px',
                borderRadius: '50%',
                background: '#800000',
                border: '2.5px solid #D4AF37',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 20px rgba(212,175,55,0.3), inset 0 0 15px rgba(0,0,0,0.2)'
              }}>
                <div style={{ position: 'absolute', inset: '4px', borderRadius: '50%', border: '0.8px solid #D4AF37', opacity: 0.5 }} />
                <div style={{
                  fontSize: '14px', fontFamily: "'Montserrat', sans-serif",
                  fontWeight: '700', color: '#D4AF37', lineHeight: 1,
                  letterSpacing: '2px', textTransform: 'uppercase'
                }}>OPEN</div>
              </div>
            </div>
          </div>
        )}
      </div>
    )}
    </>
  );
}
