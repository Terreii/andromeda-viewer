import React from 'react'

import { Container, ComponentArguments, ButtonsRow } from './utils'
import Text from '../text'

import { useName } from '../../hooks/names'

import { LoadURLNotification } from '../../types/chat'

export default function LoadURL ({ data, onClose }: ComponentArguments<LoadURLNotification>) {
  const href = data.url.toString().replace(/^javascript:/i, '')

  const name = useName(data.fromId)

  return (
    <Container title={`${name} did send you an URL`}>
      <p>
        <Text text={data.text} multiline />
      </p>

      <div>
        <a href={href} target='_blank' rel='noopener noreferrer'>{href}</a>
      </div>

      <ButtonsRow>
        <button className='btn btn--primary' onClick={onClose}>
          OK
        </button>
      </ButtonsRow>
    </Container>
  )
}
