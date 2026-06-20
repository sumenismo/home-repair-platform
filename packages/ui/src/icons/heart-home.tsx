interface IconProps {
  className?: string
}

export function HeartHomeIcon({ className }: IconProps) {
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
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <path d="M12 17c0 0-3.5-2.1-3.5-4.3a2 2 0 0 1 3.5-1.3 2 2 0 0 1 3.5 1.3C15.5 14.9 12 17 12 17z" />
    </svg>
  )
}
