import React from 'react';

export default function FooterMap() {
  const mapUrl = "https://maps.app.goo.gl/YourSpecificLink";

  return (
    <section className="relative w-full py-24 flex flex-col items-center justify-center bg-[#fafafa]">
      <div className="w-16 h-px bg-gold mb-12" />
      <h2 className="font-serif text-2xl text-maroon mb-2 uppercase tracking-widest">Finding The Palace</h2>
      <p className="font-sans text-xs text-gold-dark mb-12 tracking-widest">KIRAN PALACE, KORATTUR</p>

      <div 
        onClick={() => window.open(mapUrl, '_blank')}
        className="relative w-[90vw] max-w-[600px] aspect-video rounded-lg shadow-2xl overflow-hidden cursor-pointer group"
      >
         <div 
            className="absolute inset-0 grayscale contrast-125 opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" 
            style={{ 
              background: 'url("https://www.google.com/maps/vt/pb=!1m4!1m3!1i15!2i18881!3i12469!2m3!1e0!2sm!3i667055740!3m8!2sen!3sus!5e1105!12m4!1e68!2m2!1sset!2sRoadmap!4e0!5m1!1e0!23i4111425!23i4111300!23i4111166")',
              backgroundSize: 'cover'
            }}
         />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] z-20">
            <div className="relative animate-float">
               <div className="w-16 h-20 bg-gold border-2 border-gold-dark shadow-2xl flex flex-col items-center">
                  <div className="w-20 h-8 bg-gold-dark -mt-4 border-b-2 border-gold" style={{ borderRadius: '50% 50% 0 0' }} />
               </div>
               <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white absolute -bottom-1 left-1/2 -translate-x-1/2 shadow-lg" />
            </div>
         </div>
      </div>
    </section>
  );
}
