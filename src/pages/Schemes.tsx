import { ExternalLink, Landmark } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Card, PageHeader, Reveal, SubNav } from '../components/ui'
import { schemes } from '../data/crop'
import { growPages } from '../data/nav'

export default function Schemes() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('schemes.title')} intro={t('schemes.intro')} />
      <SubNav pages={growPages} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {schemes.map(({ id, url }, i) => (
          <Reveal key={id} delay={(i % 3) * 0.06}>
            <Card className="flex h-full flex-col">
              <span className="mb-2 grid size-9 place-items-center rounded-full bg-sun">
                <Landmark size={16} aria-hidden />
              </span>
              <h2 className="display text-2xl">{t(`schemes.items.${id}.name`)}</h2>
              <dl className="mt-2 flex-1 space-y-2 text-sm">
                <div>
                  <dt className="font-bold">{t('schemes.gives')}</dt>
                  <dd className="text-muted">{t(`schemes.items.${id}.gives`)}</dd>
                </div>
                <div>
                  <dt className="font-bold">{t('schemes.who')}</dt>
                  <dd className="text-muted">{t(`schemes.items.${id}.who`)}</dd>
                </div>
              </dl>
              <a href={url} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-sm font-bold underline">
                {t('schemes.official')}
                <ExternalLink size={14} aria-hidden />
              </a>
            </Card>
          </Reveal>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">{t('schemes.note')}</p>
    </>
  )
}
