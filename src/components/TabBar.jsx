import React from 'react';

const TABS = [
  { id: 'invitation', label: 'Invitation' },
  { id: 'gallery',    label: 'Gallery'    },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav
      style={{
        position: 'fixed',
        top: '18px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        display: 'flex',
        gap: '6px',
        padding: '6px',
        borderRadius: '999px',
        background: 'rgba(6,13,31,0.55)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(212,175,55,0.35)',
        boxShadow:
          '0 8px 28px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(255,255,255,0.04)',
      }}
    >
      {TABS.map((tab) => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              position: 'relative',
              padding: '8px 22px',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.78rem',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 600,
              color: isActive ? '#0b1630' : '#f1e5ac',
              background: isActive
                ? 'linear-gradient(180deg, #f1e5ac 0%, #d4af37 50%, #b8860b 100%)'
                : 'transparent',
              boxShadow: isActive
                ? '0 4px 14px rgba(212,175,55,0.45), inset 0 0 0 1px rgba(255,255,255,0.3)'
                : 'none',
              transition: 'all 0.25s ease',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.color = '#f1e5ac';
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
