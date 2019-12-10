import { useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { selectNames, selectAvatarNameById } from '../reducers/names'
import { getGroups } from '../selectors/groups'

export function useNames (...ids: string[]) {
  const names = useSelector(selectNames)

  // eslint-disable-next-line
  return useMemo(() => ids.map(id => names[id]), [names, ...ids])
}

export function useName (id: string) {
  const selector = useCallback(state => selectAvatarNameById(state, id), [id])

  return useSelector(selector)
}

export function useGroupName (id: string) {
  const groups = useSelector(getGroups)

  const group = groups.find(group => group.id === id) || { name: id }

  return group.name
}
