const tones = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300 border border-brand-200/60 dark:border-brand-500/20',
  green: 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 border border-green-200/60 dark:border-green-500/20',
  gray: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300 border border-gray-200/60 dark:border-white/10',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border border-blue-200/60 dark:border-blue-500/20'
}

export default function Badge({ tone = 'gray', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]} ${className}`}>
      {children}
    </span>
  )
}
