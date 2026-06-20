// Decorative vertical batik strips (kawung/parang inspired line-art, original modern interpretation).
// Fixed on left & right, behind content, never blocks interaction.
const pattern = (
  <pattern id="batik" width="40" height="56" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
    {/* kawung-inspired interlocking ovals */}
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <ellipse cx="10" cy="14" rx="7" ry="11" />
      <ellipse cx="30" cy="14" rx="7" ry="11" />
      <ellipse cx="10" cy="42" rx="7" ry="11" />
      <ellipse cx="30" cy="42" rx="7" ry="11" />
      <circle cx="20" cy="28" r="2.2" fill="currentColor" stroke="none" />
      <circle cx="0" cy="0" r="2.2" fill="currentColor" stroke="none" />
    </g>
  </pattern>
)

function Strip({ side }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none fixed top-0 ${side}-0 h-full w-4 sm:w-6 lg:w-[80px] text-brand-500 opacity-[0.12] dark:opacity-[0.16] z-0`}
      preserveAspectRatio="none"
    >
      <defs>{pattern}</defs>
      <rect width="100%" height="100%" fill="url(#batik)" />
    </svg>
  )
}

export default function BatikBorder() {
  return (
    <>
      <Strip side="left" />
      <Strip side="right" />
    </>
  )
}
