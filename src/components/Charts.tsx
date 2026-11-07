import { useReducedMotion } from 'framer-motion'
import { useId, type ReactNode } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { rupees } from '../lib/format'

export const axis = {
  tick: { fill: '#676450', fontSize: 12 },
  tickLine: false,
  axisLine: false,
} as const

export const grid = { stroke: '#E6D9BE', vertical: false } as const

/** Fixed slot order, checked with the colour-blindness validator on the card surface. */
export const SERIES_COLORS = ['#D63F1F', '#2B7FB8', '#A67C00', '#7A4FA3']

interface TipEntry {
  name?: string | number
  value?: number | string | readonly (number | string)[]
  color?: string
  dataKey?: unknown
}

export function ChartTip({
  active,
  payload,
  label,
  format = (v: number) => `${rupees(v, 1)}/kg`,
  title,
}: {
  active?: boolean
  payload?: readonly TipEntry[]
  label?: string | number
  format?: (value: number) => string
  title?: (label: string) => ReactNode
}) {
  if (!active || !payload?.length) return null
  const rows = payload.filter((p) => typeof p.value === 'number')
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-bold">{title ? title(String(label)) : label}</p>
      {rows.map((row) => (
        <p key={String(row.dataKey ?? row.name)} className="mt-0.5 flex items-center gap-2 text-muted">
          {rows.length > 1 && <i className="inline-block size-2 rounded-full" style={{ background: row.color }} />}
          {rows.length > 1 && <span>{row.name}</span>}
          <span className="ml-auto font-bold text-ink tabular">{format(row.value as number)}</span>
        </p>
      ))}
    </div>
  )
}

function Bubble({ viewBox, text }: { viewBox?: { x?: number; y?: number }; text: string }) {
  const x = viewBox?.x ?? 0
  const y = viewBox?.y ?? 0
  const width = text.length * 7.5 + 16
  return (
    <g transform={`translate(${x - width / 2}, ${Math.max(y - 32, 0)})`}>
      <rect width={width} height={22} rx={11} fill="#1F3A1F" />
      <text x={width / 2} y={15} textAnchor="middle" fill="#FAF3E3" fontSize={12} fontWeight={700}>
        {text}
      </text>
    </g>
  )
}

/** Smooth area line with one highlighted point, a red marker and a label bubble. */
export function AreaTrend({
  data,
  highlight,
  bubble,
  height = 220,
  label,
}: {
  data: { label: string; value: number }[]
  highlight: number
  bubble: string
  height?: number
  label: string
}) {
  const id = useId()
  const reduced = useReducedMotion()
  const point = data[highlight]
  return (
    <div role="img" aria-label={label} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 34, right: 12, left: -14, bottom: 0 }}>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#A8C23A" stopOpacity={0.5} />
              <stop offset="1" stopColor="#A8C23A" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid {...grid} />
          <XAxis dataKey="label" {...axis} interval="preserveStartEnd" minTickGap={8} />
          <YAxis {...axis} domain={['dataMin - 2', 'dataMax + 2']} tickFormatter={(v: number) => `₹${Math.round(v)}`} />
          <Tooltip content={<ChartTip />} cursor={{ stroke: '#8A8670' }} />
          <Area type="monotone" dataKey="value" stroke="#6F8A14" strokeWidth={2} fill={`url(#${id})`} isAnimationActive={!reduced} />
          {point && <ReferenceLine x={point.label} stroke="#E5482B" strokeWidth={1.5} />}
          {point && (
            <ReferenceDot
              x={point.label}
              y={point.value}
              r={5}
              fill="#E5482B"
              stroke="#FAF3E3"
              strokeWidth={2}
              label={(props: { viewBox?: { x?: number; y?: number } }) => <Bubble viewBox={props.viewBox} text={bubble} />}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
