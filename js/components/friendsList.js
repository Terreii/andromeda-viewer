'use strict'

const React = require('react')

const nameStore = require('../stores/nameStore')
const friendsStore = require('../stores/friendsStore')
const friendsAction = require('../actions/friends')

/*
 * A List of Friends
 * Does start a new IM-Chat
 */

class FriendsList extends React.Component {
  render () {
    const list = friendsStore.getState().map((friend, index) => {
      const id = friend.get('id')
      const hasName = nameStore.hasNameOf(id)
      const name = hasName ? nameStore.getNameOf(id).getName() : id
      if (!hasName) {
        friendsAction.getName(id)
      }
      return <li key={'friendListIndex' + index}>{name}</li>
    })
    return (<div>Friends
      <ul>{list}</ul>
    </div>)
  }
}

module.exports = FriendsList
