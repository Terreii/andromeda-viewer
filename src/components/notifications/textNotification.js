import React from 'react'
import styled from 'styled-components'

import { Button } from '../formElements'

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

export default function TextNotification ({ data, onCancel }) {
  return <NotificationBorder>
    <Text>
      {data.text.split('\n').flatMap((line, index) => index === 0
        ? line
        : [<br key={'br_' + index} />, line]
      )}
    </Text>

    <ButtonsRow>
      <Button className='primary' onClick={() => { onCancel(data.id) }}>
        OK
      </Button>
    </ButtonsRow>
  </NotificationBorder>
}
