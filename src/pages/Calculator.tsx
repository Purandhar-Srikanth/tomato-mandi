import { useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { axis, ChartTip, grid } from '../components/Charts'
import { Card, NumberField, PageHeader, Reveal, Stat, SubNav } from '../components/ui'
import { growPages } from '../data/nav'
import { rupees } from '../lib/format'

const COSTS = ['seed', 'nursery', 'fertilizer', 'pesticides', 'labour', 'staking', 'irrigation', 'transport'] as const
type CostKey = (typeof COSTS)[number]

const DEFAULT_COSTS: Record<CostKey, number> = {
  seed: 8000, nursery: 6000, fertilizer: 25000, pesticides: 18000, labour: 40000, staking: 25000, irrigation: 12000, transport: 30000,
}

const lakh = (v: number) => `${v < 0 ? '−' : ''}₹${(Math.abs(v) / 100000).toFixed(1)}L`

export default function Calculator() {
  const { t } = useTranslation()
  const reduced = useReducedMotion()
  const [acres, setAcres] = useState(1)
  const [costs, setCosts] = useState(DEFAULT_COSTS)
  const [commission, setCommission] = useState(4)
  const [crates, setCrates] = useState(1200)
  const [crateKg, setCrateKg] = useState(25)
  const [price, setPrice] = useState(15)

  const result = useMemo(() => {
    const kg = crates * crateKg * acres
    const fixed = COSTS.reduce((sum, key) => sum + costs[key], 0) * acres
    const share = 1 - commission / 100
    const profitAt = (p: number) => kg * p * share - fixed
    const income = kg * price
    const totalCost = fixed + income * (commission / 100)
    const breakEven = kg > 0 && share > 0 ? fixed / (kg * share) : 0
    const top = Math.max(price * 2, breakEven * 2, 10)
    const curve = Array.from({ length: 21 }, (_, i) => {
      const p = Math.round((top / 20) * i * 10) / 10
      return { price: p, profit: Math.round(profitAt(p)) }
    })
    return { income, totalCost, profit: income - totalCost, breakEven, curve, kg }
  }, [acres, costs, commission, crates, crateKg, price])

  const profitable = result.profit >= 0

  return (
    <>
      <PageHeader title={t('calculator.title')} intro={t('calculator.intro')} />
      <SubNav pages={growPages} />
      <div className="grid gap-5 lg:grid-cols-[1fr_1.25fr]">
        <Card>
          <h2 className="mb-3 font-bold">{t('calculator.farm')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label={t('calculator.acres')} value={acres} onChange={setAcres} step={0.5} />
            <NumberField label={t('calculator.crates')} value={crates} onChange={setCrates} step={50} />
            <NumberField label={t('calculator.crateKg')} value={crateKg} onChange={setCrateKg} suffix="kg" />
            <NumberField label={t('calculator.price')} value={price} onChange={setPrice} step={0.5} suffix="₹/kg" />
          </div>
          <h2 className="mb-3 mt-5 font-bold">{t('calculator.costs')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {COSTS.map((key) => (
              <NumberField
                key={key}
                label={t(`calculator.${key}`)}
                value={costs[key]}
                step={500}
                suffix="₹"
                onChange={(value) => setCosts({ ...costs, [key]: value })}
              />
            ))}
            <NumberField label={t('calculator.commission')} value={commission} onChange={setCommission} step={0.5} suffix="%" />
          </div>
          <p className="mt-3 text-xs text-muted">{t('calculator.defaults')}</p>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="grid grid-cols-2 gap-3">
            <Stat label={t('calculator.totalCost')}>{rupees(result.totalCost)}</Stat>
            <Stat label={t('calculator.totalIncome')}>{rupees(result.income)}</Stat>
            <Stat label={profitable ? t('calculator.profit') : t('calculator.loss')}>
              <span className={profitable ? 'text-lime-deep' : 'text-cta'}>{rupees(Math.abs(result.profit))}</span>
            </Stat>
            <Stat label={t('calculator.breakEven')}>{rupees(result.breakEven, 1)}/kg</Stat>
          </div>
          <Reveal>
            <Card>
              <h2 className="mb-2 font-bold">{t('calculator.chart')}</h2>
              <div className="h-64" role="img" aria-label={t('calculator.chart')}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={result.curve} margin={{ top: 10, right: 12, left: 2, bottom: 0 }}>
                    <CartesianGrid {...grid} />
                    <XAxis dataKey="price" type="number" domain={['dataMin', 'dataMax']} {...axis} tickFormatter={(v: number) => `₹${Math.round(v)}`} />
                    <YAxis {...axis} tickFormatter={lakh} width={52} />
                    <Tooltip
                      cursor={{ stroke: '#8A8670' }}
                      content={<ChartTip format={(v) => rupees(v)} title={(p) => t('calculator.atPrice', { price: p })} />}
                    />
                    <ReferenceLine y={0} stroke="#1F3A1F" strokeWidth={1} />
                    <Area dataKey="profit" type="monotone" stroke="#6F8A14" strokeWidth={2} fill="#A8C23A" fillOpacity={0.22} isAnimationActive={!reduced} />
                    <ReferenceLine x={result.breakEven} stroke="#E5482B" strokeWidth={1.5} />
                    <ReferenceDot x={result.breakEven} y={0} r={5} fill="#E5482B" stroke="#FAF3E3" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-xs text-muted">{t('calculator.chartNote', { price: rupees(result.breakEven, 1) })}</p>
            </Card>
          </Reveal>
        </div>
      </div>
    </>
  )
}
