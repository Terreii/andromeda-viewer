import { useState, useEffect, useCallback, useRef } from 'react'

export function useFormInput (initialValue) {
  const [value, setValue] = useState(initialValue)

  const eventHandler = useCallback(event => {
    const nextValue = typeof event === 'string'
      ? event
      : event.target.value
    setValue(nextValue)
  }, [setValue])

  return {
    value,
    onChange: eventHandler
  }
}

export function useAutoFocus () {
  const ref = useRef(null)

  useEffect(() => {
    setTimeout(() => {
      if (ref.current && typeof ref.current.focus === 'function') {
        ref.current.focus()
      }
    }, 16 * 2)
  }, [])

  return ref
}
