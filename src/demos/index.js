import React from 'react'

export default {
  Counter: React.lazy(() => import('./Counter')),
  TodoApp: React.lazy(() => import('./TodoApp')),
  'Reducer-TodoApp': React.lazy(() => import('./Reducer-TodoApp'))
}
