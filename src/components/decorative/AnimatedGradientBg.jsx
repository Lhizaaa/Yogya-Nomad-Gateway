// Animated gradient + slow moving blurred blobs behind content.
export default function AnimatedGradientBg({ className = '' }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden z-0 ${className}`} aria-hidden="true">
      <div className="absolute inset-0 bg-animated-gradient animate-gradientMove opacity-70 dark:opacity-40" />
      <div className="absolute -top-20 -left-10 h-72 w-72 rounded-full bg-brand-400/40 blur-3xl animate-blob" />
      <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-brand-300/30 blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
      <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-300/20 dark:bg-sky-500/10 blur-3xl animate-blob" style={{ animationDelay: '6s' }} />
    </div>
  )
}
