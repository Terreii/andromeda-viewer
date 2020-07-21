import React, { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { addMissing, selectAvatarNameById } from '../bundles/names'

export default function Name ({
  id,
  loadMissing = true,
  fallback,
  ...args
}: {
  id: string,
  loadMissing?: boolean,
  fallback?: string
}) {
  const dispatch = useDispatch()

  const selector = useCallback(
    (state: any) => selectAvatarNameById(state, id),
    [id]
  )

  const name = useSelector(selector)

  useEffect(() => {
    if (name == null && loadMissing) {
      dispatch(addMissing({
        id,
        fallback: fallback == null ? undefined : fallback
      }))
    }
  }, [name, fallback, loadMissing, id, dispatch])

  return (
    <span {...args}>
      <span aria-hidden>{name?.getDisplayName() ?? fallback ?? id}</span>
      <span className='sr-only'>{name?.getName() ?? fallback ?? id}</span>
    </span>
  )
}