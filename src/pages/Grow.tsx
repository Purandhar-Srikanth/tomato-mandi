import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Card, PageHeader, SubNav } from '../components/ui'
import { growPages } from '../data/nav'

export default function Grow() {
  const { t } = useTranslation()
  const steps = t('grow.steps', { returnObjects: true }) as { title: string; text: string }[]
  return (
    <>
      <PageHeader title={t('grow.title')} intro={t('grow.intro')} />
      <SubNav pages={growPages} />
      <ol className="relative mx-auto max-w-3xl before:absolute before:bottom-6 before:left-5 before:top-6 before:w-0.5 before:bg-line">
        {steps.map((step, i) => (
          <motion.li
            key={step.title}
            className="relative pb-4 pl-14"
            initial={{ opacity: 0, x: -14 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45 }}
          >
            <span className="display num absolute left-0 top-3 grid size-10 place-items-center rounded-full bg-lime text-lg text-ink shadow-sm">{i + 1}</span>
            <Card className="!p-4 sm:!p-5">
              <h2 className="font-bold">{step.title}</h2>
              <p className="mt-1 text-sm text-muted">{step.text}</p>
            </Card>
          </motion.li>
        ))}
      </ol>
    </>
  )
}
