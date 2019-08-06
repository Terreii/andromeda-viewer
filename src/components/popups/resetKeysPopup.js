import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import Popup from './popup'
import { Button } from '../formElements'

import keepItSecret from '../../icons/keepitsecret.png'

const Container = styled.form`
  display: flex;
  flex-direction: column;
  text-align: center;
`

const Text = styled.p`
  line-height: 1.5;
`

const KeysList = styled.ul`
  font-family: monospace;
  list-style: none;
  padding: 0px;

  & > li {
    line-height: 2;

    & > span {
      padding: .3em;
      background-color: rgba(0, 0, 0, .1);
      border-radius: .3em;
    }
  }
`

const DownloadLink = styled(Button)`
  display: block;
  text-decoration: none;
  margin-bottom: 1em;
`

const GandalfImg = styled.img`
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 1em;
`

export default function ResetKeysPopup ({ resetKeys, onClose }) {
  const [fileURL, setFileURL] = useState('')
  useEffect(() => {
    const blob = new window.Blob(
      resetKeys.map(key => key + '\r\n'),
      { type: 'text/plain' }
    )
    const objURL = window.URL.createObjectURL(blob)

    setFileURL(objURL)
    return () => {
      window.URL.revokeObjectURL(objURL)
    }
  }, [resetKeys])

  return <Popup title='Password reset keys' onClose={onClose}>
    <Container>
      <Text>
        Those are your <b>encryption reset-keys</b>.<br />
        You need them, when you did forget your encryption-password!<br />
        <b>Please save them!</b><br />
        <b>Save them some where secure!</b><br />
        There is no other way to get your data back!
      </Text>

      <KeysList>
        {resetKeys.map((key, index) => <li key={`reset-key-${index}`}>
          <span>{key}</span>
        </li>)}
      </KeysList>

      <p>You can also download them:</p>

      <DownloadLink
        className='primary'
        as='a'
        href={fileURL}
        download='andromeda-viewer-reset-keys.txt'
      >
        Download as a file
      </DownloadLink>

      <GandalfImg
        src={keepItSecret}
        height='200'
        width='200'
        alt='Gandalf saying: Keep it secret, keep it safe!'
      />

      <Text>
        Remember: If you lose your encryption password and the reset-keys, you lose your data!
      </Text>

      <Button className='ok' onClick={onClose}>OK, I did save them!</Button>
    </Container>
  </Popup>
}
