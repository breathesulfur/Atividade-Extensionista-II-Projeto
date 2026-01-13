import React from 'react'
import './Logo.css'

function Logo({ size = 'medium', showText = true, variant = 'light' }) {
  const sizes = {
    small: 32,
    medium: 48,
    large: 64
  }

  const logoSize = sizes[size] || sizes.medium

  return (
    <div className={`logo-container logo-${variant}`}>
      <svg
        width={logoSize}
        height={logoSize}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="logo-icon"
      >
        <defs>
          {/* Gradiente etéreo rosa-lilás-roxo */}
          <linearGradient id="etherealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.9" />
          </linearGradient>
          
          {/* Gradiente para aura luminosa */}
          <radialGradient id="auraGradient" cx="50%" cy="50%">
            <stop offset="0%" stopColor="#fce7f3" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#e9d5ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ddd6fe" stopOpacity="0.2" />
          </radialGradient>
          
          {/* Gradiente para brilho suave */}
          <radialGradient id="glowGradient" cx="50%" cy="30%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#fce7f3" stopOpacity="0" />
          </radialGradient>
          
          {/* Filtro de brilho difuso */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Aura luminosa de fundo */}
        <circle cx="60" cy="60" r="55" fill="url(#auraGradient)" />
        
        {/* Círculo sagrado externo */}
        <circle 
          cx="60" cy="60" 
          r="50" 
          fill="none" 
          stroke="url(#etherealGradient)" 
          strokeWidth="1.5"
          opacity="0.6"
        />
        
        {/* Círculo sagrado interno */}
        <circle 
          cx="60" cy="60" 
          r="40" 
          fill="none" 
          stroke="url(#etherealGradient)" 
          strokeWidth="1"
          opacity="0.5"
        />
        
        {/* Lua crescente */}
        <path
          d="M 45 35 Q 50 30 55 35 Q 60 40 55 45 Q 50 50 45 45 Q 40 40 45 35 Z"
          fill="url(#etherealGradient)"
          filter="url(#glow)"
          opacity="0.95"
        />
        
        {/* Estrelas suaves */}
        <g opacity="0.8">
          {/* Estrela 1 */}
          <path
            d="M 75 25 L 77 30 L 82 30 L 78 33 L 80 38 L 75 35 L 70 38 L 72 33 L 68 30 L 73 30 Z"
            fill="url(#etherealGradient)"
            filter="url(#glow)"
          />
          
          {/* Estrela 2 */}
          <path
            d="M 90 50 L 91.5 53 L 95 53 L 92.5 55 L 94 58 L 90 56 L 86 58 L 87.5 55 L 85 53 L 88.5 53 Z"
            fill="url(#etherealGradient)"
            filter="url(#glow)"
          />
          
          {/* Estrela 3 */}
          <path
            d="M 30 70 L 31.5 73 L 35 73 L 32.5 75 L 34 78 L 30 76 L 26 78 L 27.5 75 L 25 73 L 28.5 73 Z"
            fill="url(#etherealGradient)"
            filter="url(#glow)"
          />
          
          {/* Estrela 4 */}
          <path
            d="M 85 85 L 86.5 88 L 90 88 L 87.5 90 L 89 93 L 85 91 L 81 93 L 82.5 90 L 80 88 L 83.5 88 Z"
            fill="url(#etherealGradient)"
            filter="url(#glow)"
          />
        </g>
        
        {/* Mandala minimalista central - geometria sagrada */}
        <g opacity="0.7">
          {/* Círculo central */}
          <circle cx="60" cy="60" r="15" fill="url(#etherealGradient)" opacity="0.4" />
          
          {/* Linhas de energia fluida */}
          <path
            d="M 60 45 Q 50 50 45 60 Q 50 70 60 75 Q 70 70 75 60 Q 70 50 60 45"
            fill="none"
            stroke="url(#etherealGradient)"
            strokeWidth="1.5"
            opacity="0.6"
          />
          
          {/* Portal interno - união de energias */}
          <circle cx="60" cy="60" r="8" fill="url(#glowGradient)" opacity="0.7" />
        </g>
        
        {/* Energia fluida - linhas orgânicas */}
        <g opacity="0.5">
          <path
            d="M 35 60 Q 40 50 50 55 Q 55 60 50 65 Q 45 70 35 60"
            fill="none"
            stroke="url(#etherealGradient)"
            strokeWidth="1"
          />
          <path
            d="M 85 60 Q 80 50 70 55 Q 65 60 70 65 Q 75 70 85 60"
            fill="none"
            stroke="url(#etherealGradient)"
            strokeWidth="1"
          />
        </g>
        
        {/* Brilho suave superior */}
        <ellipse
          cx="60"
          cy="35"
          rx="20"
          ry="15"
          fill="url(#glowGradient)"
          opacity="0.6"
        />
      </svg>
      {showText && (
        <span className="logo-text">InclusivChat</span>
      )}
    </div>
  )
}

export default Logo
