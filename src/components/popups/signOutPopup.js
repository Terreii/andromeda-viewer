import React from 'react'
import styled from 'styled-components'

import Popup from './popup'
import { Button } from '../formElements'

const ButtonsRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: .25em;

  & > button + button {
    margin-left: 1.75em;
  }
`

export default function SignOutPopup ({ onCancel, onSignOut }) {
  return <Popup title='Sign Out?' onClose={onCancel}>
    <ButtonsRow>
      <Button className='secondary' onClick={onCancel}>cancel</Button>
      <Button className='danger' onClick={onSignOut}>sign out</Button>
    </ButtonsRow>
  </Popup>
}
