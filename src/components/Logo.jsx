export const Logo = ({ size = 40, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 400 400" className={className}>
    <defs>
      <linearGradient id="lp" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{stopColor:'#ec4899'}} />
        <stop offset="100%" style={{stopColor:'#dc2626'}} />
      </linearGradient>
      <linearGradient id="rp" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{stopColor:'#f97316'}} />
        <stop offset="100%" style={{stopColor:'#eab308'}} />
      </linearGradient>
      <linearGradient id="ig" x1="0%" y1="50%" x2="100%" y2="50%">
        <stop offset="0%" style={{stopColor:'#3b82f6'}} />
        <stop offset="50%" style={{stopColor:'#a855f7'}} />
        <stop offset="100%" style={{stopColor:'#dc2626'}} />
      </linearGradient>
    </defs>
    <circle cx="165" cy="195" r="18" fill="none" stroke="url(#lp)" strokeWidth="6" opacity="0.9"/>
    <circle cx="235" cy="195" r="18" fill="none" stroke="url(#rp)" strokeWidth="6" opacity="0.9"/>
    <g transform="translate(200, 245)">
      <path 
        d="M -50 0 C -50 -22, -30 -22, -15 -11 C 0 0, 0 0, 15 -11 C 30 -22, 50 -22, 50 0 C 50 22, 30 22, 15 11 C 0 0, 0 0, -15 11 C -30 22, -50 22, -50 0" 
        fill="none" 
        stroke="url(#ig)" 
        strokeWidth="10" 
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </g>
  </svg>
);
