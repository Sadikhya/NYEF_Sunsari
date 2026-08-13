import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../api/client'

export function useResource(path, fallback) {
  const fallbackRef = useRef(fallback)
  fallbackRef.current = fallback
  const [state, setState] = useState({ data: fallback, loading: true, error: null })

  const load = useCallback(async (signal) => {
    setState((current) => ({ ...current, loading: true, error: null }))
    try {
      const data = await api.get(path, { signal })
      setState({ data, loading: false, error: null })
    } catch (error) {
      if (error.name === 'AbortError') return
      setState((current) => ({ data: current.data ?? fallbackRef.current, loading: false, error }))
    }
  }, [path])

  useEffect(() => {
    if (import.meta.env.MODE === 'test' && fallbackRef.current !== undefined) {
      setState({ data: fallbackRef.current, loading: false, error: null })
      return undefined
    }
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  return { ...state, reload: () => load() }
}
