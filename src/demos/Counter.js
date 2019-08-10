import React, { useEffect } from 'react'
import { useBistate, useMutate } from 'bistate/react'
import useSessionStorage from '../hooks/useSessionStorage'

export default function Counter() {
  let state = useBistate({ count: 0 })

  let incre = useMutate(() => {
    state.count += 1
  })

  let decre = useMutate(() => {
    state.count -= 1
  })

  let sync = useMutate(source => {
    Object.assign(state, source)
  })

  useSessionStorage({
    key: 'counter-json',
    getter: () => state,
    setter: sync
  })

  useEffect(() => {
    let timer = setInterval(incre, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      <button onClick={incre}>+1</button>
      {state.count}
      <button onClick={decre}>-1</button>
    </div>
  )
}
