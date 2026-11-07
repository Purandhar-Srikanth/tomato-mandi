import { motion, useInView, useReducedMotion } from 'framer-motion'
import { ChevronDown, Database, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import type { NavPage } from '../data/nav'
import { fmtDate } from '../lib/format'
import type { DataSource, Meta } from '../lib/types'

export function Card({ className = '', children, ...rest }: ComponentProps<'section'>) {
  return (
    <section className={`rounded-[var(--radius-card)] bg-card p-5 shadow-[var(--shadow-card)] sm:p-6 ${className}`} {...rest}>
      {children}
    </section>
  )
}

/** Fades and slides content up the first time it scrolls into view. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function CountUp({ value, digits = 0, prefix = '', suffix = '' }: { value: number; digits?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(reduced ? value : 0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setShown(value)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900)
      setShown(value * (1 - (1 - t) ** 3))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, reduced])

  return (
    <span ref={ref} className="tabular">
      {prefix}
      {shown.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })}
      {suffix}
    </span>
  )
}

const sourceKeys: Record<DataSource, string> = {
  sample: 'common.sampleData',
  mixed: 'common.partlySample',
  agmarknet: 'common.agmarknet',
}

export function SourceBadge({ meta, className = '' }: { meta?: Meta; className?: string }) {
  const { t, i18n } = useTranslation()
  const source = meta?.source ?? 'sample'
  const real = source === 'agmarknet'
  return (
    <span
      title={meta?.note}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        real ? 'bg-lime/25 text-ink' : 'bg-sun/35 text-ink'
      } ${className}`}
    >
      <Database size={12} aria-hidden />
      {t(sourceKeys[source])}
      {real && meta?.asOf ? ` · ${fmtDate(meta.asOf, i18n.language, { day: 'numeric', month: 'short' })}` : ''}
    </span>
  )
}

export function PillSelect({ label, className = '', children, ...rest }: ComponentProps<'select'> & { label: string }) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <select
        aria-label={label}
        className="min-h-11 w-full cursor-pointer appearance-none rounded-full border border-line bg-white/80 py-2 pl-4 pr-9 text-sm font-semibold shadow-sm"
        {...rest}
      >
        {children}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" aria-hidden />
    </span>
  )
}

export function CtaClasses(extra = '') {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-95 active:scale-[0.98] ${extra}`
}

export function CtaIcon() {
  return <Sparkles size={15} aria-hidden />
}

export function Progress({ value, tone = 'lime', label }: { value: number; tone?: 'lime' | 'tomato'; label?: string }) {
  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-line"
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={`h-full rounded-full ${tone === 'lime' ? 'bg-lime' : 'bg-tomato'}`} style={{ width: `${Math.max(3, Math.min(100, value))}%` }} />
    </div>
  )
}

export function PageHeader({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="max-w-2xl">
        <h1 className="display text-4xl leading-tight sm:text-5xl">{title}</h1>
        {intro && <p className="mt-2 text-muted">{intro}</p>}
      </div>
      {children}
    </header>
  )
}

export function SubNav({ pages }: { pages: NavPage[] }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  return (
    <nav aria-label={t('nav.section')} className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {pages.map(({ path, key, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
            pathname === path ? 'bg-ink text-card' : 'bg-card text-ink hover:bg-white'
          }`}
        >
          <Icon size={15} aria-hidden />
          {t(`nav.${key}`)}
        </NavLink>
      ))}
    </nav>
  )
}

export function Stat({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <Card className="!p-4 sm:!p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="display num mt-1 text-3xl">{children}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </Card>
  )
}

export function NumberField({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  suffix,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  suffix?: string
}) {
  return (
    <label className="block text-sm font-medium text-muted">
      {label}
      <span className="mt-1 flex items-center rounded-2xl border border-line bg-white/70 pr-3 focus-within:outline-2 focus-within:outline-ink">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
          className="min-h-11 w-full min-w-0 rounded-2xl bg-transparent px-3 text-base font-semibold text-ink outline-none"
        />
        {suffix && <span className="shrink-0 text-xs">{suffix}</span>}
      </span>
    </label>
  )
}

export function Loading() {
  const { t } = useTranslation()
  return (
    <p role="status" className="py-16 text-center text-muted">
      {t('common.loading')}
    </p>
  )
}

export function LoadError() {
  const { t } = useTranslation()
  return (
    <p role="alert" className="py-16 text-center text-muted">
      {t('common.loadError')}
    </p>
  )
}
