import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card, PageHeader, Reveal, SubNav } from '../components/ui'
import { calendar, type Task } from '../data/crop'
import { growPages } from '../data/nav'
import { monthName } from '../lib/format'

const TASKS: { id: Task; color: string }[] = [
  { id: 'sow', color: '#F2C230' },
  { id: 'transplant', color: '#A8C23A' },
  { id: 'harvest', color: '#E5482B' },
]

/** Splits a range that wraps past December into two in-year spans. */
const spans = ([from, to]: [number, number]): [number, number][] =>
  from <= to ? [[from, to]] : [[from, 11], [0, to]]

export default function CalendarPage() {
  const { t, i18n } = useTranslation()
  const now = new Date().getMonth()
  return (
    <>
      <PageHeader title={t('calendar.title')} intro={t('calendar.intro')} />
      <SubNav pages={growPages} />
      <ul className="mb-4 flex flex-wrap gap-4 text-sm font-semibold">
        {TASKS.map((task) => (
          <li key={task.id} className="flex items-center gap-2">
            <i className="h-2.5 w-5 rounded-full" style={{ background: task.color }} />
            {t(`calendar.${task.id}`)}
          </li>
        ))}
      </ul>
      <div className="space-y-4">
        {calendar.map((region) => (
          <Reveal key={region.id}>
            <Card className={region.main ? 'ring-2 ring-lime' : ''}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="font-bold">{t(`calendar.regions.${region.id}`)}</h2>
                {region.main && <span className="rounded-full bg-lime/30 px-2.5 py-0.5 text-xs font-bold">{t('calendar.mainSeason')}</span>}
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[560px]">
                  <div className="grid grid-cols-[84px_repeat(12,1fr)] text-center text-xs font-semibold text-muted">
                    <span />
                    {Array.from({ length: 12 }, (_, m) => (
                      <span key={m} className={m === now ? 'font-bold text-ink' : ''}>{monthName(m, i18n.language)}</span>
                    ))}
                  </div>
                  {TASKS.map((task) => (
                    <div key={task.id} className="mt-1.5 grid grid-cols-[84px_repeat(12,1fr)] items-center">
                      <span className="text-xs font-medium text-muted">{t(`calendar.${task.id}`)}</span>
                      <div className="relative col-span-12 h-4 rounded-full bg-canvas/70">
                        {region.tasks[task.id].flatMap(spans).map(([from, to]) => (
                          <motion.span
                            key={`${from}-${to}`}
                            className="absolute inset-y-0 rounded-full"
                            style={{ left: `${(from / 12) * 100}%`, width: `${((to - from + 1) / 12) * 100}%`, background: task.color, transformOrigin: 'left' }}
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">{t(`calendar.notes.${region.id}`)}</p>
            </Card>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">{t('calendar.disclaimer')}</p>
    </>
  )
}
