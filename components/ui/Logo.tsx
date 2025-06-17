import React from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="secondaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Chess Board Base */}
        <rect
          x="15"
          y="25"
          width="70"
          height="70"
          rx="8"
          fill="url(#primaryGradient)"
          opacity="0.2"
        />
        
        {/* Chess Board Pattern */}
        <g opacity="0.3">
          {/* Light squares */}
          <rect x="20" y="30" width="8" height="8" fill="url(#primaryGradient)" />
          <rect x="36" y="30" width="8" height="8" fill="url(#primaryGradient)" />
          <rect x="52" y="30" width="8" height="8" fill="url(#primaryGradient)" />
          <rect x="68" y="30" width="8" height="8" fill="url(#primaryGradient)" />
          
          <rect x="28" y="38" width="8" height="8" fill="url(#primaryGradient)" />
          <rect x="44" y="38" width="8" height="8" fill="url(#primaryGradient)" />
          <rect x="60" y="38" width="8" height="8" fill="url(#primaryGradient)" />
          <rect x="76" y="38" width="8" height="8" fill="url(#primaryGradient)" />
        </g>

        {/* AI Circuit Pattern */}
        <g stroke="url(#secondaryGradient)" strokeWidth="1.5" fill="none" opacity="0.6">
          <circle cx="25" cy="15" r="3" />
          <circle cx="75" cy="15" r="3" />
          <circle cx="25" cy="85" r="3" />
          <circle cx="75" cy="85" r="3" />
          
          <path d="M25 15 L35 15 L35 25" />
          <path d="M75 15 L65 15 L65 25" />
          <path d="M25 85 L35 85 L35 75" />
          <path d="M75 85 L65 85 L65 75" />
        </g>

        {/* Central Crown/King Piece */}
        <g fill="url(#primaryGradient)">
          {/* King Base */}
          <rect x="42" y="65" width="16" height="6" rx="2" />
          <rect x="44" y="58" width="12" height="8" rx="1" />
          
          {/* King Body */}
          <path d="M46 58 L46 45 L48 42 L52 42 L54 45 L54 58 Z" />
          
          {/* Crown Points */}
          <path d="M46 42 L47 38 L49 40 L50 36 L51 40 L53 38 L54 42 Z" />
          
          {/* Crown Jewel */}
          <circle cx="50" cy="36" r="2" fill="url(#accentGradient)" />
        </g>

        {/* Neural Network Nodes */}
        <g fill="url(#secondaryGradient)" opacity="0.7">
          <circle cx="30" cy="50" r="2" />
          <circle cx="70" cy="50" r="2" />
          <circle cx="40" cy="35" r="1.5" />
          <circle cx="60" cy="35" r="1.5" />
          <circle cx="40" cy="65" r="1.5" />
          <circle cx="60" cy="65" r="1.5" />
        </g>

        {/* Neural Connections */}
        <g stroke="url(#secondaryGradient)" strokeWidth="1" opacity="0.4" fill="none">
          <path d="M30 50 L40 35" />
          <path d="M30 50 L40 65" />
          <path d="M70 50 L60 35" />
          <path d="M70 50 L60 65" />
          <path d="M40 35 L46 42" />
          <path d="M60 35 L54 42" />
        </g>

        {/* Outer Glow Effect */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="url(#primaryGradient)"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </svg>
    </div>
  )
}

export const LogoWithText: React.FC<LogoProps & { showText?: boolean }> = ({ 
  size = 'md', 
  className = '', 
  showText = true 
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Logo size={size} />
      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-white text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Chess Arena
          </span>
          <span className="text-xs text-purple-300">
            Where Minds Meet
          </span>
        </div>
      )}
    </div>
  )
} 