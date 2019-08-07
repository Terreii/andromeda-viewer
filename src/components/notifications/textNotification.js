import React from 'react'

import { Button } from '../formElements'
import { NotificationBorder, Text, ButtonsRow } from './utils'

import { NotificationTypes } from '../../types/chat'

export default function TextNotification ({ data, onClose }) {
  return <NotificationBorder>
    {data.notificationType === NotificationTypes.System
      ? <h4>
        System Notification
      </h4>
      : (data.fromName && <h4>{data.fromName}</h4>)
    }

    <Text text={data.text} />

    <ButtonsRow>
      <Button className='primary' onClick={() => { onClose(data.id) }}>
        OK
      </Button>
    </ButtonsRow>
  </NotificationBorder>
}
