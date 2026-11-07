import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card, PageHeader, Reveal, SubNav } from '../components/ui'
import { stages } from '../data/crop'
import { growPages } from '../data/nav'

const TOTAL = stages.at(-1)!.to
const FIRST_HARVEST = 93

export default function Duration() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('duration.title')} intro={t('duration.intro')} />
      <SubNav pages={growPages} />
      <Card className="mb-5">
        <h2 className="mb-8 font-bold">{t('duration.barTitle')}</h2>
        <div className="relative">
          <span className="absolute -top-6 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 text-xs font-bold text-card" style={{ left: `${(FIRST_HARVEST / TOTAL) * 100}%` }}>
            {t('duration.firstHarvest')}
          </span>
          <div className="flex h-5 gap-0.5 overflow-hidden rounded-full" role="img" aria-label={t('duration.barTitle')}>
            {stages.map((stage, i) => (
              <motion.span
                key={stage.id}
                style={{ background: stage.color, width: `${((stage.to - stage.from) / TOTAL) * 100}%`, transformOrigin: 'left' }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.45, duration: 0.5, ease: 'linear' }}
              />
            ))}
          </div>
        </div>
        <div className="mt-1.5 flex justify-between text-xs font-semibold text-muted tabular">
          <span>{t('duration.day', { n: 0 })}</span>
          <span>{t('duration.day', { n: 75 })}</span>
          <span>{t('duration.day', { n: TOTAL })}</span>
        </div>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((stage, i) => (
          <Reveal key={stage.id} delay={i * 0.06}>
            <Card className="h-full !p-5">
              <i className="mb-2 block h-1.5 w-10 rounded-full" style={{ background: stage.color }} />
              <h2 className="font-bold">{t(`duration.stages.${stage.id}.name`)}</h2>
              <p className="display num my-1 text-2xl">{t('duration.days', { n: stage.to - stage.from })}</p>
              <p className="text-xs font-semibold text-muted tabular">{t('duration.range', { from: stage.from, to: stage.to })}</p>
              <p className="mt-2 text-sm text-muted">{t(`duration.stages.${stage.id}.text`)}</p>
            </Card>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">{t('duration.note')}</p>
    </>
  )
}
