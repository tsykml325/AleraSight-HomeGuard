import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  size?: number; // width/height of symbol
}

export function LogoSymbol({ className, size = 48 }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 200 210" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
    >
      {/* Wireless signal / IoT waves at top */}
      <circle cx="100" cy="54" r="6" fill="#e11d48" />
      <path 
        d="M 83 37 A 24 24 0 0 1 117 37" 
        stroke="#e11d48" 
        strokeWidth="4" 
        strokeLinecap="round" 
        fill="none" 
      />
      <path 
        d="M 72 26 A 39 39 0 0 1 128 26" 
        stroke="#e11d48" 
        strokeWidth="4" 
        strokeLinecap="round" 
        fill="none" 
      />
      <path 
        d="M 61 15 A 55 55 0 0 1 139 15" 
        stroke="#e11d48" 
        strokeWidth="4" 
        strokeLinecap="round" 
        fill="none" 
      />

      {/* Hexagon Blueprint - Left side (Blue) */}
      <path 
        d="M 94 65 L 50 90 L 50 152 L 94 177" 
        stroke="#0a192f" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none" 
        className="stroke-blue-700"
      />
      {/* Hexagon Blueprint - Right side (Red) */}
      <path 
        d="M 106 65 L 150 90 L 150 152 L 106 177" 
        stroke="#e11d48" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        fill="none" 
      />

      {/* Blue Flame */}
      <path 
        d="M 100 174 C 80 171 67 150 65 130 C 63 103 82 77 98 58 C 87 84 87 117 98 137 C 99 139 100 141 100 142 Z" 
        fill="url(#blueFlameGrad)" 
      />

      {/* Red Flame */}
      <path 
        d="M 100 174 C 120 171 133 150 135 130 C 137 103 118 77 102 58 C 113 84 113 117 102 137 C 101 139 100 141 100 142 Z" 
        fill="url(#redFlameGrad)" 
      />

      {/* White Flame Core (Inner cutout negation) */}
      <path 
        d="M 100 174 C 91 161 89 150 93 134 C 97 121 103 121 107 134 C 111 150 109 161 100 174 Z" 
        fill="#ffffff" 
      />

      <defs>
        <linearGradient id="blueFlameGrad" x1="60" y1="58" x2="100" y2="174" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d3557" />
        </linearGradient>
        <linearGradient id="redFlameGrad" x1="140" y1="58" x2="100" y2="174" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

interface AleraSightLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: number; // size of emblem
  isDarkTheme?: boolean;
  compactNav?: boolean;
}

export function AleraSightLogo({ className, showTagline = true, size = 42, isDarkTheme = false, compactNav = false }: AleraSightLogoProps) {
  const actualSize = compactNav ? 34 : size;
  return (
    <div className={cn("flex items-center gap-3 min-w-0 overflow-hidden", className)}>
      <LogoSymbol size={actualSize} />
      <div className="flex flex-col select-none min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline leading-none">
          <div className="flex items-baseline font-black italic uppercase leading-none min-w-0">
            <span className={cn(
              isDarkTheme ? "text-blue-100" : "text-blue-700", 
              "relative flex items-center",
              compactNav ? "text-xl" : "text-2xl"
            )}>
              {/* Custom styled letter A with red inside triangle */}
              <span className="relative">
                A
                <span 
                  className="absolute text-red-500 font-black italic" 
                  style={{ 
                    fontSize: '0.45em', 
                    bottom: '0.24em', 
                    left: '0.33em',
                    transform: 'skewX(-15deg)'
                  }}
                >
                  ▲
                </span>
              </span>
              <span>lera</span>
            </span>
            <span className="text-red-500 font-black italic uppercase leading-none" style={{ fontSize: compactNav ? '1.25rem' : '1.5rem' }}>Sight</span>
          </div>
          {!compactNav && (
            <span className={cn(isDarkTheme ? "text-blue-200/60" : "text-slate-400", "text-xs ml-1 font-bold tracking-widest italic font-sans lowercase")}>HomeGuard</span>
          )}
        </div>
        {compactNav && (
          <div className={cn(
            isDarkTheme ? "text-blue-200/70" : "text-slate-300", 
            "text-[10px] font-bold tracking-[0.15em] italic font-sans lowercase leading-none mt-1"
          )}>
            homeguard
          </div>
        )}
        {showTagline && (
          <div className="flex items-center gap-1.5 mt-1.5 w-full overflow-hidden">
            <span className={cn(isDarkTheme ? "bg-blue-300/30" : "bg-blue-700", "h-[1.5px] flex-1")}></span>
            <span className={cn(
              isDarkTheme ? "text-blue-200/50" : "text-slate-500", 
              "font-black uppercase whitespace-nowrap italic leading-none shrink-0",
              compactNav ? "text-[6.5px] tracking-[0.1em]" : "text-[7.5px] tracking-[0.25em]"
            )}>
              DETEKSI DINI, LINDUNGI NEGERI
            </span>
            <span className="h-[1.5px] bg-red-500 flex-1"></span>
          </div>
        )}
      </div>
    </div>
  );
}
