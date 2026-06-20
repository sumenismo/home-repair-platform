interface IconProps { className?: string }

export function PesoTagIcon({ className }: IconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden="true">
      {/* Tag shape */}
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
      {/* ₱ symbol overlay */}
      <text x="9.5" y="9" fontSize="5" fontFamily="system-ui" fill="currentColor" stroke="none">₱</text>
    </svg>
  )
}
