import React from 'react';

export default function Loader({ progress }) {
  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-center">
      {/* 1. Title - Neat Cursive */}
      <h1 className="text-gold text-4xl tracking-wide" style={{ fontFamily: "'Dancing Script', cursive" }}>
        Senan and Moni
      </h1>
      
      {/* 2 Line Breaks */}
      <br /><br />
      
      {/* 2. Progress Bar */}
      <div style={{ width: '200px', height: '3px', background: 'rgba(212,175,55,0.1)', position: 'relative', borderRadius: '4px' }}>
        <div 
          style={{ 
            height: '100%', 
            background: 'var(--gold)', 
            width: `${progress}%`,
            transition: 'width 0.2s ease-out',
            boxShadow: '0 0 10px var(--gold)'
          }} 
        />
      </div>

      {/* 2 Line Breaks */}
      <br /><br />

      {/* 3. Simple Loading Text */}
      <div className="text-[0.7rem] text-gold/60 tracking-widest font-sans uppercase">
        Loading ... {progress}%
      </div>

      {/* 2 Line Breaks */}
      <br /><br />

      {/* 4. Husky Video - Simple centered GIF style */}
      <div style={{ width: '120px' }}>
        <video 
          src="/husky.MOV" 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-auto grayscale contrast-125 opacity-80"
          style={{ mixBlendMode: 'screen' }}
        />
      </div>
    </div>
  );
}
