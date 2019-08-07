import { useEffect } from 'react'

export default function useHashChange(f) {
  useEffect(() => {
    window.addEventListener('hashchange', f, false)
    return () => {
      window.removeEventListener('hashchange', f, false)
    }
  }, [f])
}
