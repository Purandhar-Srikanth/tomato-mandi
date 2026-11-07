const iso = (x: number, y: number) => [300 + (x - y) * 21, 96 + (x + y) * 10.5] as const
const pts = (...points: (readonly [number, number])[]) => points.map((p) => p.join(',')).join(' ')

/** Static isometric drawing for phones without WebGL or with little memory. */
export function FarmFallback({ label }: { label: string }) {
  const [top, right, bottom, left] = [iso(-1, -1), iso(13, -1), iso(13, 13), iso(-1, 13)]
  const drop = (p: readonly [number, number]) => [p[0], p[1] + 30] as const
  const rows = [0, 1, 2, 3, 4, 5, 6]
  return (
    <svg viewBox="-20 30 640 380" className="size-full" role="img" aria-label={label}>
      <polygon points={pts(left, bottom, drop(bottom), drop(left))} fill="#7A5433" />
      <polygon points={pts(bottom, right, drop(right), drop(bottom))} fill="#5F3F26" />
      <polygon points={pts(top, right, bottom, left)} fill="#8FB24E" />
      {rows.map((r) => (
        <polygon key={r} fill="#6B5A3A" points={pts(iso(-0.5, r * 1.8 - 0.1), iso(12.5, r * 1.8 - 0.1), iso(12.5, r * 1.8 + 1.1), iso(-0.5, r * 1.8 + 1.1))} />
      ))}
      {rows.flatMap((r) =>
        Array.from({ length: 12 }, (_, c) => {
          const [x, y] = iso(c + 0.5, r * 1.8 + 0.5)
          return (
            <g key={`${r}-${c}`}>
              <circle cx={x} cy={y - 9} r={10} fill={(r + c) % 2 ? '#3F7A2A' : '#4F8A2E'} />
              <circle cx={x - 3} cy={y - 15} r={6.5} fill="#5E9A35" />
              <circle cx={x + 5} cy={y - 8} r={3} fill="#E5482B" />
              <circle cx={x - 5} cy={y - 5} r={2.6} fill="#E5482B" />
            </g>
          )
        }),
      )}
      <g transform="translate(250 66)">
        <line x1="0" y1="26" x2="0" y2="76" stroke="#E5482B" strokeWidth="2" />
        <circle r="17" cy="14" fill="#E5482B" stroke="#FAF3E3" strokeWidth="3" />
        <circle r="8" cy="15" fill="#FAF3E3" />
      </g>
    </svg>
  )
}
