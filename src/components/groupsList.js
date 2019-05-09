import React from 'react'

import styles from './friendsAndGroupsList.module.css'
import chatBubble from '../icons/chat_bubble.svg'

function GroupRow ({ group, startNewIMChat }) {
  const name = group.name

  return <li className={styles.Item}>
    <div className={styles.Name}>{name}</div>
    <button
      className={styles.ListItemInput}
      onClick={event => {
        event.preventDefault()
        startNewIMChat(15, group.id, name, true)
        // TODO: switch to tap
        // .then(chatUUID => console.log(`activate group chat ${name} ${chatUUID}`))
      }}>
      <img src={chatBubble} height='20' width='20' alt={`Start new chat with ${name}`} />
    </button>
  </li>
}

export default function GroupsList ({ groups, startNewIMChat }) {
  return <main className={styles.Container}>
    <h3 className={styles.Title}>Groups</h3>
    <ul className={styles.List}>
      {groups.map(group => <GroupRow
        key={group.id}
        group={group}
        startNewIMChat={startNewIMChat}
      />)}
    </ul>
  </main>
}
