import { ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { rupees } from '../lib/format'
import type { Market, Meta } from '../lib/types'
import { Card, SourceBadge } from './ui'

const SHOWN = ['madanapalle', 'kolar', 'anantapur', 'chittoor']
// Bounding box of the four mandis, padded, so positions stay geographically true.
const BOX = { west: 76.95, east: 79.6, north: 14.95, south: 12.85 }

export function MiniMap({ markets, meta }: { markets: Market[]; meta?: Meta }) {
  const { t } = useTranslation()
  const shown = markets.filter((m) => SHOWN.includes(m.id))
  const place = (m: Market) => ({
    left: `${((m.lon - BOX.west) / (BOX.east - BOX.west)) * 100}%`,
    top: `${((BOX.north - m.lat) / (BOX.north - BOX.south)) * 100}%`,
  })

  return (
    <Card className="flex h-full flex-col">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="font-bold">{t('dashboard.mandiMap')}</h2>
        <SourceBadge meta={meta} />
      </div>
      <Link
        to="/map"
        aria-label={t('dashboard.openMap')}
        className="group relative block min-h-56 flex-1 overflow-hidden rounded-2xl bg-[#E9E2C6]"
      >
        <svg className="absolute inset-0 size-full" viewBox="0 0 300 220" preserveAspectRatio="none" aria-hidden>
          <path d="M-10 60C60 30 100 100 170 80s90-60 150-50v-60H-10z" fill="#DCE3B4" />
          <path d="M-10 230c50-60 90-40 140-60s110-10 190-70v140z" fill="#D5DDA8" />
          <path d="M40-10c20 60 70 80 90 120s60 60 60 130" fill="none" stroke="#FAF3E3" strokeWidth="5" />
          <path d="M-10 150c70-10 130-50 170-50s100 10 150-20" fill="none" stroke="#FAF3E3" strokeWidth="3" />
          <path d="M210-10c-10 50 10 70 30 110s10 80 0 130" fill="none" stroke="#BFD3D0" strokeWidth="3" />
        </svg>
        {shown.map((m) => (
          <span key={m.id} className="absolute -translate-x-1/2 -translate-y-1/2 text-center" style={place(m)}>
            <span className="mx-auto mb-0.5 block size-3 rounded-full border-2 border-card bg-tomato shadow" />
            <span className="block whitespace-nowrap rounded-full bg-card px-2 py-0.5 text-[11px] font-bold shadow-sm">
              {t(`markets.${m.id}`)} {rupees(m.modal)}
            </span>
          </span>
        ))}
        <span className="absolute right-2 top-2 grid size-9 place-items-center rounded-full bg-card shadow-sm transition group-hover:scale-105">
          <ArrowUpRight size={16} aria-hidden />
        </span>
      </Link>
    </Card>
  )
}
