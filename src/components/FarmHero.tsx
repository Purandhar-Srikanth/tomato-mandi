import { useReducedMotion } from 'framer-motion'
import { Maximize, Minimize, Pause, Play } from 'lucide-react'
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Market } from '../lib/types'
import { FarmFallback } from './FarmFallback'
import { PillSelect } from './ui'

const FarmScene = lazy(() => import('./three/FarmScene'))
const MandiMap = lazy(() => import('./MandiMap'))

function canRun3D() {
  if (new URLSearchParams(location.search).has('static')) return false
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }
  if ((nav.deviceMemory ?? 8) <= 2 || nav.hardwareConcurrency <= 2 || nav.connection?.saveData) return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const roundButton =
  'grid size-11 place-items-center rounded-full border border-line bg-card/90 shadow-sm backdrop-blur transition hover:bg-white'

export function FarmHero({ markets, className = '', controlsClass = '' }: { markets: Market[]; className?: string; controlsClass?: string }) {
  const { t } = useTranslation()
  const reduced = Boolean(useReducedMotion())
  const wrapper = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<'3d' | 'map'>('3d')
  const [spinning, setSpinning] = useState(!reduced)
  const [visible, setVisible] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [webgl, setWebgl] = useState(canRun3D)

  useEffect(() => {
    if (!wrapper.current) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(wrapper.current)
    const onChange = () => setFullscreen(document.fullscreenElement === wrapper.current)
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      observer.disconnect()
      document.removeEventListener('fullscreenchange', onChange)
    }
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void wrapper.current?.requestFullscreen?.()
  }

  const fallback = <FarmFallback label={t('hero.sceneAlt')} />

  return (
    <div ref={wrapper} className={`relative ${fullscreen ? 'bg-canvas' : ''} ${className}`}>
      <div className={`absolute inset-0 ${view === '3d' && !fullscreen ? 'scene-fade' : ''}`}>
        {view === 'map' ? (
          <Suspense fallback={null}>
            <MandiMap markets={markets} className="size-full" />
          </Suspense>
        ) : webgl ? (
          <SceneBoundary fallback={fallback}>
            <Suspense fallback={fallback}>
              <FarmScene
                autoRotate={spinning}
                animate={!reduced}
                visible={visible}
                zoomable={fullscreen}
                readyLabel={t('hero.ready')}
                crateLabel="200/200"
                onContextLost={() => setWebgl(false)}
              />
            </Suspense>
          </SceneBoundary>
        ) : (
          fallback
        )}
      </div>

      <div className={`absolute right-3 top-3 z-[500] ${controlsClass}`}>
        <PillSelect label={t('hero.view')} value={view} onChange={(e) => setView(e.target.value as '3d' | 'map')}>
          <option value="3d">{t('hero.view3d')}</option>
          <option value="map">{t('hero.viewMap')}</option>
        </PillSelect>
      </div>
      <div className="absolute bottom-3 left-3 z-[500] flex gap-2">
        <button type="button" className={roundButton} onClick={toggleFullscreen} aria-label={fullscreen ? t('hero.exitFullscreen') : t('hero.fullscreen')}>
          {fullscreen ? <Minimize size={17} aria-hidden /> : <Maximize size={17} aria-hidden />}
        </button>
        {view === '3d' && webgl && (
          <button type="button" className={roundButton} onClick={() => setSpinning(!spinning)} aria-pressed={spinning} aria-label={spinning ? t('hero.pause') : t('hero.play')}>
            {spinning ? <Pause size={17} aria-hidden /> : <Play size={17} aria-hidden />}
          </button>
        )}
      </div>
    </div>
  )
}
