'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

import style from './FriendsList.css'

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

function FriendRow ({friend, name, onRightsChanged, startNewIMChat}) {
  const id = friend.get('id')

  const rights = []
  ;['rightsGiven', 'rightsHas'].forEach(key => {
    const rightsMap = friend.get(key)
    ;['canSeeOnline', 'canSeeOnMap', 'canModifyObjects'].forEach(rightName => {
      if (key === 'rightsHas' && rightName === 'canSeeOnline') {
        return // Indicator that you can see friends online state isn't
        // there in the official viewer
      }

      const ele = <input
        key={`friend-${id}-${key}-${rightName}`}
        className={style.ListItemElement}
        type='checkbox'
        disabled={key === 'rightsHas'} // on the rights friend has given me
        checked={rightsMap.get(rightName)}
        title={titles[key][rightName]}
        onChange={event => {
          if (event.target.disabled) return
          onRightsChanged(id, {
            [rightName]: event.target.checked
          })
        }}
      />
      rights.push(ele)
    })
  })

  return <li className={style.ListItem}>
    <div className={style.Name}>{name}</div>
    <a className={style.ListItemElement} href='#startChat' onClick={event => {
      event.preventDefault()
      startNewIMChat(0, id, name)
        .then(chatUUID => console.log(chatUUID)) // TODO: switch to tap
    }}>
      <img src='/chat_bubble.svg' height='20' width='20' alt={`Start new chat with ${name}`} />
    </a>
    {rights}
  </li>
}

export default function FriendsList ({friends, names, updateRights, startNewIMChat}) {
  const list = friends.map(friend => {
    const id = friend.get('id')
    const name = names.has(id) ? names.get(id).getDisplayName() : id
    return <FriendRow
      key={id}
      friend={friend}
      name={name}
      onRightsChanged={updateRights}
      startNewIMChat={startNewIMChat}
      />
  })

  return (<div className={style.Outer}>
    <div className={style.Title}>Friends</div>
    <ul className={style.List}>{list}</ul>
  </div>)
}

FriendsList.displayName = 'FriendsList'

FriendsList.propTypes = {
  names: PropTypes.instanceOf(Immutable.Map).isRequired,
  friends: PropTypes.instanceOf(Immutable.List).isRequired
}
