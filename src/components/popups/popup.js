import React from 'react'
import styled from 'styled-components'

import closeIcon from '../../icons/icon_close.svg'

const Background = styled.div`
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`

const CloseButton = styled.button`
  display: ${props => props.show ? '' : 'none'};
  padding: 0px;
  background: none;
  border: 0px;

  &:focus {
    outline: 2px solid highlight;
  }
`

const Border = styled.div`
  background-color: rgb(255, 250, 250);
  border-radius: 1em;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
`

const Header = styled.div`
  border-bottom: 1px solid black;
  flex: 0 0 2em;
  display: flex;
  flex-direction: row-reverse;
  justify-content: space-between;
  margin: .2em;
  margin-bottom: 0em;
`

const PopupTitle = styled.h4`
  margin-left: 1.3em;
  margin-right: 1.3em;
  margin-bottom: .3em;
  margin-top: .5em;
`

const Content = styled.div`
  margin: 1em;
  overflow-y: scroll;
`

export default function Popup (props) {
  const showCloseIcon = typeof props.onClose === 'function'

  const closeIconInHeader = showCloseIcon
    ? <CloseButton
      className='closePopup'
      show={showCloseIcon}
      onClick={event => {
        event.preventDefault()
        props.onClose()
      }}
    >
      <img src={closeIcon} alt='close popup' height='32' width='32' />
    </CloseButton>
    : <span />

  return <Background>
    <Border>
      <Header>
        {closeIconInHeader}
        <PopupTitle>{props.title}</PopupTitle>
      </Header>
      <Content>
        {props.children}
      </Content>
    </Border>
  </Background>
}
