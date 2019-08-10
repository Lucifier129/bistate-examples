import React, { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { useBistate, useMutate } from 'bistate/react'
import useHashChange from './hooks/useHashChange'
import demos from './demos'


function App() {
  let route = useBistate({ value: '' })
  let updateRoute = useMutate(value => {
    route.value = value
  })

  useHashChange(() => {
    updateRoute(window.location.hash.slice(1))
  })

  useEffect(() => {
    let name = window.location.hash.slice(1)
    if (name) updateRoute(name)
  }, [])

  let Target = demos[route.value] || null

  return (
    <>
      <h1>
        <a href="#">Index</a>
      </h1>
      {!!Target && (
        <Suspense fallback="loading...">
          <Target />
        </Suspense>
      )}
      {!Target &&
        Object.keys(demos).map(name => {
          return (
            <div key={name}>
              <a href={`#${name}`}>{name}</a>
            </div>
          )
        })}
    </>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
