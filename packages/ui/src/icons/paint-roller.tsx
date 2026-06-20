interface IconProps { className?: string }

export function PaintRollerIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      {/* roller frame */}
      <rect x="2" y="4" width="14" height="6" rx="2" />
      {/* handle down from roller */}
      <line x1="9" y1="10" x2="9" y2="14" />
      {/* tray / paint pan */}
      <rect x="5" y="14" width="8" height="6" rx="1" />
    </svg>
  )
}
