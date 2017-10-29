'use strict'

import React from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'

import { getName } from '../actions/friends'

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

export default class FriendsList extends React.Component {
  render () {
    const list = this.props.friends.map((friend, index) => {
      const id = friend.get('id')
      const hasName = this.props.names.has(id)
      const name = hasName ? this.props.names.get(id).getName() : id
      if (!hasName) {
        getName(id)
      }
      const rights = []
      ;['rightsGiven', 'rightsHas'].forEach(key => {
        const rightsMap = friend.get(key)
        ;['canSeeOnline', 'canSeeOnMap', 'canModifyObjects'].forEach(prop => {
          if (key === 'rightsHas' && prop === 'canSeeOnline') {
            return // Indicator that you can see friends online state isn't
            // there in the official viewer
          }
          const ele = (<input
            className={style.RightsCheckbox}
            type='checkbox'
            readOnly // TODO: how to change rights
            disabled={true || key === 'rightsHas'} // the rights friend has given me
            checked={rightsMap.get(prop)}
            title={titles[key][prop]}
            data-friend-id={id}
            data-right-name={prop}
            key={`friend-${id}-${key}-${prop}`}
          />)
          rights.push(ele)
        })
      })
      return (<li className={style.ListItem} key={'friendListIndex' + index}>
        <div>{name}</div>
        {rights}
      </li>)
    })
    return (<div className={style.Outer}>
      <div className={style.Title}>Friends</div>
      <ul className={style.List}>{list}</ul>
    </div>)
  }
}

FriendsList.displayName = 'FriendsList'

FriendsList.propTypes = {
  names: PropTypes.instanceOf(Immutable.Map).isRequired,
  friends: PropTypes.instanceOf(Immutable.List).isRequired
}
