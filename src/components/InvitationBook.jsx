import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';

export default function InvitationBook({ isExpanded }) {
  const [currentPage, setCurrentPage] = useState(0);
  const bookRef = useRef(null);
  const coverRef = useRef(null);
  const page1Ref = useRef(null);

  useEffect(() => {
    if (isExpanded) {
      gsap.fromTo(bookRef.current,
        { scale: 0.1, rotateY: 90, opacity: 0 },
        {
          scale: 1,
          rotateY: 0,
          opacity: 1,
          duration: 1.5,
          ease: "expo.out"
        }
      );
    }
  }, [isExpanded]);

  const flipPage = (target) => {
    if (target === 1 && currentPage === 0) {
      gsap.to(coverRef.current, { rotateY: -160, duration: 1.2, ease: "power2.inOut" });
      setCurrentPage(1);
    } else if (target === 2 && currentPage === 1) {
      gsap.to(page1Ref.current, { rotateY: -155, duration: 1.2, ease: "power2.inOut" });
      setCurrentPage(2);
    }
  };

  return (
    <div
      ref={bookRef}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      style={{ opacity: isExpanded ? 1 : 0 }}
    >
      <div className="relative w-[85vw] max-w-[400px] h-[60vh] perspective-2000 pointer-events-auto">

        <div className="absolute inset-0 bg-white border-2 border-gold shadow-2xl p-6 flex flex-col items-center justify-center text-center" style={{ zIndex: 1, borderRadius: '4px' }}>
          <h2 className="font-serif text-2xl text-maroon mb-2">The Reception</h2>
          <div className="w-full aspect-video bg-gray-100 mb-4 border border-gold/30 relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-teal opacity-10" />
            <div className="relative text-maroon font-serif text-sm">Rani Pink & Teal Blue Celebration</div>
            <div className="absolute inset-0 bg-white opacity-0 paparazzi-flash" style={{ animation: 'paparazzi 2s infinite' }} />
          </div>
        </div>

        <div
          ref={page1Ref}
          className="absolute inset-0 bg-white border-2 border-gold shadow-2xl p-6 flex flex-col items-center text-center preserve-3d"
          style={{ zIndex: 5, borderRadius: '4px', transformOrigin: 'left' }}
        >
          <div className="w-16 h-1 border-t border-b border-gold mb-6" />
          <p className="font-serif text-maroon text-lg mb-4">Vishwaksenan weds Monisha</p>
          <div className="w-full aspect-square bg-[#fffef0] mb-4 border border-gold/20 flex items-center justify-center p-2">
            <div className="w-full h-full border border-maroon/10 flex flex-col items-center justify-center gap-2">
              <div className="w-3/4 h-1/2 border-2 border-maroon/20 rounded-t-full" />
            </div>
          </div>
          {currentPage === 1 && (
            <button onClick={() => flipPage(2)} className="mt-auto text-gold font-serif text-sm tracking-widest border-b border-gold pb-1 animate-pulse">
              Next: Reception
            </button>
          )}
        </div>

        <div
          ref={coverRef}
          className="absolute inset-0 bg-gold border-2 border-gold-dark shadow-2xl flex flex-col items-center justify-center p-8 preserve-3d"
          style={{ zIndex: 10, borderRadius: '4px', transformOrigin: 'left' }}
        >
          <div className="w-20 h-20 border-2 border-white rounded-full flex items-center justify-center mb-4">
            <span className="font-serif text-white text-3xl font-bold">V&M</span>
          </div>
          <button onClick={() => flipPage(1)} className="bg-white text-maroon px-6 py-2 rounded-sm font-sans text-xs font-bold tracking-widest">
            OPEN BOOK
          </button>
        </div>
      </div>
      <style>{`@keyframes paparazzi { 0%, 5%, 10% { opacity: 0; } 7% { opacity: 0.8; } 100% { opacity: 0; } }`}</style>
    </div>
  );
}
