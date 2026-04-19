import React, { useState, useEffect, useRef } from 'react';
import Loader from './components/Loader';
import HeroSky from './components/HeroSky';
import LetterDrop from './components/LetterDrop';
import Reception from './components/Reception';
import Lenis from '@studio-freight/lenis';

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [invitationExpanded, setInvitationExpanded] = useState(false);
  const [showReception, setShowReception] = useState(false);
  const receptionRef = useRef(null);

  // Auto-start (no image preloading needed now)
  useEffect(() => {
    setTimeout(() => setIsStarted(true), 1500);
  }, []);

  // Smooth Scrolling
  useEffect(() => {
    if (!isStarted) return;
    const lenis = new Lenis({
      duration: 1.5,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
    });
    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, [isStarted]);

  const handleOpenInvitation = () => {
    setInvitationExpanded(true);
  };

  const handleFlipComplete = () => {
    setShowReception(true);
    setTimeout(() => {
      receptionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <main className={`relative w-full ${!isStarted ? 'no-scroll' : ''} bg-black`}>
      {/* Scene 1: Loader */}
      {!isStarted && <Loader progress={100} />}

      {isStarted && (
        <div className="relative w-full overflow-hidden">
          
          {/* Scene 2: Hero Sky */}
          <div className="relative z-10">
            <HeroSky />
          </div>

          {/* Scene 3: Red Door & Letter Drop */}
          <div className="relative z-20">
             <LetterDrop 
                onComplete={handleOpenInvitation}
                onFlipComplete={handleFlipComplete}
             />
          </div>

          {/* Scene 4: Reception */}
          {showReception && (
            <div ref={receptionRef} className="relative z-30">
              <Reception />
            </div>
          )}

          {/* Spacer for bottom scrolling */}
          <div className="h-[20vh] bg-black" />

        </div>
      )}
    </main>
  );
}
