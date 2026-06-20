import Reveal from './Reveal'

export default function SectionHeading({ title, subtitle, center = true }) {
  return (
    <Reveal className={`mb-8 ${center ? 'text-center' : ''}`}>
      <h2 className="section-title">{title}</h2>
      {subtitle && (
        <p className="mt-2 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </Reveal>
  )
}
