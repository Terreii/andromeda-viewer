import React from 'react'
import PropTypes from 'prop-types'
import Immutable from 'immutable'
import styled from 'styled-components'

import chatBubble from '../icons/chat_bubble.svg'

/*
 * A List of Friends
 * Does start a new IM-Chat
 */

const Outer = styled.div`
  padding: 1em;
`

const ListTitle = styled.div`
  font-size: 120%;
  border-bottom: 1px solid grey;
`

const List = styled.ul`
  list-style: none;
  padding-left: 1em;
  max-width: 15cm;
  margin-left: auto;
  margin-right: auto;
`

const ListItem = styled.li`
  display: flex;
  flex-direction: row;

  &::nth-child(odd) {
    background-color: rgb(173, 173, 173);
  }
`

const NameCell = styled.div`
  flex: auto;
`

const ListItemInput = styled.input`
  flex: 20px 0 0;
`

const ListItemLink = ListItemInput.withComponent('a')

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

      const ele = <ListItemInput
        key={`friend-${id}-${key}-${rightName}`}
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

  return <ListItem>
    <NameCell>{name}</NameCell>
    <ListItemLink
      href='#startChat'
      onClick={event => {
        event.preventDefault()
        startNewIMChat(0, id, name)
          .then(chatUUID => console.log(chatUUID)) // TODO: switch to tap
      }}>
      <img src={chatBubble} height='20' width='20' alt={`Start new chat with ${name}`} />
    </ListItemLink>
    {rights}
  </ListItem>
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

  return <Outer>
    <ListTitle>Friends</ListTitle>
    <List>{list}</List>
  </Outer>
}

FriendsList.displayName = 'FriendsList'

FriendsList.propTypes = {
  names: PropTypes.instanceOf(Immutable.Map).isRequired,
  friends: PropTypes.instanceOf(Immutable.List).isRequired
}
