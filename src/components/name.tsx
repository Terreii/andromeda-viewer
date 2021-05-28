import { useCallback, useEffect } from 'react'
import { NIL } from 'uuid'

import { addMissing, selectAvatarNameById, getDisplayName, getNameString } from '../bundles/names'
import { useSelector, useDispatch } from '../hooks/store'

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
    if (name == null && loadMissing && id !== NIL) {
      dispatch(addMissing({
        id,
        fallback: fallback == null ? undefined : fallback
      }))
    }
  }, [name, fallback, loadMissing, id, dispatch])

  return (
    <span {...args}>
      <span aria-hidden>{name ? getDisplayName(name) : fallback ?? id}</span>
      <span className='sr-only'>{name ? getNameString(name) : fallback ?? id}</span>
    </span>
  )
}
