import React, { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Tab } from 'reakit/Tab'

import { selectAvatarNameById } from '../bundles/names'

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
    return name.getName()
  }, [name, id, chatName])

  return (
    <Tab
      {...tab}
      id={id}
      className={'flex-auto px-4 py-2 mt-px -mb-px bg-white border-b border-black rounded-t ' +
        'focus:shadow-outline focus:outline-none ' +
        (isActive ? 'border' : '')}
    >
      {nameString}
    </Tab>
  )
}
