/*
 * Displays all Chats (local-chat and IMs)
 */

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab'

import ChatDialog from './chatDialog'
import FriendsList from './friendsList'
import GroupsList from './groupsList'
import Notifications from './notifications'

import {
  sendLocalChatMessage,
  sendInstantMessage,
  startNewIMChat,
  getIMHistory
} from '../actions/chatMessageActions'

import { selectActiveIMChats } from '../bundles/imChat'
import { selectLocalChat } from '../bundles/localChat'
import { selectNames } from '../bundles/names'
import { selectShouldDisplayNotifications } from '../bundles/notifications'
import { selectActiveTab, changeChatTab } from '../bundles/session'

import { IMChatType, IMDialog } from '../types/chat'

import style from './chatBox.module.css'

export default function ChatBox () {
  const dispatch = useDispatch()
  const localChat = useSelector(selectLocalChat)
  const names = useSelector(selectNames)
  const shouldDisplayNotifications = useSelector(selectShouldDisplayNotifications)

  const tab = useTabState({ selectedId: useSelector(selectActiveTab) })
  useEffect(
    () => { dispatch(changeChatTab(tab.selectedId)) },
    [tab.selectedId, dispatch]
  )

  const doStartNewIMChat = (chatType, targetId, name) => dispatch(
    startNewIMChat(chatType, targetId, name)
  )
  const doLoadImHistory = (sessionId, chatSaveId) => dispatch(
    getIMHistory(sessionId, chatSaveId)
  )

  const tabs = []
  const tabPanels = []

  for (const chat of useSelector(selectActiveIMChats)) {
    const id = chat.sessionId
    const target = chat.target
    const type = chat.type
    const name = type === IMChatType.personal
      ? (target in names ? names[target].getName() : chat.name)
      : chat.name

    tabs.push(
      <Tab {...tab} key={`tab_${id}`} className={style.tabButton} stopId={id}>
        {name || id}
      </Tab>
    )

    tabPanels.push(
      <TabPanel
        {...tab}
        key={`panel_${id}`}
        className={style.panel}
        stopId={id}
        tabIndex='-1'
      >
        <ChatDialog
          data={chat}
          isIM
          sendTo={text => {
            dispatch(sendInstantMessage(
              text,
              target,
              id,
              type === IMChatType.personal ? IMDialog.MessageFromAgent : IMDialog.SessionSend
            ))
          }}
          names={names}
          type={type}
          loadHistory={doLoadImHistory}
        />
      </TabPanel>
    )
  }

  return (
    <div className={style.container}>
      <TabList {...tab} className={style.list} aria-label='Chats'>
        <Tab {...tab} className={style.tabButton} stopId='friends'>Friends</Tab>

        <Tab {...tab} className={style.tabButton} stopId='groups'>Groups</Tab>

        {shouldDisplayNotifications && (
          <Tab
            {...tab}
            className={style.tabButton}
            stopId='notifications'
          >
            Notifications
          </Tab>
        )}

        <Tab {...tab} className={style.tabButton} stopId='local'>Local</Tab>

        {tabs}
      </TabList>

      <TabPanel {...tab} className={style.panel} stopId='friends' tabIndex='-1'>
        <FriendsList
          names={names}
          startNewIMChat={doStartNewIMChat}
        />
      </TabPanel>

      <TabPanel {...tab} className={style.panel} stopId='groups' tabIndex='-1'>
        <GroupsList startNewIMChat={doStartNewIMChat} />
      </TabPanel>

      {shouldDisplayNotifications && (
        <TabPanel
          {...tab}
          className={style.panel}
          stopId='notifications'
          tabIndex='-1'
        >
          <Notifications />
        </TabPanel>
      )}

      <TabPanel {...tab} className={style.panel} stopId='local' tabIndex='-1'>
        <ChatDialog
          data={localChat}
          names={names}
          sendTo={text => {
            dispatch(sendLocalChatMessage(text, 1, 0))
          }}
        />
      </TabPanel>

      {tabPanels}
    </div>
  )
}
