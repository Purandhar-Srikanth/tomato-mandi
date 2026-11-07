import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, PageHeader, PillSelect, Reveal, SubNav } from '../components/ui'
import { varieties, type Shape } from '../data/crop'
import { growPages } from '../data/nav'

function TomatoArt({ shape }: { shape: Shape }) {
  const size = { round: [30, 30], oval: [23, 34], flat: [34, 26] }[shape]
  return (
    <svg viewBox="0 0 100 90" className="h-24 w-full" aria-hidden>
      <ellipse cx="50" cy="52" rx={size[0]} ry={size[1]} fill="#E5482B" />
      <ellipse cx={50 - size[0] * 0.35} cy={52 - size[1] * 0.35} rx={size[0] * 0.22} ry={size[1] * 0.16} fill="#F58B6B" />
      <path d={`M50 ${52 - size[1] + 4}c-4-7-11-8-16-6 3 2 5 5 5 8-4 0-7 1-9 4 6 1 12 0 15-3 1 3 3 6 5 7 2-1 4-4 5-7 3 3 9 4 15 3-2-3-5-4-9-4 0-3 2-6 5-8-5-2-12-1-16 6z`} fill="#3F7A2A" />
    </svg>
  )
}

export default function Varieties() {
  const { t } = useTranslation()
  const [season, setSeason] = useState('all')
  const [purpose, setPurpose] = useState('all')

  const list = useMemo(
    () =>
      varieties.filter(
        (v) =>
          (season === 'all' || v.seasons.some((s) => s === season)) &&
          (purpose === 'all' || v.purpose.some((p) => p === purpose)),
      ),
    [season, purpose],
  )

  return (
    <>
      <PageHeader title={t('varieties.title')} intro={t('varieties.intro')} />
      <SubNav pages={growPages} />
      <div className="mb-5 flex flex-wrap gap-2">
        <PillSelect label={t('varieties.season')} value={season} onChange={(e) => setSeason(e.target.value)}>
          <option value="all">{t('varieties.allSeasons')}</option>
          {['kharif', 'rabi', 'summer'].map((s) => (
            <option key={s} value={s}>{t(`varieties.seasons.${s}`)}</option>
          ))}
        </PillSelect>
        <PillSelect label={t('varieties.purpose')} value={purpose} onChange={(e) => setPurpose(e.target.value)}>
          <option value="all">{t('varieties.allPurposes')}</option>
          {['table', 'processing'].map((p) => (
            <option key={p} value={p}>{t(`varieties.purposes.${p}`)}</option>
          ))}
        </PillSelect>
      </div>
      {list.length === 0 && <p className="py-10 text-center text-muted">{t('nav.noResults')}</p>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {list.map((v) => (
          <Reveal key={v.id}>
            <Card className="flex h-full flex-col !p-5">
              <div className="mb-2 rounded-2xl bg-canvas/70 py-2">
                <TomatoArt shape={v.shape} />
              </div>
              <span className="w-fit rounded-full bg-sun/40 px-2.5 py-0.5 text-xs font-bold">{t(`varieties.types.${v.type}`)}</span>
              <h2 className="display mt-2 text-2xl">{t(`varieties.items.${v.id}.name`)}</h2>
              <dl className="mt-2 space-y-1.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t('varieties.days')}</dt>
                  <dd className="font-semibold tabular">{v.days}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{t('varieties.yield')}</dt>
                  <dd className="font-semibold tabular">{v.yieldTHa} t/ha</dd>
                </div>
                <div>
                  <dt className="text-muted">{t('varieties.resistance')}</dt>
                  <dd className="font-semibold">{t(`varieties.items.${v.id}.resistance`)}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t('varieties.bestSeason')}</dt>
                  <dd className="font-semibold">{v.seasons.map((s) => t(`varieties.seasons.${s}`)).join(', ')}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t('varieties.regions')}</dt>
                  <dd className="font-semibold">{t(`varieties.items.${v.id}.regions`)}</dd>
                </div>
              </dl>
            </Card>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">{t('varieties.note')}</p>
    </>
  )
}
