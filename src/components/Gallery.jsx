import React, { useState, useMemo, useEffect, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   ADD YOUR PHOTOS HERE
   ─────────────────────────────────────────────────────────────────────────────
   1. Drop image files into:  public/images/
      (e.g. public/images/marriage pic 1.jpeg)
   2. Reference them below using the path "/images/<filename>" — the leading
      "/" points to the public folder. Spaces in filenames are written as %20.
   3. Order is randomized on every visit.
   ──────────────────────────────────────────────────────────────────────────── */
const GALLERY_ITEMS = [
  { src: '/images/marriage%20pic%201.jpeg'  },
  { src: '/images/marriage%20pic%202.jpeg'  },
  { src: '/images/marriage%20pic%203.jpeg'  },
  { src: '/images/marriage%20pic%204.jpeg'  },
  { src: '/images/marriage%20pic%205.jpeg'  },
  { src: '/images/marriage%20pic%206.jpeg'  },
  { src: '/images/marriage%20pic%207.jpeg'  },
  { src: '/images/marriage%20pic%208.jpeg'  },
  { src: '/images/marriage%20pic%209.jpeg'  },
  { src: '/images/marriage%20pic%2010.jpeg' },
  { src: '/images/marriage%20pic%2011.jpeg' },
];

// Fisher–Yates shuffle (immutable). Used to randomize order on mount.
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const COVER_OPEN_MS = 1300;
const PAGE_TURN_MS  = 950;

export default function Gallery() {
  const items = useMemo(() => shuffle(GALLERY_ITEMS), []);
  const N = items.length;
  // Each "spread" shows 2 photos side-by-side (left + right). With an odd
  // photo count the final spread's right page is blank, then navigation
  // wraps back to the first spread.
  const spreads = Math.ceil(N / 2);

  // 'closed'  → only cover visible
  // 'opening' → cover flipping animation in progress
  // 'open'    → spread visible, page-turn enabled
  const [bookState, setBookState] = useState('closed');
  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState(null); // { dir: 'next'|'prev', from, to } | null
  const [fullscreen, setFullscreen] = useState(false);

  const openBook = useCallback(() => {
    if (bookState !== 'closed') return;
    setBookState('opening');
    window.setTimeout(() => setBookState('open'), COVER_OPEN_MS);
  }, [bookState]);

  const goNext = useCallback(() => {
    if (flipping || bookState !== 'open') return;
    // After the very last photo, close the book and return to the front cover
    // instead of wrapping around to the start.
    if (index === spreads - 1) {
      setBookState('closing');
      window.setTimeout(() => {
        setBookState('closed');
        setIndex(0);
      }, COVER_OPEN_MS);
      return;
    }
    const to = index + 1;
    setFlipping({ dir: 'next', from: index, to });
    window.setTimeout(() => {
      setIndex(to);
      setFlipping(null);
    }, PAGE_TURN_MS);
  }, [flipping, bookState, index, spreads]);

  const goPrev = useCallback(() => {
    if (flipping || bookState !== 'open') return;
    const to = (index - 1 + spreads) % spreads;
    setFlipping({ dir: 'prev', from: index, to });
    window.setTimeout(() => {
      setIndex(to);
      setFlipping(null);
    }, PAGE_TURN_MS);
  }, [flipping, bookState, index, spreads]);

  // Inject keyframes once
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-gallery-styles', '');
    style.textContent = `
      @keyframes gallery-fade-in {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes gallery-cover-open {
        0%   { transform: rotateY(0deg);   box-shadow: 0 28px 60px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(212,175,55,0.45); }
        100% { transform: rotateY(-178deg); box-shadow: -28px 28px 60px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(212,175,55,0.45); }
      }
      @keyframes gallery-cover-close {
        0%   { transform: rotateY(-178deg); box-shadow: -28px 28px 60px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(212,175,55,0.45); }
        100% { transform: rotateY(0deg);    box-shadow: 0 28px 60px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(212,175,55,0.45); }
      }
      @keyframes gallery-page-turn-next {
        0%   { transform: rotateY(0deg);    box-shadow: 6px 6px 18px rgba(0,0,0,0.35); }
        100% { transform: rotateY(-178deg); box-shadow: -6px 6px 18px rgba(0,0,0,0.35); }
      }
      @keyframes gallery-page-turn-prev {
        0%   { transform: rotateY(0deg);    box-shadow: -6px 6px 18px rgba(0,0,0,0.35); }
        100% { transform: rotateY(178deg);  box-shadow: 6px 6px 18px rgba(0,0,0,0.35); }
      }
      @keyframes gallery-spread-fade {
        0%   { opacity: 0; }
        40%  { opacity: 0; }
        100% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (fullscreen) {
        if (e.key === 'Escape')     setFullscreen(false);
        if (e.key === 'ArrowLeft')  goPrev();
        if (e.key === 'ArrowRight') goNext();
        return;
      }
      if (bookState === 'closed') {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openBook();
        }
        return;
      }
      if (e.key === 'ArrowLeft')  goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bookState, fullscreen, goPrev, goNext, openBook]);

  // Lock body scroll while fullscreen
  useEffect(() => {
    if (!fullscreen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [fullscreen]);

  // Photos run in order across spreads: spread `i` shows items[i*2] on the
  // left and items[i*2+1] on the right. The final spread's right page may be
  // blank when the photo count is odd.
  //
  // While a page is mid-flip we tweak which photo each static page shows so
  // the animation lands seamlessly: the side that will be *revealed* by the
  // flip already shows the destination photo (so it's there as the page
  // lifts away), and the side that will be *covered* stays on the source
  // photo (matching what the flipping page's back face lands on, then the
  // static page updates to the destination as the flipping sheet is removed).
  const photoAt = (i) => (i < N ? items[i] : null);
  let leftPhoto, rightPhoto;
  if (flipping) {
    if (flipping.dir === 'next') {
      leftPhoto  = photoAt(flipping.from * 2);      // source left (covered by back face at end)
      rightPhoto = photoAt(flipping.to   * 2 + 1);  // destination right (revealed as flip lifts)
    } else {
      leftPhoto  = photoAt(flipping.to   * 2);      // destination left (revealed as flip lifts)
      rightPhoto = photoAt(flipping.from * 2 + 1);  // source right (covered by back face at end)
    }
  } else {
    leftPhoto  = photoAt(index * 2);
    rightPhoto = photoAt(index * 2 + 1);
  }

  // Photo highlighted in fullscreen + counter (right page if present, else left).
  const currentPhoto = rightPhoto || leftPhoto;
  const currentPhotoNumber = rightPhoto ? index * 2 + 2 : index * 2 + 1;
  const showSpread   = bookState !== 'closed';

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        padding: '110px 24px 80px',
        overflow: 'hidden',
        background: '#ffffff',
      }}
    >
      {/* Top-down working-desk backdrop: keyboard and mouse on a white desk */}
      <DeskBackground />


      {/* ─── BOOK STAGE ──────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          perspective: '2400px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '64vh',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 'min(880px, 94vw)',
            height: 'min(600px, 62vh)',
            transformStyle: 'preserve-3d',
            transform: bookState === 'closed' ? 'translateX(-25%)' : 'translateX(0)',
            transition: `transform ${COVER_OPEN_MS}ms cubic-bezier(0.6, 0.05, 0.3, 1)`,
          }}
        >
          {/* Spread (left + right pages) */}
          {showSpread && (
            <>
              <PageBackground
                side="left"
                photo={leftPhoto}
                onClick={() => setFullscreen(true)}
                fadeIn={bookState === 'opening'}
              />
              <PageBackground
                side="right"
                photo={rightPhoto}
                onClick={() => setFullscreen(true)}
                fadeIn={bookState === 'opening'}
              />
              {/* Spine */}
              <div
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  transform: 'translateX(-50%)',
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0.0) 0%, rgba(0,0,0,0.45) 12%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.45) 88%, rgba(0,0,0,0.0) 100%)',
                  boxShadow:
                    'inset 1px 0 0 rgba(255,255,255,0.06), inset -1px 0 0 rgba(255,255,255,0.06)',
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              />
            </>
          )}

          {/* COVER — visible while closed or opening */}
          {bookState !== 'open' && (
            <BookCover
              state={bookState}
              onOpen={openBook}
            />
          )}

          {/* PAGE-TURN OVERLAY */}
          {flipping && bookState === 'open' && (
            <FlippingPage
              direction={flipping.dir}
              frontPhoto={
                flipping.dir === 'next'
                  ? photoAt(flipping.from * 2 + 1)
                  : photoAt(flipping.from * 2)
              }
              backPhoto={
                flipping.dir === 'next'
                  ? photoAt(flipping.to * 2)
                  : photoAt(flipping.to * 2 + 1)
              }
            />
          )}
        </div>
      </div>

      {/* Counter */}
      {bookState === 'open' && (
        <div style={{ textAlign: 'center', marginTop: '24px', position: 'relative', zIndex: 1 }}>
          <div
            key={`counter-${index}`}
            style={{
              color: 'rgba(60,45,25,0.75)',
              fontSize: '0.8rem',
              letterSpacing: '0.3em',
              fontFamily: "'Inter', sans-serif",
              animation: 'gallery-fade-in 0.4s ease both',
            }}
          >
            {String(currentPhotoNumber).padStart(2, '0')} / {String(N).padStart(2, '0')}
          </div>
        </div>
      )}

      {/* Controls (open state) */}
      {bookState === 'open' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            marginTop: '24px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <ArrowButton direction="left" onClick={goPrev} disabled={!!flipping} />
          <ArrowButton direction="right" onClick={goNext} disabled={!!flipping} />
        </div>
      )}

      {/* Hint */}
      <p
        style={{
          textAlign: 'center',
          marginTop: '36px',
          color: 'rgba(60,45,25,0.55)',
          fontSize: '0.78rem',
          letterSpacing: '0.15em',
          fontFamily: "'Inter', sans-serif",
          position: 'relative',
          zIndex: 1,
        }}
      >
        {bookState === 'closed'
          ? 'Click the book to open'
          : 'Click a photo to view full screen · Use ← → keys to turn pages'}
      </p>

      {/* Fullscreen overlay */}
      {fullscreen && bookState === 'open' && (
        <Fullscreen
          photo={currentPhoto}
          index={currentPhotoNumber - 1}
          total={N}
          onClose={() => setFullscreen(false)}
          onPrev={goPrev}
          onNext={goNext}
        />
      )}
    </section>
  );
}

/* ─── BOOK COVER ─────────────────────────────────────────────────────────── */

function BookCover({ state, onOpen }) {
  const isOpening = state === 'opening';
  const isClosing = state === 'closing';
  return (
    <button
      onClick={onOpen}
      disabled={isOpening || isClosing}
      aria-label="Open the book"
      style={{
        position: 'absolute',
        left: '50%',
        top: 0,
        width: '50%',
        height: '100%',
        padding: 0,
        border: 'none',
        cursor: state === 'closed' ? 'pointer' : 'default',
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden',
        animation: isOpening
          ? `gallery-cover-open ${COVER_OPEN_MS}ms cubic-bezier(0.6, 0.05, 0.3, 1) both`
          : isClosing
            ? `gallery-cover-close ${COVER_OPEN_MS}ms cubic-bezier(0.6, 0.05, 0.3, 1) both`
            : 'none',
        borderRadius: '4px 14px 14px 4px',
        overflow: 'hidden',
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(255,210,120,0.10) 0%, transparent 60%),
          linear-gradient(135deg, #4a0e0e 0%, #6b1414 30%, #8a1c1c 50%, #5c1010 75%, #380808 100%)
        `,
        boxShadow:
          '0 28px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.45), inset 0 0 60px rgba(0,0,0,0.45)',
        zIndex: 4,
      }}
    >
      <CoverFace />
    </button>
  );
}

function CoverFace() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 28px',
        textAlign: 'center',
        // gold ornate frame
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.0), rgba(0,0,0,0.0)),
          repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 6px)
        `,
      }}
    >
      {/* Ornate inner border */}
      <div
        style={{
          position: 'absolute',
          inset: '18px',
          border: '1px solid rgba(212,175,55,0.7)',
          borderRadius: '4px',
          boxShadow:
            'inset 0 0 0 4px rgba(0,0,0,0.25), inset 0 0 0 5px rgba(212,175,55,0.35)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '30px',
          border: '1px solid rgba(212,175,55,0.35)',
          borderRadius: '2px',
          pointerEvents: 'none',
        }}
      />

      {/* Corner flourishes */}
      {['tl', 'tr', 'bl', 'br'].map((c) => (
        <div
          key={c}
          style={{
            position: 'absolute',
            width: '36px',
            height: '36px',
            top: c.startsWith('t') ? '24px' : 'auto',
            bottom: c.startsWith('b') ? '24px' : 'auto',
            left: c.endsWith('l') ? '24px' : 'auto',
            right: c.endsWith('r') ? '24px' : 'auto',
            borderTop:    c.startsWith('t') ? '2px solid rgba(212,175,55,0.85)' : 'none',
            borderBottom: c.startsWith('b') ? '2px solid rgba(212,175,55,0.85)' : 'none',
            borderLeft:   c.endsWith('l')   ? '2px solid rgba(212,175,55,0.85)' : 'none',
            borderRight:  c.endsWith('r')   ? '2px solid rgba(212,175,55,0.85)' : 'none',
            opacity: 0.85,
          }}
        />
      ))}

      <h1
        style={{
          fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
          fontWeight: 700,
          fontSize: 'clamp(40px, 6.5vw, 68px)',
          lineHeight: 1,
          letterSpacing: '0.18em',
          margin: 0,
          textAlign: 'center',
          background:
            'linear-gradient(180deg, #f8e7b0 0%, #d4af37 50%, #8c6b17 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
          position: 'relative',
          zIndex: 1,
        }}
      >
        SENAN
      </h1>

      <p
        style={{
          fontFamily: "'Great Vibes', 'Dancing Script', cursive",
          fontSize: 'clamp(24px, 3.4vw, 34px)',
          margin: '8px 0',
          color: 'rgba(241,229,172,0.95)',
          textShadow: '0 1px 4px rgba(0,0,0,0.55)',
          letterSpacing: '0.04em',
          position: 'relative',
          zIndex: 1,
        }}
      >
        married
      </p>

      <h1
        style={{
          fontFamily: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
          fontWeight: 700,
          fontSize: 'clamp(40px, 6.5vw, 68px)',
          lineHeight: 1,
          letterSpacing: '0.18em',
          margin: 0,
          textAlign: 'center',
          background:
            'linear-gradient(180deg, #f8e7b0 0%, #d4af37 50%, #8c6b17 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.6))',
          position: 'relative',
          zIndex: 1,
        }}
      >
        MONI
      </h1>

      <div
        style={{
          marginTop: '20px',
          width: '70px',
          height: '1px',
          background:
            'linear-gradient(90deg, transparent, rgba(212,175,55,0.8), transparent)',
        }}
      />
    </div>
  );
}

/* ─── PAGE BACKGROUND (static left/right pages) ──────────────────────────── */

function PageBackground({ side, photo, onClick, fadeIn }) {
  const isLeft = side === 'left';
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: isLeft ? '0%' : '50%',
        width: '50%',
        height: '100%',
        borderRadius: isLeft ? '12px 2px 2px 12px' : '2px 12px 12px 2px',
        overflow: 'hidden',
        background: `
          linear-gradient(${isLeft ? '90deg' : '270deg'}, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.0) 18%),
          linear-gradient(135deg, #f5ecd6 0%, #ecdfb8 35%, #f7eccf 70%, #e6d8a8 100%)
        `,
        boxShadow:
          'inset 0 0 30px rgba(0,0,0,0.18), 0 18px 50px rgba(0,0,0,0.45)',
        animation: fadeIn ? `gallery-spread-fade ${COVER_OPEN_MS}ms ease forwards` : 'none',
      }}
    >
      <PhotoFrame photo={photo} onClick={onClick} />
    </div>
  );
}

/* ─── PHOTO CARD (centered, auto-sized to the image's aspect ratio) ─────── */

function PhotoCard({ photo, onClick }) {
  // Start with a sensible default ratio; updated to the image's real ratio
  // as soon as it loads. Using `aspectRatio` + `maxWidth/maxHeight` keeps the
  // card sized exactly to the photo so the corner tape sits on the image,
  // not on empty page space.
  const [ratio, setRatio] = React.useState('4 / 3');

  if (!photo) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6%',
      }}
    >
      <div
        onClick={onClick}
        style={{
          position: 'relative',
          aspectRatio: ratio,
          maxWidth: '100%',
          maxHeight: '100%',
          cursor: onClick ? 'zoom-in' : 'default',
          boxShadow:
            '0 6px 18px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
          background: '#1a1a1a',
        }}
      >
        <img
          src={photo.src}
          alt=""
          onLoad={(e) => {
            const w = e.currentTarget.naturalWidth;
            const h = e.currentTarget.naturalHeight;
            if (w && h) setRatio(`${w} / ${h}`);
          }}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
          }}
        />
        {/* Washi-tape plasters anchored to the image's own corners */}
        <PhotoTape corner="tl" />
        <PhotoTape corner="tr" />
        <PhotoTape corner="bl" />
        <PhotoTape corner="br" />
      </div>
    </div>
  );
}

function PhotoFrame({ photo, onClick }) {
  if (!photo) return null;
  return (
    <button
      onClick={onClick}
      aria-label="View full screen"
      style={{
        position: 'absolute',
        inset: 0,
        border: 'none',
        padding: 0,
        background: 'transparent',
        cursor: 'zoom-in',
      }}
    >
      <PhotoCard key={photo.src} photo={photo} />
    </button>
  );
}

/* ─── FLIPPING PAGE OVERLAY ──────────────────────────────────────────────── */

function FlippingPage({ direction, frontPhoto, backPhoto }) {
  const isNext = direction === 'next';
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: isNext ? '50%' : '0%',
        width: '50%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transformOrigin: isNext ? 'left center' : 'right center',
        animation: `${isNext ? 'gallery-page-turn-next' : 'gallery-page-turn-prev'} ${PAGE_TURN_MS}ms cubic-bezier(0.45, 0, 0.3, 1) forwards`,
        zIndex: 5,
        borderRadius: isNext ? '2px 12px 12px 2px' : '12px 2px 2px 12px',
        pointerEvents: 'none',
      }}
    >
      {/* Front face (visible at start) */}
      <FlipFace photo={frontPhoto} side={isNext ? 'right' : 'left'} />
      {/* Back face (visible after 90°) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: 'rotateY(180deg)',
          backfaceVisibility: 'hidden',
        }}
      >
        <FlipFace photo={backPhoto} side={isNext ? 'left' : 'right'} />
      </div>
    </div>
  );
}

function FlipFace({ photo, side }) {
  const isLeft = side === 'left';
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backfaceVisibility: 'hidden',
        borderRadius: isLeft ? '12px 2px 2px 12px' : '2px 12px 12px 2px',
        overflow: 'visible',
        background: `
          linear-gradient(${isLeft ? '90deg' : '270deg'}, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.0) 18%),
          linear-gradient(135deg, #f5ecd6 0%, #ecdfb8 35%, #f7eccf 70%, #e6d8a8 100%)
        `,
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.18)',
      }}
    >
      {photo && <PhotoCard key={photo.src} photo={photo} />}
    </div>
  );
}

/* ─── ARROW BUTTON ───────────────────────────────────────────────────────── */

function ArrowButton({ direction, onClick, disabled, variant = 'inline' }) {
  const isLeft = direction === 'left';
  const size = variant === 'overlay' ? '56px' : '52px';
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={isLeft ? 'Previous page' : 'Next page'}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '1px solid rgba(212,175,55,0.5)',
        background: 'linear-gradient(135deg, rgba(6,13,31,0.85), rgba(13,26,53,0.85))',
        color: '#f1e5ac',
        fontSize: '22px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 10px 24px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)',
        transition: 'all 0.25s ease',
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        e.currentTarget.style.background =
          'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(184,134,11,0.25))';
        e.currentTarget.style.transform = 'scale(1.08)';
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        e.currentTarget.style.background =
          'linear-gradient(135deg, rgba(6,13,31,0.85), rgba(13,26,53,0.85))';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      {isLeft ? '‹' : '›'}
    </button>
  );
}

/* ─── FULLSCREEN VIEWER ──────────────────────────────────────────────────── */

function Fullscreen({ photo, index, total, onClose, onPrev, onNext }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.94)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        cursor: 'zoom-out',
        animation: 'gallery-fade-in 0.3s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)' }}
      >
        <ArrowButton direction="left" onClick={onPrev} variant="overlay" />
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '92vw',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img
          key={photo.src}
          src={photo.src}
          alt=""
          style={{
            maxWidth: '92vw',
            maxHeight: '80vh',
            display: 'block',
            borderRadius: '10px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.4)',
            animation: 'gallery-fade-in 0.35s ease both',
          }}
        />
        <div
          style={{
            marginTop: '14px',
            color: 'rgba(220,220,255,0.6)',
            fontSize: '0.75rem',
            letterSpacing: '0.25em',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </div>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)' }}
      >
        <ArrowButton direction="right" onClick={onNext} variant="overlay" />
      </div>

      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.5)',
          background: 'rgba(6,13,31,0.85)',
          color: '#f1e5ac',
          fontSize: '18px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
        }}
      >
        ✕
      </button>
    </div>
  );
}

/* ─── DESK BACKGROUND (top-down view: white keyboard + mouse) ──────────── */

function DeskBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Keyboard + Mouse row at the bottom of the desk */}
      <div
        style={{
          position: 'absolute',
          bottom: '60px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '56px',
        }}
      >
        {/* Keyboard */}
        <div
          style={{
            width: 'min(640px, 78vw)',
            height: '190px',
            borderRadius: '12px',
            padding: '14px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f1f1f1 100%)',
            boxShadow:
              '0 18px 40px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(0,0,0,0.05)',
            display: 'grid',
            gridTemplateColumns: 'repeat(14, 1fr)',
            gridTemplateRows: 'repeat(5, 1fr)',
            gap: '6px',
          }}
        >
          {Array.from({ length: 14 * 5 }, (_, i) => (
            <div
              key={`key-${i}`}
              style={{
                background: 'linear-gradient(145deg, #ffffff, #ececec)',
                borderRadius: '5px',
                boxShadow:
                  'inset 0 0 0 1px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.08)',
              }}
            />
          ))}
        </div>

        {/* Mouse */}
        <div
          style={{
            width: '84px',
            height: '140px',
            borderRadius: '50% 50% 38% 38% / 60% 60% 40% 40%',
            background: 'linear-gradient(145deg, #ffffff, #e8e8e8)',
            boxShadow:
              '0 14px 28px rgba(0,0,0,0.14), inset 0 0 0 1px rgba(0,0,0,0.05)',
            position: 'relative',
          }}
        >
          {/* Scroll wheel */}
          <div
            style={{
              position: 'absolute',
              top: '22px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '9px',
              height: '22px',
              borderRadius: '5px',
              background: 'linear-gradient(180deg, #d0d0d0, #a8a8a8)',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
            }}
          />
          {/* Click split */}
          <div
            style={{
              position: 'absolute',
              top: '50px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '1px',
              height: '22px',
              background: 'rgba(0,0,0,0.12)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── PHOTO TAPE (washi-tape "plasters" at each photo corner) ────────────── */

function PhotoTape({ corner }) {
  const isTop  = corner.startsWith('t');
  const isLeft = corner.endsWith('l');
  // tl & br tilt one way; tr & bl the other
  const rotation = isTop === isLeft ? -42 : 42;
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: '64px',
        height: '18px',
        top:    isTop  ? '-8px'  : 'auto',
        bottom: !isTop ? '-8px'  : 'auto',
        left:   isLeft  ? '-14px' : 'auto',
        right:  !isLeft ? '-14px' : 'auto',
        transformOrigin: 'center',
        transform: `rotate(${rotation}deg)`,
        background:
          'linear-gradient(135deg, rgba(255,250,205,0.82) 0%, rgba(255,255,255,0.72) 45%, rgba(255,240,170,0.82) 100%)',
        boxShadow:
          '0 2px 5px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.55)',
        backdropFilter: 'blur(1px)',
        pointerEvents: 'none',
        zIndex: 6,
        opacity: 0.9,
      }}
    />
  );
}
