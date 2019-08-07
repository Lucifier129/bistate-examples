import { useRef, useEffect } from 'react'

export default function useSessionStorage({ key, getter, setter }) {
  let ref = useRef({ key, getter, setter })

  useEffect(() => {
    let json = window.sessionStorage.getItem(key)

    if (json) {
      ref.current.setter(JSON.parse(json))
    }

    return () => {
      let value = JSON.stringify(ref.current.getter())
      window.sessionStorage.setItem(key, value)
    }
  }, [])

  useEffect(() => {
    ref.current = { key, getter, setter }
  }, [key, getter, setter])
}
