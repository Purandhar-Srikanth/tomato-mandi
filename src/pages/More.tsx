import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { Card, PageHeader } from '../components/ui'
import { growPages, marketPages, type NavPage } from '../data/nav'

function Group({ title, pages }: { title: string; pages: NavPage[] }) {
  const { t } = useTranslation()
  return (
    <section className="mb-6">
      <h2 className="mb-2 font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {pages.map(({ path, key, icon: Icon }) => (
          <Link key={path} to={path}>
            <Card className="flex min-h-20 items-center gap-2.5 !p-4 transition hover:bg-white">
              <Icon size={19} className="shrink-0 text-lime-deep" aria-hidden />
              <span className="text-sm font-bold">{t(`nav.${key}`)}</span>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function More() {
  const { t } = useTranslation()
  return (
    <>
      <PageHeader title={t('nav.more')} />
      <Group title={t('nav.marketGroup')} pages={marketPages} />
      <Group title={t('nav.growGroup')} pages={growPages} />
    </>
  )
}
