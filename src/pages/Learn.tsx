import { ChevronRight, Gavel, Search, ShoppingBasket, Sprout, Truck, Users, type LucideIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, PageHeader, Reveal } from '../components/ui'

const STEP_ICONS: LucideIcon[] = [Sprout, Users, Gavel, Truck, ShoppingBasket]

export default function Learn() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const steps = t('learn.steps', { returnObjects: true }) as { title: string; text: string }[]
  const glossary = t('learn.glossary', { returnObjects: true }) as { term: string; meaning: string }[]
  const faq = t('learn.faq', { returnObjects: true }) as { q: string; a: string }[]
  const stories = t('learn.stories', { returnObjects: true }) as { name: string; village: string; text: string }[]

  const terms = useMemo(() => {
    const q = query.trim().toLowerCase()
    return glossary.filter((g) => !q || g.term.toLowerCase().includes(q) || g.meaning.toLowerCase().includes(q))
  }, [glossary, query])

  return (
    <>
      <PageHeader title={t('learn.title')} intro={t('learn.intro')} />

      <h2 className="display mb-3 text-2xl">{t('learn.auctionTitle')}</h2>
      <ol className="mb-8 grid gap-3 md:grid-cols-5">
        {steps.map((step, i) => {
          const Icon = STEP_ICONS[i]
          return (
            <Reveal key={step.title} delay={i * 0.07}>
              <li className="relative h-full list-none">
                <Card className="h-full !p-4">
                  <span className="mb-2 grid size-10 place-items-center rounded-full bg-sun">
                    <Icon size={18} aria-hidden />
                  </span>
                  <h3 className="font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted">{step.text}</p>
                </Card>
                {i < steps.length - 1 && (
                  <ChevronRight size={18} className="absolute -right-3.5 top-1/2 z-10 hidden -translate-y-1/2 text-olive md:block" aria-hidden />
                )}
              </li>
            </Reveal>
          )
        })}
      </ol>

      <div className="mb-8 grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="display mb-3 text-2xl">{t('learn.glossaryTitle')}</h2>
          <label className="relative mb-3 block">
            <span className="sr-only">{t('learn.glossarySearch')}</span>
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('learn.glossarySearch')}
              className="min-h-11 w-full rounded-full border border-line bg-white/70 pl-9 pr-3 text-sm placeholder:text-muted"
            />
          </label>
          <dl className="max-h-[440px] divide-y divide-line overflow-y-auto pr-1">
            {terms.map((g) => (
              <div key={g.term} className="py-2.5">
                <dt className="font-bold">{g.term}</dt>
                <dd className="text-sm text-muted">{g.meaning}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="display mb-3 text-2xl">{t('learn.faqTitle')}</h2>
          <div className="divide-y divide-line">
            {faq.map((item, i) => (
              <details key={item.q} open={i === 0} className="group py-2">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-bold">
                  {item.q}
                  <ChevronRight size={16} className="shrink-0 transition group-open:rotate-90" aria-hidden />
                </summary>
                <p className="pb-2 text-sm text-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </Card>
      </div>

      <h2 className="display mb-1 text-2xl">{t('learn.storiesTitle')}</h2>
      <p className="mb-3 text-sm text-muted">{t('learn.storiesNote')}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {stories.map((s, i) => (
          <Reveal key={s.name} delay={i * 0.07}>
            <Card className="h-full !p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="display grid size-12 place-items-center rounded-full bg-lime/40 text-xl" aria-hidden>{s.name.slice(0, 1)}</span>
                <div>
                  <p className="font-bold">{s.name}</p>
                  <p className="text-sm text-muted">{s.village}</p>
                </div>
              </div>
              <p className="text-sm text-muted">{s.text}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </>
  )
}
