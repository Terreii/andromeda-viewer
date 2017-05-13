'use strict'

import React from 'react'

import { getAvatarName, getMessageOfTheDay, logout } from '../session'
import ChatBox from './chatBox'
import style from './main.css'

export default class App extends React.Component {
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
