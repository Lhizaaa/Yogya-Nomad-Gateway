export default function Skeleton({ className = '', variant = 'pulse' }) {
  if (variant === 'shimmer') {
    return (
      <div
        className={`rounded-2xl bg-gray-200/70 dark:bg-white/10 bg-[length:200%_100%] bg-gradient-to-r from-gray-200/70 via-gray-100/40 to-gray-200/70 dark:from-white/10 dark:via-white/5 dark:to-white/10 animate-shimmer ${className}`}
      />
    )
  }
  return (
    <div className={`animate-pulse rounded-2xl bg-gray-200/70 dark:bg-white/10 ${className}`} />
  )
}
