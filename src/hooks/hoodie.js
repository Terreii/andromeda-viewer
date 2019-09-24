import { useMemo } from 'react'
import { useDispatch } from 'react-redux'

export function useHoodie () {
  const dispatch = useDispatch()

  return useMemo(
    // Access hoodie from redux-thunk object.
    () => dispatch((dispatch, getState, { hoodie }) => hoodie),
    [dispatch]
  )
}

export const useAccount = () => useHoodie().account
