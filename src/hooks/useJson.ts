import { useEffect, useState } from 'react'

const cache = new Map<string, Promise<unknown>>()

function load<T>(url: string): Promise<T> {
  let request = cache.get(url)
  if (!request) {
    request = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`${res.status} ${url}`)
      return res.json()
    })
    request.catch(() => cache.delete(url))
    cache.set(url, request)
  }
  return request as Promise<T>
}

export function useJson<T>(url: string | null) {
  const [state, setState] = useState<{ url: string | null; data?: T; failed?: boolean }>({ url })

  useEffect(() => {
    if (!url) return
    let live = true
    load<T>(url).then(
      (data) => live && setState({ url, data }),
      () => live && setState({ url, failed: true }),
    )
    return () => {
      live = false
    }
  }, [url])

  const current = state.url === url
  return {
    data: current ? state.data : undefined,
    failed: current ? Boolean(state.failed) : false,
    loading: Boolean(url) && (!current || (!state.data && !state.failed)),
  }
}
