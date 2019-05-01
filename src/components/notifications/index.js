import React from 'react'
import styled from 'styled-components'

import TextNotification from './textNotification'

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

export default function notificationsList ({ notifications, onClick, onCancel }) {
  return <Outer>
    <ListTitle>Notifications</ListTitle>
    <Content>
      {notifications.map(notification => {
        switch (notification.notificationType) {
          case 0:
          default:
            return <TextNotification
              key={notification.id}
              data={notification}
              onCancel={onCancel}
            />
        }
      })}
    </Content>
  </Outer>
}
