interface IconProps {
  className?: string
}

export function AirconIcon({ className }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* unit body */}
      <rect x="2" y="4" width="20" height="9" rx="2" />
      {/* vents */}
      <line x1="6" y1="13" x2="5" y2="18" />
      <line x1="10" y1="13" x2="10" y2="19" />
      <line x1="14" y1="13" x2="14" y2="19" />
      <line x1="18" y1="13" x2="19" y2="18" />
      {/* snowflake dots on unit */}
      <circle cx="7" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="17" cy="8.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}
