import React from 'react'
import { useSelector } from 'react-redux'

import { IMChatType } from '../types/chat'

import { selectGroups } from '../bundles/groups'

import styles from './infoList.module.css'
import chatBubble from '../icons/chat_bubble.svg'

function GroupRow ({ group, startNewIMChat }) {
  const name = group.name

  return <li className={styles.Item}>
    <div className={styles.Name}>{name}</div>
    <button
      type='button'
      className={styles.ListItemInput}
      onClick={event => { startNewIMChat(IMChatType.group, group.id, name) }}
    >
      <img src={chatBubble} height='20' width='20' alt={`Start new chat with ${name}`} />
    </button>
  </li>
}

export default function GroupsList ({ startNewIMChat }) {
  const groups = useSelector(selectGroups)

  return <main className={styles.Container} aria-label='Groups'>
    <ul className={styles.List}>
      {groups.map(group => <GroupRow
        key={group.id}
        group={group}
        startNewIMChat={startNewIMChat}
      />)}
    </ul>
  </main>
}
