import { useState, useCallback } from 'react'

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
