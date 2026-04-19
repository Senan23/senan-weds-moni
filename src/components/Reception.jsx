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
        0%, 100% { transform: translateX(-50%) translateY(0px); }
        50% { transform: translateX(-50%) translateY(-8px); }
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
    : "To marriage vows, We've grown together";

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

      {/* ═══ SECTION 1: Canvas sequence ═══ */}
      <div ref={canvasSectionRef} style={{
        height: '100vh', position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column'
      }}>
        {/* Decorative frame */}
        <div style={{
          position: 'relative', padding: '10px',
          border: '2px solid rgba(192,192,192,0.35)',
          borderRadius: '6px',
          boxShadow: '0 0 30px rgba(192,192,192,0.08), inset 0 0 20px rgba(192,192,192,0.04)',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <div style={{
            position: 'absolute', inset: '4px',
            border: '1px solid rgba(192,192,192,0.15)',
            borderRadius: '4px', pointerEvents: 'none'
          }} />
          <canvas ref={canvasRef} style={{
            display: 'block',
            maxWidth: '75vw', maxHeight: '55vh',
            width: '100%', height: 'auto',
            borderRadius: '2px'
          }} />
        </div>

        {/* Text overlay below frame */}
        <div ref={textOverlayRef} style={{
          marginTop: '28px', textAlign: 'center',
          fontFamily: "'Great Vibes', cursive", fontSize: '30px',
          background: 'linear-gradient(180deg, #ffffff 0%, #c0c0c0 40%, #e8e8e8 70%, #a0a0a0 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 10px rgba(192,192,192,0.3))',
          transition: 'opacity 0.4s ease',
          minHeight: '44px'
        }}>
          {textOverlay}
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
          {/* 3D Palace structure hovering above map */}
          <a
            ref={palaceRef}
            href={`https://www.google.com/maps/search/${GOOGLE_MAPS_QUERY}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: 'absolute', top: '-90px', left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2, cursor: 'pointer', textDecoration: 'none',
              animation: 'palace-float 4s ease-in-out infinite',
              opacity: 0
            }}
          >
            <svg width="180" height="140" viewBox="0 0 180 140" style={{
              filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.6))'
            }}>
              {/* Palace base platform */}
              <rect x="15" y="115" width="150" height="10" rx="2"
                fill="#1a237e" stroke="rgba(192,192,192,0.4)" strokeWidth="0.8" />

              {/* Main building body */}
              <rect x="35" y="55" width="110" height="60" rx="2"
                fill="url(#palaceWall)" stroke="rgba(192,192,192,0.35)" strokeWidth="0.8" />

              {/* Central dome */}
              <ellipse cx="90" cy="48" rx="35" ry="22"
                fill="url(#palaceDome)" stroke="rgba(192,192,192,0.4)" strokeWidth="0.8" />
              {/* Dome pinnacle */}
              <line x1="90" y1="26" x2="90" y2="16" stroke="#D4AF37" strokeWidth="1.5" />
              <circle cx="90" cy="14" r="3" fill="#D4AF37" />

              {/* Left tower */}
              <rect x="18" y="45" width="22" height="70" rx="1"
                fill="url(#palaceWall)" stroke="rgba(192,192,192,0.35)" strokeWidth="0.8" />
              <polygon points="18,45 29,22 40,45"
                fill="url(#palaceDome)" stroke="rgba(192,192,192,0.4)" strokeWidth="0.8" />
              <circle cx="29" cy="20" r="2" fill="#D4AF37" />

              {/* Right tower */}
              <rect x="140" y="45" width="22" height="70" rx="1"
                fill="url(#palaceWall)" stroke="rgba(192,192,192,0.35)" strokeWidth="0.8" />
              <polygon points="140,45 151,22 162,45"
                fill="url(#palaceDome)" stroke="rgba(192,192,192,0.4)" strokeWidth="0.8" />
              <circle cx="151" cy="20" r="2" fill="#D4AF37" />

              {/* Central door arch */}
              <rect x="78" y="85" width="24" height="30" rx="12"
                fill="#0d1a35" stroke="rgba(192,192,192,0.25)" strokeWidth="0.5" />

              {/* Windows row */}
              <rect x="48" y="68" width="12" height="14" rx="6"
                fill="#0d47a1" stroke="rgba(192,192,192,0.25)" strokeWidth="0.5" />
              <rect x="66" y="68" width="12" height="14" rx="6"
                fill="#0d47a1" stroke="rgba(192,192,192,0.25)" strokeWidth="0.5" />
              <rect x="102" y="68" width="12" height="14" rx="6"
                fill="#0d47a1" stroke="rgba(192,192,192,0.25)" strokeWidth="0.5" />
              <rect x="120" y="68" width="12" height="14" rx="6"
                fill="#0d47a1" stroke="rgba(192,192,192,0.25)" strokeWidth="0.5" />

              {/* Tower windows */}
              <rect x="24" y="60" width="10" height="12" rx="5"
                fill="#0d47a1" stroke="rgba(192,192,192,0.2)" strokeWidth="0.4" />
              <rect x="146" y="60" width="10" height="12" rx="5"
                fill="#0d47a1" stroke="rgba(192,192,192,0.2)" strokeWidth="0.4" />

              {/* Gradients */}
              <defs>
                <linearGradient id="palaceWall" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1a237e" />
                  <stop offset="100%" stopColor="#0d1452" />
                </linearGradient>
                <linearGradient id="palaceDome" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#283593" />
                  <stop offset="100%" stopColor="#1a237e" />
                </linearGradient>
              </defs>
            </svg>

            {/* Label below palace */}
            <div style={{
              textAlign: 'center', marginTop: '4px',
              fontFamily: "'Playfair Display', serif", fontSize: '13px',
              letterSpacing: '2px',
              background: 'linear-gradient(180deg, #e0e0e0, #a8a8a8)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              Kiran Palace, Korattur
            </div>
          </a>

          {/* Google Maps embed */}
          <iframe
            title="Kiran Palace Location"
            src={`https://maps.google.com/maps?q=${GOOGLE_MAPS_QUERY}&output=embed`}
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
        </div>

        {/* Bottom spacer */}
        <div style={{ height: '60px' }} />
      </div>
    </div>
  );
}
