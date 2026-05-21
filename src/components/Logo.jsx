import React from 'react'
import './Logo.css'

function Logo({ size = 'medium', showText = true, variant = 'light' }) {
  const sizes = { small: 32, medium: 48, large: 64 }
  const s = sizes[size] || sizes.medium

  return (
    <div className={`logo-container logo-${variant}`}>
      <svg
        width={s}
        height={s}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-icon"
      >
        <defs>
          {/* Gradiente principal roxo-rosa */}
          <linearGradient id="lg-main" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#f472b6"/>
            <stop offset="55%"  stopColor="#a78bfa"/>
            <stop offset="100%" stopColor="#7c3aed"/>
          </linearGradient>

          {/* Arco 1 — rosa-laranja */}
          <linearGradient id="lg-r1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#fb923c"/>
            <stop offset="100%" stopColor="#f43f5e"/>
          </linearGradient>

          {/* Arco 2 — roxo-índigo */}
          <linearGradient id="lg-r2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#c084fc"/>
            <stop offset="100%" stopColor="#6366f1"/>
          </linearGradient>

          {/* Arco 3 — verde-azul */}
          <linearGradient id="lg-r3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#10b981"/>
            <stop offset="100%" stopColor="#38bdf8"/>
          </linearGradient>

          {/* Brilho difuso */}
          <filter id="lg-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* ── Balão de chat ── */}
        {/* Preenchimento suave */}
        <path
          d="M 24,8 H 82 Q 100,8 100,26 V 60 Q 100,78 82,78 H 44 L 18,108 L 36,78 H 24 Q 6,78 6,60 V 26 Q 6,8 24,8 Z"
          fill="url(#lg-main)"
          opacity="0.12"
        />
        {/* Contorno */}
        <path
          d="M 24,8 H 82 Q 100,8 100,26 V 60 Q 100,78 82,78 H 44 L 18,108 L 36,78 H 24 Q 6,78 6,60 V 26 Q 6,8 24,8 Z"
          stroke="url(#lg-main)"
          strokeWidth="4"
          fill="none"
          filter="url(#lg-glow)"
        />

        {/* ── Arco-íris dentro do balão ── */}
        {/* Arco externo */}
        <path
          d="M 20,62 A 33,33 0 0,1 86,62"
          stroke="url(#lg-r1)"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
          filter="url(#lg-glow)"
        />
        {/* Arco médio */}
        <path
          d="M 28,62 A 25,25 0 0,1 78,62"
          stroke="url(#lg-r2)"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Arco interno */}
        <path
          d="M 36,62 A 17,17 0 0,1 70,62"
          stroke="url(#lg-r3)"
          strokeWidth="6.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* ── Estrela de 4 pontas (canto superior direito) ── */}
        <path
          d="M 82,16 L 84.2,22.8 L 91,25 L 84.2,27.2 L 82,34 L 79.8,27.2 L 73,25 L 79.8,22.8 Z"
          fill="url(#lg-main)"
          opacity="0.95"
          filter="url(#lg-glow)"
        />

        {/* ── Pequenos pontos brilhantes ── */}
        <circle cx="28" cy="22" r="3.5" fill="url(#lg-main)" opacity="0.65"/>
        <circle cx="23" cy="34" r="2"   fill="url(#lg-main)" opacity="0.45"/>
      </svg>

      {showText && <span className="logo-text">InclusivChat</span>}
    </div>
  )
}

export default Logo
