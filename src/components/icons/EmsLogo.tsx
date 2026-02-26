import { cn } from '@/lib/utils';

interface EmsLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function EmsLogo({ className, size = 'md' }: EmsLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size], className)}>
      {/* Star of Life inspired design */}
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        {/* Background circle */}
        <circle cx="50" cy="50" r="48" className="fill-blue-600" />

        {/* Star of Life */}
        <g className="stroke-white" strokeWidth="14" strokeLinecap="round">
          {/* Vertical */}
          <line x1="50" y1="20" x2="50" y2="80" />
          {/* Diagonals */}
          <line x1="24" y1="35" x2="76" y2="65" />
          <line x1="24" y1="65" x2="76" y2="35" />
        </g>

        {/* Rod of Asclepius - Simplified/Stylized center */}
        <path
          d="M50 25 L50 75 M44 35 Q50 30 56 35 T44 45 Q50 40 56 45 T44 55 Q50 50 56 55 T44 65 Q50 60 56 65"
          className="stroke-blue-600"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Center white circle for contrast */}
        <circle cx="50" cy="50" r="10" className="fill-white" />

        {/* Simplified snake/staff */}
        <path d="M50 30 V70" className="stroke-blue-600" strokeWidth="4" />
        <path d="M44 40 C44 35, 56 35, 56 40 C56 45, 44 45, 44 50 C44 55, 56 55, 56 60" className="stroke-blue-600" strokeWidth="2.5" fill="none" />
      </svg>
    </div>
  );
}
