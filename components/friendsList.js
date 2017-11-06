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

function getRightsCallback (updateRights) {
  return event => {
    if (event.target.disabled) return

    const dataset = event.target.dataset
    const friendId = dataset.friendId
    const rightName = dataset.rightName

    updateRights(friendId, {
      [rightName]: event.target.checked
    })
  }
}

export default function FriendsList (props) {
  const rightsCallback = getRightsCallback(props.updateRights)

  const list = props.friends.map((friend, index) => {
    const id = friend.get('id')
    const hasName = props.names.has(id)
    const name = hasName ? props.names.get(id).getDisplayName() : id

    const rights = []
    ;['rightsGiven', 'rightsHas'].forEach(key => {
      const rightsMap = friend.get(key)
      ;['canSeeOnline', 'canSeeOnMap', 'canModifyObjects'].forEach(prop => {
        if (key === 'rightsHas' && prop === 'canSeeOnline') {
          return // Indicator that you can see friends online state isn't
          // there in the official viewer
        }

        const ele = (<input
          type='checkbox'
          disabled={key === 'rightsHas'} // on the rights friend has given me
          checked={rightsMap.get(prop)}
          title={titles[key][prop]}
          data-friend-id={id}
          data-right-name={prop}
          key={`friend-${id}-${key}-${prop}`}
          onChange={rightsCallback}
        />)
        rights.push(ele)
      })
    })

    return (<li className={style.ListItem} key={'friendListIndex' + index}>
      <div>{name}</div>
      <a href='#startChat' onClick={event => {
        event.preventDefault()
        props.startNewIMChat(0, id, name)
          .then(chatUUID => console.log(chatUUID)) // TODO: switch to tap
      }}>
        <img src='/chat_bubble.svg' height='20' width='20' alt={`Start new chat with ${name}`} />
      </a>
      {rights}
    </li>)
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
