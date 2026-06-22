import React, { useState, useEffect, useRef } from 'react';
import Loader from './components/Loader';
import HeroSky from './components/HeroSky';
import LetterDrop from './components/LetterDrop';
import Reception from './components/Reception';
import Gallery from './components/Gallery';
import TabBar from './components/TabBar';
import Lenis from '@studio-freight/lenis';

export default function App() {
  // Landing page = Gallery
  const [activeTab, setActiveTab] = useState('gallery');

  // The invitation flow runs its loader the first time the user opens it.
  // After that, switching back is instant (no loader).
  const [invitationReady, setInvitationReady] = useState(false);
  const [showInvitationLoader, setShowInvitationLoader] = useState(false);

  const [invitationExpanded, setInvitationExpanded] = useState(false);
  const [showReception, setShowReception] = useState(false);
  const receptionRef = useRef(null);

  // Smooth Scrolling (enabled once we have any interactive content rendered)
  useEffect(() => {
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
  }, []);

  const handleOpenInvitation = () => {
    setInvitationExpanded(true);
  };

  const handleFlipComplete = () => {
    setShowReception(true);
    setTimeout(() => {
      receptionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;

    // First time opening the invitation tab — run the loader briefly.
    if (tabId === 'invitation' && !invitationReady) {
      setShowInvitationLoader(true);
      setActiveTab('invitation');
      setTimeout(() => {
        setInvitationReady(true);
        setShowInvitationLoader(false);
      }, 1500);
    } else {
      setActiveTab(tabId);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showLoader = showInvitationLoader;

  return (
    <main className={`relative w-full ${showLoader ? 'no-scroll' : ''} bg-black`}>
      {/* Loader — shown only while the invitation tab is preparing for the first time */}
      {showLoader && <Loader progress={100} />}

      {/* Top Tab Navigation — always available */}
      {!showLoader && <TabBar active={activeTab} onChange={handleTabChange} />}

      {/* Gallery tab (landing page) */}
      {!showLoader && activeTab === 'gallery' && (
        <div className="relative w-full">
          <Gallery />
        </div>
      )}

      {/* Invitation tab — Hero Sky → Letter Drop → Reception */}
      {!showLoader && activeTab === 'invitation' && invitationReady && (
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
