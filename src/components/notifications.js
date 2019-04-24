import React from 'react'
import styled from 'styled-components'

import { Button } from './formElements'

const Outer = styled.main`
  padding: 1em;
`

const ListTitle = styled.div`
  font-size: 120%;
  border-bottom: 1px solid grey;
`

const Content = styled.div`
  max-width: 15cm;
  margin-top: .5em;
  margin-left: auto;
  margin-right: auto;
`

const NotificationBorder = styled.div`
  border-radius: 5px;
  background-color: lightgrey;
  padding: 1em;
`

const Text = styled.p`
  line-height: 1.5;
`

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;

  & > button {
    flex: 0 0 auto;
    min-width: 5em;
  }

  & > button + button {
    margin-left: 1.75em;
  }
`

function Notification ({ data, onClick, onCancel }) {
  let buttons = null

  switch (data.notificationType) {
    case 0:
    default:
      buttons = <Button className='primary' onClick={() => { onCancel(data.id) }}>
        OK
      </Button>
      break
  }

  return <NotificationBorder>
    <Text>
      {data.text.split('\n').flatMap((line, index) => index === 0
        ? line
        : [<br key={'br_' + index} />, line]
      )}
    </Text>

    <ButtonsRow>{buttons}</ButtonsRow>
  </NotificationBorder>
}

export default function notificationsList ({ notifications, onClick, onCancel }) {
  return <Outer>
    <ListTitle>Notifications</ListTitle>
    <Content>
      {notifications.map(notification => <Notification
        key={'notification_' + notification.id}
        data={notification}
        onClick={onClick}
        onCancel={onCancel}
      />)}
    </Content>
  </Outer>
}
