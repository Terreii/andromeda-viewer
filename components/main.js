'use strict'

import React from 'react'
import ReactDom from 'react-dom'
import {Container} from 'flux/utils'

import IMStore from '../stores/IMStore'
import localChatStore from '../stores/localChatStore'
import nameStore from '../stores/nameStore'

import {getAvatarName, getMessageOfTheDay, logout} from '../session'
import ChatBox from './chatBox'
import style from './main.css'

class App extends React.Component {
  render () {
    const name = getAvatarName()
    const messageOfTheDay = getMessageOfTheDay()
    const messageOfTheDayIndex = messageOfTheDay.search('http')
    const messageOfTheDayLink = messageOfTheDay.substr(messageOfTheDayIndex)
    const messageOfTheDayText = messageOfTheDay.substr(0, messageOfTheDayIndex)

    return (<div className={style.main}>
      <div id='menuBar' className={style.menuBar}>
        <span>Hello {name.getName()}</span>
        <span>
          Message of the day:
          {messageOfTheDayText}
          <a
            href={messageOfTheDayLink}
            target='_blank'
            className={style.daylyMessageLink}
            >
            {messageOfTheDayLink}
          </a>
        </span>
        <a href='#' className={style.logout} onClick={logout}>logout</a>
      </div>
      <ChatBox />
    </div>)
  }
}
App.getStores = function getStores () {
  return [
    IMStore,
    localChatStore,
    nameStore
  ]
}
App.calculateState = function calculateState () {
  return {
    chatIM: IMStore.getChat(),
    localChat: localChatStore.getMessages(),
    names: nameStore.getNames()
  }
}

const AppContainer = Container.create(App)

export default function login () {
  const renderDiv = document.querySelector('#login')
  renderDiv.id = 'app'

  ReactDom.render(<AppContainer />, renderDiv)
}
