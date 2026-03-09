export const Logo = ({ size = 48 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M15 20C15 20 20 15 25 20C30 25 30 35 35 40C40 45 45 40 45 40" 
        stroke="url(#gradient)" 
        strokeWidth="8" 
        strokeLinecap="round" 
        fill="none"
      />
      <defs>
        <linearGradient id="gradient" x1="15" y1="20" x2="45" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EC4899"/>
          <stop offset="50%" stopColor="#A855F7"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
      </defs>
    </svg>
  );
};
