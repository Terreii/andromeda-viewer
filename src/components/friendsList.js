import React from 'react'

import styles from './friendsAndGroupsList.module.css'
import chatBubble from '../icons/chat_bubble.svg'

/*
 * A List of Friends
 * Does start a new IM-Chat
 */
const titles = {
  rightsGiven: {
    canSeeOnline: "Friend can see when you're online",
    canSeeOnMap: 'Friend can locate you on the map',
    canModifyObjects: 'Friend can edit, delete or take objects'
  },
  rightsHas: {
    canSeeOnline: 'You can see when they are online',
    canSeeOnMap: 'You can locate them on the map',
    canModifyObjects: "You can edit this friend's objects"
  }
}

function FriendRow ({ friend, name, skipLink, onRightsChanged, startNewIMChat }) {
  const rights = []
  ;['rightsGiven', 'rightsHas'].forEach(key => {
    const rightsMap = friend[key]
    ;['canSeeOnline', 'canSeeOnMap', 'canModifyObjects'].forEach(rightName => {
      if (key === 'rightsHas' && rightName === 'canSeeOnline') {
        return // Indicator that you can see friends online state isn't
        // there in the official viewer
      }

      const ele = <input
        key={`friend-${friend.id}-${key}-${rightName}`}
        type='checkbox'
        className={styles.ListItemInput}
        disabled={key === 'rightsHas'} // on the rights friend has given me
        checked={rightsMap[rightName]}
        title={titles[key][rightName]}
        aria-label={titles[key][rightName]}
        onChange={event => {
          if (event.target.disabled || key === 'rightsHas') return
          onRightsChanged(friend.id, {
            [rightName]: event.target.checked
          })
        }}
      />
      rights.push(ele)
    })
  })

  return <li id={'friends_list_' + friend.id} className={styles.Item}>
    <div className={styles.Name}>{name}</div>
    <a className={styles.SkipToContentLink} href={skipLink}>{`Skip ${name}`}</a>
    <button
      className={styles.ListItemInput}
      onClick={event => {
        event.preventDefault()
        startNewIMChat(0, friend.id, name, true)
          .then(chatUUID => console.log(chatUUID)) // TODO: switch to tap
      }}>
      <img src={chatBubble} height='20' width='20' alt={`Start new chat with ${name}`} />
    </button>
    {rights}
  </li>
}

export default function FriendsList ({ friends, names, updateRights, startNewIMChat }) {
  const list = friends.map((friend, index, all) => {
    const name = friend.id in names ? names[friend.id].getDisplayName() : friend.id

    return <FriendRow
      key={friend.id}
      skipLink={index + 1 < all.length
        ? '#friends_list_' + all[index + 1].id
        : '#skip-friends-list-content'}
      friend={friend}
      name={name}
      onRightsChanged={updateRights}
      startNewIMChat={startNewIMChat}
    />
  })

  return <main className={styles.Container}>
    <h3 className={styles.Title}>Friends</h3>
    <ul className={styles.List}>{list}</ul>
    <div id='skip-friends-list-content' />
  </main>
}
