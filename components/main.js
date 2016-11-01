'use strict'

var React = require('react')
var ReactDom = require('react-dom')
var Container = require('flux/utils').Container

var IMStore = require('../stores/IMStore')
var localChatStore = require('../stores/localChatStore')
var nameStore = require('../stores/nameStore')

var session = require('../session')
var ChatBox = require('./chatBox')
var style = require('./main.css')

var App = React.createClass({
  render: function appRender () {
    var name = session.getAvatarName()
    var messageOfTheDay = session.getMessageOfTheDay()
    var messageOfTheDayIndex = messageOfTheDay.search('http')
    var messageOfTheDayLink = messageOfTheDay.substr(messageOfTheDayIndex)
    var messageOfTheDayText = messageOfTheDay.substr(0, messageOfTheDayIndex)

    return (<div className={style.main}>
      <div id='menuBar' className={style.menuBar}>
        <span>Hello {name.getName()}</span>
        <span>Message of the day: {messageOfTheDayText} <a href={messageOfTheDayLink} target='blank' className={style.daylyMessageLink}>{messageOfTheDayLink}</a></span>
        <a href='#' className={style.logout} onClick={session.logout}>logout</a>
      </div>
      <ChatBox />
    </div>)
  }
})
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

var AppContainer = Container.create(App)

module.exports = function () {
  var renderDiv = document.querySelector('#login')
  renderDiv.id = 'app'

  ReactDom.render(<AppContainer />, renderDiv)
}
