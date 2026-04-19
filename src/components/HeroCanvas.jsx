import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HeroCanvas({ images, onOpen }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sliderRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const totalFrames = 21;
  const hasTriggeredRef = useRef(false);

  // Synchronize Scroll and Frames
  useEffect(() => {
    if (!containerRef.current) return;

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        const frame = Math.floor(self.progress * (totalFrames - 1));
        const safeFrame = Math.min(frame, totalFrames - 1);
        setCurrentFrame(safeFrame);
        
        // Sync Slider Handle Position
        if (sliderRef.current) {
          sliderRef.current.value = self.progress * 100;
        }

        if (self.progress > 0.95 && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          onOpen();
        }
      }
    });

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, [onOpen]);

  // DRAGGABLE SLIDER LOGIC
  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value) / 100;
    const frame = Math.floor(val * (totalFrames - 1));
    setCurrentFrame(frame);
    
    // Manually push ScrollTrigger to current position if dragged
    const st = ScrollTrigger.getById('sequence-trigger'); // Not used id in current ref, using global or better just let scroll handle it
    // Actually, dragging the slider should ideally move the page scroll.
    const scrollPos = containerRef.current.offsetTop + (val * containerRef.current.offsetHeight);
    window.scrollTo({ top: scrollPos, behavior: 'instant' });
  };

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const ctx = canvas.getContext('2d');
    const img = images[currentFrame];
    if (img) {
      canvas.width = 600;
      canvas.height = 800;
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
  }, [currentFrame, images]);

  const progressText = currentFrame < 12 
    ? "From College Corridors" 
    : "To marriage vows, we grew together";

  return (
    <div ref={containerRef} className="relative w-full z-20 flex flex-col items-center" style={{ height: '400vh', background: 'linear-gradient(to bottom, #ffffff 0%, #f0f4f8 50%, #e8ecf0 100%)' }}>
      <div className="sticky top-0 h-dvh w-full flex flex-col items-center justify-center pointer-events-none">
        
        {/* 1. Dynamic Cursive Text */}
        <div className="text-3xl md:text-5xl text-center px-4 transition-all duration-700" style={{ fontFamily: "'Great Vibes', cursive", minHeight: '80px', color: '#b8860b' }}>
          {progressText}
        </div>

        {/* 2. -- 3 LINE GAPS (Literal breaks) -- */}
        <br /><br /><br />

        {/* 3. Golden Arrow Slider */}
        <div className="relative w-64 md:w-80 h-10 flex items-center pointer-events-auto">
           <input 
             ref={sliderRef}
             type="range" 
             min="0" max="100" 
             onChange={handleSliderChange}
             className="w-full appearance-none bg-gold/10 h-0.5 rounded-full cursor-pointer outline-none"
             style={{ accentColor: 'var(--gold)' }}
           />
           {/* Draggable Golden Arrow Handle */}
           <div 
             className="absolute pointer-events-none"
             style={{ 
               left: `calc(${ (currentFrame / (totalFrames - 1)) * 100 }% - 12px)`,
               filter: 'drop-shadow(0 0 8px var(--gold))'
             }}
           >
             <svg width="28" height="28" viewBox="0 0 24 24" fill="var(--gold)">
                <path d="M12 2l10 10-10 10V2z" />
             </svg>
           </div>
        </div>

        {/* 4. -- 2 LINE GAPS (Literal breaks) -- */}
        <br /><br />

        {/* 5. Golden Framed Sequence */}
        <div className="relative p-2 bg-gradient-to-br from-gold-light via-gold to-gold-dark rounded-sm shadow-[0_40px_80px_rgba(0,0,0,0.9)]" style={{ border: '3px solid var(--gold-dark)' }}>
           
           {/* Mirrored Cupids floating at corners */}
           <div className="absolute -top-14 -left-14 w-24 h-24 opacity-80 animate-float pointer-events-none">
             <img src="/cupid.png" alt="cupid" className="w-full h-full object-contain" />
           </div>
           <div className="absolute -top-14 -right-14 w-24 h-24 opacity-80 animate-float pointer-events-none" style={{ transform: 'scaleX(-1)' }}>
             <img src="/cupid.png" alt="cupid" className="w-full h-full object-contain" />
           </div>

           <div className="bg-black overflow-hidden relative" style={{ width: '280px', height: '400px' }}>
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
           </div>
        </div>

      </div>

      <style>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 30px;
          height: 30px;
          background: transparent;
          border: none;
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
