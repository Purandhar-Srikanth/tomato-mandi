const locale = (lang: string) => (lang === 'te' ? 'te-IN' : 'en-IN')

export const rupees = (value: number, digits = 0) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`

export const signedPct = (value: number | null, digits = 1) =>
  value === null ? '–' : `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(digits)}%`

export const fmtDate = (iso: string, lang: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale(lang), options).format(new Date(`${iso}T12:00:00`))

export const monthName = (month: number, lang: string, width: 'short' | 'long' = 'short') =>
  new Intl.DateTimeFormat(locale(lang), { month: width }).format(new Date(2024, month, 15))

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
