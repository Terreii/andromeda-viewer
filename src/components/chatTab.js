import { useCallback, useMemo } from 'react'
import { Tab } from 'reakit/Tab'

import { selectAvatarNameById, getNameString } from '../bundles/names'
import { useSelector } from '../hooks/store'

import { IMChatType } from '../types/chat'

export default function ChatTab ({ tab, id, chat, isActive }) {
  const type = chat.type
  const chatName = chat.name
  const target = chat.target

  const name = useSelector(useCallback(
    state => {
      if (type === IMChatType.personal) {
        return selectAvatarNameById(state, target)
      }
    },
    [type, target]
  ))

  const nameString = useMemo(() => {
    if (name == null) {
      return chatName || id
    }
    return getNameString(name)
  }, [name, id, chatName])

  return (
    <Tab
      {...tab}
      id={id}
      className={'flex-auto px-4 py-2 mt-px -mb-px bg-white border-b border-black rounded-t ' +
        'focus:ring focus:outline-none ' +
        (isActive ? 'border' : '')}
    >
      {nameString}
    </Tab>
  )
}
