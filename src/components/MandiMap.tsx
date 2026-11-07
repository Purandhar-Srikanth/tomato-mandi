import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { rupees, signedPct } from '../lib/format'
import type { Market } from '../lib/types'

const SOUTH = ['madanapalle', 'kolar', 'anantapur', 'chittoor', 'bengaluru']

const priceIcon = (text: string) =>
  L.divIcon({ className: 'mandi-marker', html: `<span>${text}</span>`, iconSize: [0, 0] })

function FitTo({ markets }: { markets: Market[] }) {
  const map = useMap()
  useEffect(() => {
    if (markets.length) map.fitBounds(L.latLngBounds(markets.map((m) => [m.lat, m.lon])), { padding: [60, 60] })
  }, [map, markets])
  return null
}

/** Leaflet map of the mandis. Loaded lazily, since Leaflet is only needed here. */
export default function MandiMap({
  markets,
  region = 'south',
  className = 'h-full w-full',
}: {
  markets: Market[]
  region?: 'south' | 'india'
  className?: string
}) {
  const { t } = useTranslation()
  const focus = region === 'south' ? markets.filter((m) => SOUTH.includes(m.id)) : markets
  return (
    <MapContainer center={[13.6, 78]} zoom={7} scrollWheelZoom={false} className={className}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitTo markets={focus} />
      {markets.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lon]} icon={priceIcon(`${t(`markets.${m.id}`)} ${rupees(m.modal, 1)}`)} title={t(`markets.${m.id}`)}>
          <Popup>
            <strong>{t(`markets.${m.id}`)}</strong>
            <br />
            {t('prices.modal')}: {rupees(m.modal, 1)}/kg ({signedPct(m.changePct)})
            <br />
            {t('prices.arrivals')}: {m.arrivals.toLocaleString('en-IN')} t
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
