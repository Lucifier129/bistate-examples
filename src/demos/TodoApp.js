import React from 'react'
import { remove } from 'bistate'
import { useBistate, useMutate } from 'bistate/react'
import useSessionStorage from '../hooks/useSessionStorage'

export default function App() {
  let [state] = useBistate({
    todos: [],
    text: {
      value: ''
    }
  })

  let sync = useMutate(source => {
    Object.assign(state, source)
  })

  useSessionStorage({
    key: 'todos-json',
    getter: () => state,
    setter: sync
  })

  let handleAddTodo = useMutate(() => {
    if (!state.text.value) {
      return alert('empty content')
    }

    state.todos.push({
      id: Date.now(),
      content: state.text.value,
      completed: false
    })

    state.text.value = ''
  })

  let handleKeyUp = useMutate(event => {
    if (event.key === 'Enter') {
      handleAddTodo()
    }
  })

  let handleToggleAll = useMutate(() => {
    let hasActiveItem = state.todos.some(todo => !todo.completed)

    state.todos.forEach(todo => {
      todo.completed = hasActiveItem
    })
  })

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
  let [edit] = useBistate({ value: false })
  let [text] = useBistate({ value: '' })

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

  return (
    <div>
      {activeItems.length} item{activeItems.length > 1 && 's'} left |{' '}
      {completedItems.length > 0 && (
        <button onClick={handleClearCompleted}>Clear completed</button>
      )}
    </div>
  )
}
