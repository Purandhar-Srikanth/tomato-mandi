import { AnimatePresence, motion } from 'framer-motion'
import { Bell, BookOpen, Home, IndianRupee, MoreHorizontal, Search, Sprout } from 'lucide-react'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { allPages, growPages, marketPages, topLinks } from '../data/nav'
import { useDaily } from '../hooks/usePrices'
import { setLanguage } from '../i18n'
import { signedPct } from '../lib/format'
import { Loading } from './ui'

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Tomato Mandi">
      <img src="/favicon.svg" alt="" className="size-10 rounded-xl" width={40} height={40} />
    </Link>
  )
}

function LanguageToggle() {
  const { i18n } = useTranslation()
  const lang = i18n.language === 'te' ? 'te' : 'en'
  return (
    <div className="flex rounded-full border border-line bg-white/70 p-0.5 text-sm font-bold" role="group" aria-label="Language">
      {(['en', 'te'] as const).map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          onClick={() => void setLanguage(code)}
          className={`min-h-9 min-w-9 rounded-full px-2 ${lang === code ? 'bg-ink text-card' : ''}`}
        >
          {code === 'en' ? 'EN' : 'తె'}
        </button>
      ))}
    </div>
  )
}

function SearchBox() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const pages = allPages
      .map((p) => ({ path: p.path, label: t(`nav.${p.key}`), icon: p.icon }))
      .filter((p) => p.label.toLowerCase().includes(q))
    const glossary = t('learn.glossary', { returnObjects: true }) as { term: string; meaning: string }[]
    const terms = glossary
      .filter((g) => g.term.toLowerCase().includes(q))
      .map((g) => ({ path: '/learn', label: g.term, icon: BookOpen }))
    return [...pages, ...terms].slice(0, 6)
  }, [query, t])

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  const go = (path: string) => {
    setQuery('')
    setOpen(false)
    navigate(path)
  }

  return (
    <div ref={box} className="relative hidden w-52 md:block">
      <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" aria-hidden />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && results[0]) go(results[0].path)
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder={t('nav.search')}
        aria-label={t('nav.search')}
        className="min-h-10 w-full rounded-full border border-line bg-white/70 pl-9 pr-3 text-sm placeholder:text-muted"
      />
      {open && query && (
        <ul className="absolute left-0 top-12 z-[1000] w-64 rounded-2xl border border-line bg-card p-1.5 shadow-xl">
          {results.length === 0 && <li className="p-2 text-sm text-muted">{t('nav.noResults')}</li>}
          {results.map(({ path, label, icon: Icon }) => (
            <li key={`${path}-${label}`}>
              <button type="button" onClick={() => go(path)} className="flex min-h-10 w-full items-center gap-2 rounded-xl px-2 text-left text-sm font-semibold hover:bg-white">
                <Icon size={15} aria-hidden />
                {label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Notifications() {
  const { t } = useTranslation()
  const { data } = useDaily()
  const [open, setOpen] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const movers = useMemo(
    () => [...(data?.markets ?? [])].sort((a, b) => Math.abs(b.changePct ?? 0) - Math.abs(a.changePct ?? 0)).slice(0, 3),
    [data],
  )

  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={t('nav.notifications')}
        className="relative grid size-10 place-items-center rounded-full border border-line bg-white/70"
      >
        <Bell size={17} aria-hidden />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-tomato ring-2 ring-card" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-[1000] w-64 rounded-2xl border border-line bg-card p-3 shadow-xl">
          <p className="mb-1 text-sm font-bold">{t('nav.biggestMoves')}</p>
          {movers.map((m) => (
            <p key={m.id} className="flex justify-between py-0.5 text-sm">
              {t(`markets.${m.id}`)}
              <b className="tabular">{signedPct(m.changePct)}</b>
            </p>
          ))}
          {data?.meta.source !== 'agmarknet' && <p className="mt-1 text-xs text-muted">{t('common.sampleData')}</p>}
        </div>
      )}
    </div>
  )
}

function Navbar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const inGroup = (path: string) =>
    (path === '/prices' && ['/history', '/predict', '/map', '/traders'].includes(pathname)) ||
    (path === '/grow' && growPages.some((p) => p.path === pathname))

  return (
    <header className="flex items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
      <Logo />
      <SearchBox />
      <nav aria-label={t('nav.main')} className="mx-auto hidden items-center gap-1 lg:flex">
        {topLinks.map(({ path, key }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `rounded-full px-4 py-2 text-sm font-semibold transition ${isActive || inGroup(path) ? 'bg-ink text-card' : 'hover:bg-card'}`
            }
          >
            {t(`nav.${key}`)}
          </NavLink>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-2 lg:ml-0">
        <LanguageToggle />
        <span className="hidden text-sm font-semibold xl:inline">{t('nav.greeting')}</span>
        <Notifications />
      </div>
    </header>
  )
}

const tabs = [
  { to: '/', key: 'home', icon: Home },
  { to: '/prices', key: 'prices', icon: IndianRupee },
  { to: '/grow', key: 'grow', icon: Sprout },
  { to: '/learn', key: 'learn', icon: BookOpen },
  { to: '/more', key: 'more', icon: MoreHorizontal },
]

function BottomTabs() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const groupOf = (to: string) =>
    (to === '/prices' && marketPages.some((p) => p.path === pathname)) ||
    (to === '/grow' && growPages.some((p) => p.path === pathname))

  return (
    <nav
      aria-label={t('nav.main')}
      className="fixed inset-x-0 bottom-0 z-[1100] grid grid-cols-5 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {tabs.map(({ to, key, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${
              isActive || groupOf(to) ? 'text-cta' : 'text-muted'
            }`
          }
        >
          <Icon size={20} aria-hidden />
          {t(`nav.${key}`)}
        </NavLink>
      ))}
    </nav>
  )
}

export function Layout() {
  const { t } = useTranslation()
  const location = useLocation()
  const { data } = useDaily()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-dvh pb-16 sm:p-4 sm:pb-20 lg:p-6">
      <div className="mx-auto min-h-[calc(100dvh-3rem)] max-w-[1500px] bg-canvas sm:rounded-[var(--radius-app)] sm:shadow-[var(--shadow-app)]">
        <Navbar />
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="px-4 pb-6 sm:px-6"
          >
            <Suspense fallback={<Loading />}>
              <Outlet />
            </Suspense>
          </motion.main>
        </AnimatePresence>
        <footer className="px-4 pb-6 text-center text-xs text-muted sm:px-6">{t(data?.meta.source === 'agmarknet' ? 'common.footerReal' : 'common.footer')}</footer>
      </div>
      <BottomTabs />
    </div>
  )
}
