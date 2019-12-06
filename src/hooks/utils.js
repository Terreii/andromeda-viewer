import { useState, useEffect, useCallback, useRef } from 'react'

export function useFormInput (initialValue, checkValidity = false) {
  const [value, setValue] = useState(initialValue)
  const [isValid, setIsValid] = useState(true)

  const eventHandler = useCallback(event => {
    if (typeof event === 'string') {
      setValue(event)
    } else {
      setValue(event.target.value)
      if (checkValidity) {
        setIsValid(event.target.validity.valid)
      }
    }
  }, [checkValidity])

  const returnValue = {
    value,
    onChange: eventHandler
  }
  if (checkValidity) {
    returnValue.isValid = isValid
  }
  return returnValue
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
