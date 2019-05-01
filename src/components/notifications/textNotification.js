import React from 'react'

import { Button } from '../formElements'
import { NotificationBorder, Text, ButtonsRow } from './utils'

export default function TextNotification ({ data, onClose }) {
  return <NotificationBorder>
    <Text text={data.text} />

    <ButtonsRow>
      <Button className='primary' onClick={() => { onClose(data.id) }}>
        OK
      </Button>
    </ButtonsRow>
  </NotificationBorder>
}
