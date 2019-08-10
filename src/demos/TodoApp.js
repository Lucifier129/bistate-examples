import React from 'react'
import { remove } from 'bistate'
import { useBistate, useMutate } from 'bistate/react'
import useSessionStorage from '../hooks/useSessionStorage'

const initialState = {
  todos: [],
  text: {
    value: ''
  },
  type: {
    value: 'all'
  }
}

export default function App() {
  let state = useBistate(initialState)

  let sync = useMutate(source => {
    Object.assign(state, source)
  })

  useSessionStorage({
    key: 'todos-json',
    getter: () => state,
    setter: sync
  })

  return (
    <>
      <Header type={state.type} text={state.text} todos={state.todos} />
      <Todos todos={state.todos} type={state.type} />
      <Footer todos={state.todos} />
    </>
  )
}

function Header({ text, todos, type }) {
  let handleChange = useMutate(event => {
    type.value = event.target.value
  })

  let handleKeyUp = useMutate(event => {
    if (event.key === 'Enter') {
      handleAddTodo()
    }
  })

  let handleToggleAll = useMutate(() => {
    let hasActiveItem = todos.some(todo => !todo.completed)

    todos.forEach(todo => {
      todo.completed = hasActiveItem
    })
  })

  let handleAddTodo = useMutate(() => {
    if (!text.value) {
      return alert('empty content')
    }

    todos.push({
      id: Date.now(),
      content: text.value,
      completed: false
    })

    text.value = ''
  })

  return (
    <div>
      <TodoInput text={text} onKeyUp={handleKeyUp} />
      <button onClick={handleAddTodo}>add</button>
      <button onClick={handleToggleAll}>toggle-all</button>
      <select value={type.value} onChange={handleChange}>
        <option value="all">all</option>
        <option value="active">active</option>
        <option value="completed">completed</option>
      </select>
    </div>
  )
}

function Todos({ todos, type }) {
  let list = todos.filter(todo => {
    if (type.value === 'all') return true
    if (type.value === 'active') return !todo.completed
    if (type.value === 'completed') return todo.completed
    return false
  })

  return (
    <ul>
      {list.map(todo => {
        return <Todo key={todo.id} todo={todo} />
      })}
    </ul>
  )
}

function Todo({ todo }) {
  let edit = useBistate({ value: false })
  let text = useBistate({ value: '' })

  let handleEdit = useMutate(() => {
    edit.value = !edit.value
    text.value = todo.content
  })

  let handleEdited = useMutate(() => {
    edit.value = false
    if (text.value === '') {
      remove(todo)
    } else {
      todo.content = text.value
    }
  })

  let handleKeyUp = useMutate(event => {
    if (event.key === 'Enter') {
      handleEdited()
    }
  })

  let handleRemove = useMutate(() => {
    remove(todo)
  })

  let handleToggle = useMutate(() => {
    todo.completed = !todo.completed
  })

  return (
    <li>
      <button onClick={handleRemove}>remove</button>
      <button onClick={handleToggle}>
        {todo.completed ? 'completed' : 'active'}
      </button>
      {edit.value && (
        <TodoInput text={text} onBlur={handleEdited} onKeyUp={handleKeyUp} />
      )}
      {!edit.value && <span onClick={handleEdit}>{todo.content}</span>}
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
    completedItems.forEach(item => remove(item))
  })

  if (todos.length === 0) return null

  return (
    <div>
      {activeItems.length} item{activeItems.length > 1 && 's'} left
      {completedItems.length > 0 && (
        <>
          {' | '}
          <button onClick={handleClearCompleted}>Clear completed</button>
        </>
      )}
    </div>
  )
}
