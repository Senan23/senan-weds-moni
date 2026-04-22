import React, { useRef, useEffect, useState, useMemo } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 21;
const GOOGLE_MAPS_QUERY = 'Kiran+Palace,+Korattur,+Chennai';

export default function Reception() {
  const canvasSectionRef = useRef(null);
  const canvasRef = useRef(null);
  const textOverlayRef = useRef(null);
  const witnessSectionRef = useRef(null);
  const witnessRef = useRef(null);
  const dateRef = useRef(null);
  const mapSectionRef = useRef(null);
  const palaceRef = useRef(null);
  const imagesRef = useRef([]);
  const [currentFrame, setCurrentFrame] = useState(0);

  // Generate deterministic star positions once
  const stars = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      w: 1 + ((i * 7 + 3) % 3),
      top: ((i * 37 + 13) % 100),
      left: ((i * 53 + 7) % 100),
      dur: 2 + ((i * 11) % 30) / 10,
      delay: ((i * 17) % 20) / 10
    })), []
  );

  // Inject keyframes
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes reception-star-twinkle {
        0%, 100% { opacity: 0.15; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.4); }
      }
      @keyframes palace-float {
        0%, 100% { transform: translate(-50%, -70%) translateY(0px); }
        50% { transform: translate(-50%, -70%) translateY(-6px); }
      }
      @keyframes scroll-bounce {
        0%, 100% { transform: translateY(0); opacity: 1; }
        50% { transform: translateY(8px); opacity: 0.4; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Preload all sequence images
  useEffect(() => {
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/sequence/ezgif-frame-${String(i).padStart(3, '0')}.webp`;
      imagesRef.current[i - 1] = img;
    }
  }, []);

  // Canvas sequence ScrollTrigger
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const setup = () => {
      const firstImg = imagesRef.current[0];
      canvas.width = firstImg.naturalWidth;
      canvas.height = firstImg.naturalHeight;
      ctx.drawImage(firstImg, 0, 0);

      const obj = { frame: 0 };
      const st = gsap.to(obj, {
        frame: FRAME_COUNT - 1,
        snap: 'frame',
        scrollTrigger: {
          trigger: canvasSectionRef.current,
          start: 'top top',
          end: `+=${FRAME_COUNT * 160}`,
          scrub: 0.5,
          pin: true,
        },
        onUpdate: () => {
          const idx = Math.round(obj.frame);
          setCurrentFrame(idx);
          const img = imagesRef.current[idx];
          if (img && img.complete) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          }
        }
      });

      return () => st.scrollTrigger?.kill();
    };

    const firstImg = imagesRef.current[0];
    if (firstImg.complete) {
      setup();
    } else {
      firstImg.onload = setup;
    }
  }, []);

  // Word-by-word + date animation
  useEffect(() => {
    if (!witnessRef.current || !dateRef.current) return;
    const words = witnessRef.current.querySelectorAll('.witness-word');

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: witnessSectionRef.current,
        start: 'top 60%',
        toggleActions: 'play none none none'
      }
    });

    tl.fromTo(words,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, stagger: 0.35, duration: 0.6, ease: 'power2.out' }
    );

    tl.fromTo(dateRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
      '+=0.4'
    );
  }, []);

  // Map section — 3D palace entrance animation
  useEffect(() => {
    if (!palaceRef.current) return;
    gsap.fromTo(palaceRef.current,
      { opacity: 0, scale: 0.6, y: 40 },
      {
        opacity: 1, scale: 1, y: 0, duration: 1, ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: mapSectionRef.current,
          start: 'top 65%',
          toggleActions: 'play none none none'
        }
      }
    );
  }, []);

  const textOverlay = currentFrame <= 10
    ? 'From college corridors'
    : "To wedding vows, We've grown together";

  return (
    <div style={{
      background: `
        radial-gradient(ellipse at 20% 80%, rgba(255,255,255,0.03) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(255,255,255,0.04) 0%, transparent 50%),
        linear-gradient(165deg, #060d1f 0%, #0b1630 20%, #081022 40%, #0d1a35 60%, #091328 80%, #060d1f 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background stars */}
      {stars.map((s, i) => (
        <div key={`rstar-${i}`} className="absolute rounded-full" style={{
          width: `${s.w}px`, height: `${s.w}px`,
          background: 'rgba(220,220,255,0.6)',
          top: `${s.top}%`, left: `${s.left}%`,
          animation: `reception-star-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          pointerEvents: 'none'
        }} />
      ))}

      {/* ═══ SECTION 1: Canvas sequence — Hologram from orb ═══ */}
      <div ref={canvasSectionRef} style={{
        height: '100vh', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column'
      }}>

        {/* Text overlay ABOVE hologram */}
        <div ref={textOverlayRef} style={{
          marginBottom: '24px', textAlign: 'center',
          fontFamily: "'Great Vibes', cursive", fontSize: '30px',
          background: 'linear-gradient(180deg, #ffffff 0%, #c0c0c0 40%, #e8e8e8 70%, #a0a0a0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 10px rgba(192,192,192,0.3))',
          transition: 'opacity 0.4s ease',
          minHeight: '44px'
        }}>
          {textOverlay}
        </div>

        {/* Two line spacer */}
        <div style={{ height: '40px' }} />

        {/* Hologram container — sphere at bottom, torch-like projection upward */}
        <div style={{
          position: 'relative',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          width: '100%', maxWidth: '500px'
        }}>

          {/* Trapezium projection area — narrow at bottom (sphere), expanding to full canvas width at top (torch) */}
          <div style={{
            position: 'relative',
            width: '100%',
            clipPath: 'polygon(0% 0%, 100% 0%, 65% 100%, 35% 100%)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            paddingBottom: '10px'
          }}>
            {/* Projection beam glow (behind the canvas) */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(200, 220, 255, 0.04) 0%, rgba(200, 220, 255, 0.02) 50%, rgba(200, 220, 255, 0.06) 100%)',
              pointerEvents: 'none', zIndex: 0
            }} />

            {/* Canvas — holographic look */}
            <div style={{
              position: 'relative', zIndex: 1,
              overflow: 'hidden'
            }}>
              {/* Holographic scanline overlay */}
              <div style={{
                position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
                background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(200, 220, 255, 0.03) 3px, rgba(200, 220, 255, 0.03) 4px)',
                mixBlendMode: 'screen'
              }} />
              <canvas ref={canvasRef} style={{
                display: 'block',
                maxWidth: '65vw', maxHeight: '45vh',
                width: '100%', height: 'auto',
                filter: 'brightness(1.15) contrast(1.05) saturate(0.85)',
                opacity: 0.55,
                mixBlendMode: 'screen'
              }} />
            </div>
          </div>

          {/* Convergence point glow — where trapezium meets the sphere */}
          <div style={{
            width: '50px', height: '6px',
            background: 'radial-gradient(ellipse, rgba(200, 220, 255, 0.6) 0%, transparent 70%)',
            filter: 'blur(3px)',
            marginTop: '-4px', zIndex: 3, pointerEvents: 'none'
          }} />

          {/* Silver titanium sphere — the hologram projector */}
          <div style={{
            marginTop: '4px',
            width: '50px', height: '50px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 30%, #f0f0f0 0%, #c0c0c0 25%, #909090 50%, #606060 75%, #404040 100%)',
            boxShadow: '0 0 20px rgba(200, 220, 255, 0.35), 0 0 40px rgba(200, 220, 255, 0.15), 0 4px 12px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(0,0,0,0.3)',
            position: 'relative',
            zIndex: 4
          }}>
            {/* Titanium sheen highlight */}
            <div style={{
              position: 'absolute', top: '6px', left: '10px',
              width: '14px', height: '8px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.5)',
              filter: 'blur(3px)',
              pointerEvents: 'none'
            }} />
            {/* Inner ring */}
            <div style={{
              position: 'absolute', inset: '6px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: 'inset 0 0 8px rgba(200,220,255,0.15)'
            }} />
            {/* Core light emitter */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '10px', height: '10px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(200,220,255,0.8) 0%, rgba(200,220,255,0.2) 60%, transparent 100%)',
              animation: 'reception-star-twinkle 2s ease-in-out infinite'
            }} />
            {/* Upward beam from sphere top */}
            <div style={{
              position: 'absolute', top: '-10px', left: '50%',
              transform: 'translateX(-50%)',
              width: '6px', height: '12px',
              background: 'linear-gradient(to top, rgba(200,220,255,0.5), transparent)',
              borderRadius: '3px', filter: 'blur(2px)',
              pointerEvents: 'none'
            }} />
          </div>
        </div>

        {/* Keep Swiping prompt */}
        <div style={{
          marginTop: '24px', textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
        }}>
          <span style={{
            fontSize: '11px', color: 'rgba(200, 220, 255, 0.5)',
            fontFamily: "'Montserrat', sans-serif", letterSpacing: '3px',
            textTransform: 'uppercase',
            textShadow: '0 0 8px rgba(200, 220, 255, 0.2)'
          }}>Keep Swiping</span>
          <svg width="20" height="20" viewBox="0 0 24 24" style={{ animation: 'scroll-bounce 1.5s ease-in-out infinite' }}>
            <path d="M7 10l5 5 5-5" fill="none" stroke="rgba(200, 220, 255, 0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* ═══ SECTION 2: "Come witness our forever" + date ═══ */}
      <div ref={witnessSectionRef} style={{
        minHeight: '80vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 20px'
      }}>
        <div ref={witnessRef} style={{ textAlign: 'center' }}>
          {'Come witness our forever'.split(' ').map((word, i) => (
            <span key={i} className="witness-word" style={{
              display: 'inline-block', marginRight: '14px',
              fontFamily: "'Great Vibes', cursive", fontSize: '48px',
              background: 'linear-gradient(180deg, #ffffff 0%, #c8c8c8 40%, #e8e8e8 60%, #b0b0b0 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 8px rgba(192,192,192,0.25))',
              opacity: 0
            }}>
              {word}
            </span>
          ))}
        </div>

        <div ref={dateRef} style={{
          marginTop: '44px', textAlign: 'center',
          fontFamily: "'Playfair Display', serif", fontSize: '18px',
          letterSpacing: '3px',
          background: 'linear-gradient(180deg, #e0e0e0 0%, #a8a8a8 50%, #d0d0d0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          opacity: 0
        }}>
          ~ 29th May 2026 ~ 7 PM Onwards ~
        </div>
      </div>

      {/* ═══ SECTION 3: Google Maps + 3D Palace ═══ */}
      <div ref={mapSectionRef} style={{
        minHeight: '100vh', position: 'relative',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 20px'
      }}>
        {/* Title */}
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: '16px',
          letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '40px',
          background: 'linear-gradient(180deg, #e0e0e0, #a8a8a8, #d0d0d0)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          Venue
        </div>

        <div style={{
          position: 'relative', width: '90%', maxWidth: '700px'
        }}>
          {/* Google Maps embed — no default pin visible, palace replaces it */}
          <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe
              title="Kiran Palace Location"
              src={`https://maps.google.com/maps?q=${GOOGLE_MAPS_QUERY}&output=embed&z=16`}
              style={{
                width: '100%', height: '380px',
                border: '2px solid rgba(192,192,192,0.25)',
                borderRadius: '8px',
                filter: 'brightness(0.85) contrast(1.1)'
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* 3D Palace icon — positioned over the red pin to replace it */}
            <a
              ref={palaceRef}
              href={`https://www.google.com/maps/search/${GOOGLE_MAPS_QUERY}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'absolute', top: '42%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 2, cursor: 'pointer', textDecoration: 'none',
                pointerEvents: 'auto',
                opacity: 0
              }}
            >
              <svg width="120" height="110" viewBox="0 0 180 160" style={{
                filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.6))'
              }}>
                {/* Palace base platform */}
                <rect x="15" y="115" width="150" height="10" rx="2"
                  fill="#e8c4a0" stroke="rgba(212,175,55,0.5)" strokeWidth="0.8" />

                {/* Main building body — peach */}
                <rect x="35" y="55" width="110" height="60" rx="2"
                  fill="url(#palaceWallPeach)" stroke="rgba(212,175,55,0.4)" strokeWidth="0.8" />

                {/* Central dome — peach */}
                <ellipse cx="90" cy="48" rx="35" ry="22"
                  fill="url(#palaceDomePeach)" stroke="rgba(212,175,55,0.5)" strokeWidth="0.8" />
                {/* Dome pinnacle */}
                <line x1="90" y1="26" x2="90" y2="16" stroke="#D4AF37" strokeWidth="1.5" />
                <circle cx="90" cy="14" r="3" fill="#D4AF37" />

                {/* Left tower */}
                <rect x="18" y="45" width="22" height="70" rx="1"
                  fill="url(#palaceWallPeach)" stroke="rgba(212,175,55,0.4)" strokeWidth="0.8" />
                <polygon points="18,45 29,22 40,45"
                  fill="url(#palaceDomePeach)" stroke="rgba(212,175,55,0.5)" strokeWidth="0.8" />
                <circle cx="29" cy="20" r="2" fill="#D4AF37" />

                {/* Right tower */}
                <rect x="140" y="45" width="22" height="70" rx="1"
                  fill="url(#palaceWallPeach)" stroke="rgba(212,175,55,0.4)" strokeWidth="0.8" />
                <polygon points="140,45 151,22 162,45"
                  fill="url(#palaceDomePeach)" stroke="rgba(212,175,55,0.5)" strokeWidth="0.8" />
                <circle cx="151" cy="20" r="2" fill="#D4AF37" />

                {/* Central door arch */}
                <rect x="78" y="85" width="24" height="30" rx="12"
                  fill="#8B6B4A" stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" />

                {/* Windows row */}
                <rect x="48" y="68" width="12" height="14" rx="6"
                  fill="#c99b6d" stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" />
                <rect x="66" y="68" width="12" height="14" rx="6"
                  fill="#c99b6d" stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" />
                <rect x="102" y="68" width="12" height="14" rx="6"
                  fill="#c99b6d" stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" />
                <rect x="120" y="68" width="12" height="14" rx="6"
                  fill="#c99b6d" stroke="rgba(212,175,55,0.3)" strokeWidth="0.5" />

                {/* Tower windows */}
                <rect x="24" y="60" width="10" height="12" rx="5"
                  fill="#c99b6d" stroke="rgba(212,175,55,0.3)" strokeWidth="0.4" />
                <rect x="146" y="60" width="10" height="12" rx="5"
                  fill="#c99b6d" stroke="rgba(212,175,55,0.3)" strokeWidth="0.4" />

                {/* Serial set lights on roofline — golden yellow dots */}
                {[40, 52, 64, 76, 88, 100, 112, 124, 136].map((lx, li) => (
                  <circle key={`light-roof-${li}`} cx={lx} cy="55" r="1.8"
                    fill="#FFD700" opacity={li % 2 === 0 ? "1" : "0.6"}
                    style={{ animation: `reception-star-twinkle ${1 + (li % 3) * 0.4}s ease-in-out ${li * 0.15}s infinite` }}
                  />
                ))}
                {/* Serial lights on dome */}
                {[60, 70, 80, 90, 100, 110, 120].map((lx, li) => (
                  <circle key={`light-dome-${li}`} cx={lx} cy={48 - 18 + Math.abs(lx - 90) * 0.12} r="1.5"
                    fill="#FFD700" opacity={li % 2 === 0 ? "0.7" : "1"}
                    style={{ animation: `reception-star-twinkle ${0.8 + (li % 4) * 0.3}s ease-in-out ${li * 0.2}s infinite` }}
                  />
                ))}
                {/* Serial lights on base platform */}
                {[20, 35, 50, 65, 80, 95, 110, 125, 140, 155].map((lx, li) => (
                  <circle key={`light-base-${li}`} cx={lx} cy="114" r="1.5"
                    fill="#FFD700" opacity={li % 2 === 0 ? "1" : "0.5"}
                    style={{ animation: `reception-star-twinkle ${1.2 + (li % 3) * 0.3}s ease-in-out ${li * 0.12}s infinite` }}
                  />
                ))}
                {/* Serial lights on left tower */}
                {[23, 29, 35].map((lx, li) => (
                  <circle key={`light-lt-${li}`} cx={lx} cy="45" r="1.3"
                    fill="#FFD700" opacity="0.8"
                    style={{ animation: `reception-star-twinkle ${1 + li * 0.3}s ease-in-out ${li * 0.25}s infinite` }}
                  />
                ))}
                {/* Serial lights on right tower */}
                {[145, 151, 157].map((lx, li) => (
                  <circle key={`light-rt-${li}`} cx={lx} cy="45" r="1.3"
                    fill="#FFD700" opacity="0.8"
                    style={{ animation: `reception-star-twinkle ${1 + li * 0.3}s ease-in-out ${li * 0.25}s infinite` }}
                  />
                ))}

                {/* Pin pointer triangle below palace */}
                <polygon points="80,125 90,145 100,125" fill="#e8c4a0" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5" />
                <circle cx="90" cy="145" r="3" fill="#D4AF37" opacity="0.6" />

                {/* Gradients — peach palette */}
                <defs>
                  <linearGradient id="palaceWallPeach" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f5d5b8" />
                    <stop offset="100%" stopColor="#e8c4a0" />
                  </linearGradient>
                  <linearGradient id="palaceDomePeach" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f8dcc4" />
                    <stop offset="100%" stopColor="#f0cca8" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Label below palace pin */}
              <div style={{
                textAlign: 'center', marginTop: '2px',
                fontFamily: "'Playfair Display', serif", fontSize: '11px',
                letterSpacing: '1px',
                color: '#fff',
                textShadow: '0 1px 4px rgba(0,0,0,0.8)',
                fontWeight: '600'
              }}>
                Kiran Palace
              </div>
            </a>
          </div>
        </div>

        {/* Bottom spacer */}
        <div style={{ height: '60px' }} />
      </div>
    </div>
  );
}
