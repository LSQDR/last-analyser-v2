import { useEffect, useRef } from 'react'

// Holds the latest value in a ref, so an effect can call the newest callback
// without listing it as a dependency and re-running when its identity changes.
export function useLatest(value) {
  const ref = useRef(value)
  useEffect(() => {
    ref.current = value
  })
  return ref
}
