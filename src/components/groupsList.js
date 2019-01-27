import React from 'react'
import styled from 'styled-components'

import chatBubble from '../icons/chat_bubble.svg'

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
  padding: 0.2em;
  border-radius: 0.2em;

  &:nth-child(even) {
    background-color: rgb(173, 173, 173);
  }
`

const NameCell = styled.div`
  flex: auto;
`

const ListItemButton = styled.button`
  flex: 20px 0 0;
  border: 0px;
  background: rgba(0, 0, 0, 0);
`

function GroupRow ({ group, startNewIMChat }) {
  const name = group.get('name')

  return <ListItem>
    <NameCell>{name}</NameCell>
    <ListItemButton
      onClick={event => {
        event.preventDefault()
        startNewIMChat(15, group.get('id'), name, true)
        // TODO: switch to tap
        // .then(chatUUID => console.log(`activate group chat ${name} ${chatUUID}`))
      }}>
      <img src={chatBubble} height='20' width='20' alt={`Start new chat with ${name}`} />
    </ListItemButton>
  </ListItem>
}

export default function GroupsList ({ groups, startNewIMChat }) {
  return <Outer>
    <ListTitle>Groups</ListTitle>
    <List>
      {groups.map(group => <GroupRow
        key={group.get('id')}
        group={group}
        startNewIMChat={startNewIMChat}
      />)}
    </List>
  </Outer>
}
