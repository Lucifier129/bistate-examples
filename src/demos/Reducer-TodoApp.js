import React from 'react'
import { remove } from 'bistate'
import { useBireducer, useMutate } from 'bistate/react'
import useSessionStorage from '../hooks/useSessionStorage'

export default function App() {
  let initialState = {
    todos: [],
    text: {
      value: ''
    }
  }
  let [state, dispatch] = useBireducer((state, action) => {
    if (action.type === 'ADD_TODO') {
      let todo = {
        id: Date.now(),
        content: state.text.value,
        completed: false
      }
      state.todos.push(todo)
      state.text.value = ''
    }

    if (action.type === 'TOGGLE_ALL') {
      let hasActiveItem = state.todos.some(todo => !todo.completed)

      state.todos.forEach(todo => {
        todo.completed = hasActiveItem
      })
    }

    if (action.type === 'SYNC_STORAGE') {
      Object.assign(state, action.payload)
    }
  }, initialState)

  useSessionStorage({
    key: 'reducer-todos-json',
    getter: () => state,
    setter: source => dispatch({ type: 'SYNC_STORAGE', payload: source })
  })

  let handleAddTodo = () => {
    if (!state.text.value) {
      return alert('empty content')
    }
    dispatch({ type: 'ADD_TODO' })
  }

  let handleToggleAll = () => {
    dispatch({ type: 'TOGGLE_ALL' })
  }

  let handleKeyUp = event => {
    if (event.key === 'Enter') {
      handleAddTodo()
    }
  }

  return (
    <>
      <div>
        <TodoInput text={state.text} onKeyUp={handleKeyUp} />
        <button onClick={handleAddTodo}>add</button>
        <button onClick={handleToggleAll}>toggle-all</button>
      </div>
      <Todos todos={state.todos} />
      <Footer todos={state.todos} />
    </>
  )
}

function Todos({ todos }) {
  return (
    <ul>
      {todos.map(todo => {
        return <Todo key={todo.id} todo={todo} />
      })}
    </ul>
  )
}

function Todo({ todo }) {
  let [state, dispatch] = useBireducer(
    (state, action) => {
      if (action.type === 'EDIT') {
        state.edit.value = true
        state.text.value = todo.content
      }

      if (action.type === 'EDITED') {
        if (state.text.value === '') {
          remove(todo)
        } else {
          state.edit.value = false
          todo.content = state.text.value
        }
      }

      if (action.type === 'REMOVE') {
        remove(todo)
      }

      if (action.type === 'TOGGLE') {
        todo.completed = !todo.completed
      }
    },
    {
      edit: {
        value: false
      },
      text: {
        value: ''
      }
    }
  )

  let handleEdit = () => {
    dispatch({ type: 'EDIT' })
  }

  let handleEdited = () => {
    dispatch({ type: 'EDITED' })
  }

  let handleKeyUp = event => {
    if (event.key === 'Enter') {
      handleEdited()
    }
  }

  let handleRemove = () => {
    dispatch({ type: 'REMOVE' })
  }

  let handleToggle = () => {
    dispatch({ type: 'TOGGLE' })
  }

  return (
    <li>
      <button onClick={handleRemove}>remove</button>
      <button onClick={handleToggle}>
        {todo.completed ? 'completed' : 'active'}
      </button>
      {state.edit.value && (
        <TodoInput
          text={state.text}
          onBlur={handleEdited}
          onKeyUp={handleKeyUp}
        />
      )}
      {!state.edit.value && <span onClick={handleEdit}>{todo.content}</span>}
    </li>
  )
}

function TodoInput({ text, ...props }) {
  let handleChange = useMutate(event => {
    text.value = event.target.value
  })
  return (
    <input type="text" {...props} onChange={handleChange} value={text.value} />
  )
}

function Footer({ todos }) {
  let activeItems = todos.filter(todo => !todo.completed)
  let completedItems = todos.filter(todo => todo.completed)

  let handleClearCompleted = useMutate(() => {
    todos.filter(todo => todo.completed).forEach(item => remove(item))
  })

  return (
    <div>
      {activeItems.length} item{activeItems.length > 1 && 's'} left |{' '}
      {completedItems.length > 0 && (
        <button onClick={handleClearCompleted}>Clear completed</button>
      )}
    </div>
  )
}
