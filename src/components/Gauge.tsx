import { useId } from 'react'
import { CountUp } from './ui'

/** Semicircle gauge with a lime gradient arc and a big italic percentage. */
export function Gauge({ value, label }: { value: number; label: string }) {
  const id = useId()
  const radius = 80
  const length = Math.PI * radius
  return (
    <div className="relative mx-auto w-full max-w-[230px]" role="img" aria-label={`${value}% ${label}`}>
      <svg viewBox="0 0 200 112" className="w-full">
        <defs>
          <linearGradient id={id} x1="0" x2="1">
            <stop offset="0" stopColor="#E9DE8C" />
            <stop offset="1" stopColor="#A8C23A" />
          </linearGradient>
        </defs>
        <path d="M20 100a80 80 0 0 1 160 0" fill="none" stroke="#E6D9BE" strokeWidth="13" strokeLinecap="round" />
        <path
          d="M20 100a80 80 0 0 1 160 0"
          fill="none"
          stroke={`url(#${id})`}
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={`${(value / 100) * length} ${length}`}
          style={{ transition: 'stroke-dasharray 900ms ease' }}
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 text-center">
        <p className="display num text-5xl leading-none">
          <CountUp value={value} suffix="%" />
        </p>
        <p className="mt-1 text-xs font-semibold text-muted">{label}</p>
      </div>
    </div>
  )
}
