import React, { useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { addMissing, selectAvatarNameById } from '../bundles/names'

export default function Name ({ id, ...args }: { id: string }) {
  const dispatch = useDispatch()

  const selector = useCallback(
    (state: any) => selectAvatarNameById(state, id),
    [id]
  )

  const name = useSelector(selector)

  useEffect(() => {
    if (name == null) {
      dispatch(addMissing(id))
    }
  }, [name, id, dispatch])

  return (
    <span {...args}>
      {name?.getDisplayName() ?? id}
    </span>
  )
}
