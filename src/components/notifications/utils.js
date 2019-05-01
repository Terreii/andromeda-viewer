import React from 'react'
import styled from 'styled-components'

export const NotificationBorder = styled.div`
  border-radius: 5px;
  background-color: lightgrey;
  padding: 1em;
`

export const ButtonsRow = styled.div`
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

const TextBlock = styled.p`
  line-height: 1.5;
`

export function Text ({ text }) {
  return <TextBlock>
    {text.split('\n').flatMap((line, index) => index === 0
      ? line
      : [<br key={'br_' + index} />, line]
    )}
  </TextBlock>
}
