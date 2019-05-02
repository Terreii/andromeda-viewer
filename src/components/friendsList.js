import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import chatBubble from '../icons/chat_bubble.svg'

/*
 * A List of Friends
 * Does start a new IM-Chat
 */

const Outer = styled.main`
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
  padding: 0.2em;
  border-radius: 0.2em;

  &:nth-child(even) {
    background-color: rgb(173, 173, 173);
  }
`

const NameCell = styled.div`
  flex: auto;
`

const ListItemInput = styled.input`
  flex: 20px 0 0;
  border: 0px;
  background: none;
`

const ListItemButton = ListItemInput.withComponent('button')

const SkipContent = styled.a`
  display: block;
  position: absolute;
  left: -999px;
  top: -999px;

  &:focus {
    position: static;
    padding: 3px;
    background: #ffc;
    border:1px solid #900;
  }
`

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

      const ele = <ListItemInput
        key={`friend-${friend.id}-${key}-${rightName}`}
        type='checkbox'
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

  return <ListItem id={'friends_list_' + friend.id}>
    <NameCell>{name}</NameCell>
    <SkipContent href={skipLink}>{`Skip ${name}`}</SkipContent>
    <ListItemButton
      onClick={event => {
        event.preventDefault()
        startNewIMChat(0, friend.id, name, true)
          .then(chatUUID => console.log(chatUUID)) // TODO: switch to tap
      }}>
      <img src={chatBubble} height='20' width='20' alt={`Start new chat with ${name}`} />
    </ListItemButton>
    {rights}
  </ListItem>
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

  return <Outer>
    <ListTitle>Friends</ListTitle>
    <List>{list}</List>
    <div id='skip-friends-list-content' />
  </Outer>
}

FriendsList.displayName = 'FriendsList'

FriendsList.propTypes = {
  names: PropTypes.object.isRequired,
  friends: PropTypes.arrayOf(PropTypes.object).isRequired
}
