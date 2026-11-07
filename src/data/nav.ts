import {
  ArrowLeftRight,
  BookOpen,
  Bug,
  CalendarDays,
  Calculator,
  CloudSun,
  History,
  Hourglass,
  IndianRupee,
  Landmark,
  LayoutDashboard,
  Map,
  Sparkles,
  Sprout,
  Truck,
  Vegan,
  type LucideIcon,
} from 'lucide-react'

export interface NavPage {
  path: string
  key: string
  icon: LucideIcon
}

export const marketPages: NavPage[] = [
  { path: '/prices', key: 'prices', icon: IndianRupee },
  { path: '/compare', key: 'compare', icon: ArrowLeftRight },
  { path: '/history', key: 'history', icon: History },
  { path: '/predict', key: 'predict', icon: Sparkles },
  { path: '/map', key: 'map', icon: Map },
  { path: '/traders', key: 'traders', icon: Truck },
]

export const growPages: NavPage[] = [
  { path: '/grow', key: 'grow', icon: Sprout },
  { path: '/varieties', key: 'varieties', icon: Vegan },
  { path: '/calendar', key: 'calendar', icon: CalendarDays },
  { path: '/duration', key: 'duration', icon: Hourglass },
  { path: '/pests', key: 'pests', icon: Bug },
  { path: '/calculator', key: 'calculator', icon: Calculator },
  { path: '/weather', key: 'weather', icon: CloudSun },
  { path: '/schemes', key: 'schemes', icon: Landmark },
]

export const topLinks: NavPage[] = [
  { path: '/', key: 'dashboard', icon: LayoutDashboard },
  { path: '/prices', key: 'prices', icon: IndianRupee },
  { path: '/compare', key: 'compare', icon: ArrowLeftRight },
  { path: '/grow', key: 'grow', icon: Sprout },
  { path: '/learn', key: 'learn', icon: BookOpen },
]

export const allPages: NavPage[] = [
  topLinks[0],
  ...marketPages,
  ...growPages,
  { path: '/learn', key: 'learn', icon: BookOpen },
]
