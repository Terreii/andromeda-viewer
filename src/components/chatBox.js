/*
 * Displays all Chats (local-chat and IMs)
 */

import React, { useEffect } from 'react'
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab'

import ChatDialog from './chatDialog'
import FriendsList from './friendsList'
import GroupsList from './groupsList'
import Notifications from './notifications'

import { IMChatType, IMDialog } from '../types/chat'

import style from './chatBox.module.css'

export default function ChatBox (props) {
  const names = props.names
  const changeTab = props.changeTab

  const tab = useTabState({ selectedId: props.activeTab })
  useEffect(
    () => { changeTab(tab.selectedId) },
    [tab.selectedId, changeTab]
  )

  const tabs = []
  const tabPanels = []

  for (const chat of props.IMs) {
    const id = chat.sessionId
    const target = chat.target
    const type = chat.type
    const name = type === IMChatType.personal
      ? (target in names ? names[target].getName() : chat.name)
      : chat.name

    tabs.push(<Tab {...tab} key={`tab_${id}`} className={style.tabButton} stopId={id}>
      {name || id}
    </Tab>)

    tabPanels.push(<TabPanel
      {...tab}
      key={`panel_${id}`}
      className={style.panel}
      stopId={id}
      tabIndex='-1'
    >
      <ChatDialog
        data={chat}
        isIM
        sendTo={text => props.sendInstantMessage(
          text,
          target,
          id,
          type === IMChatType.personal ? IMDialog.MessageFromAgent : IMDialog.SessionSend
        )}
        names={names}
        type={type}
        loadHistory={props.getIMHistory}
      />
    </TabPanel>)
  }

  return (
    <div className={style.container}>
      <TabList {...tab} className={style.list} aria-label='Chats'>
        <Tab {...tab} className={style.tabButton} stopId='friends'>Friends</Tab>

        <Tab {...tab} className={style.tabButton} stopId='groups'>Groups</Tab>

        {props.shouldDisplayNotifications && <Tab
          {...tab}
          className={style.tabButton}
          stopId='notifications'
        >
          Notifications
        </Tab>}

        <Tab {...tab} className={style.tabButton} stopId='local'>Local</Tab>

        {tabs}
      </TabList>

      <TabPanel {...tab} className={style.panel} stopId='friends' tabIndex='-1'>
        <FriendsList
          names={names}
          startNewIMChat={props.startNewIMChat}
          updateRights={props.updateRights}
        />
      </TabPanel>

      <TabPanel {...tab} className={style.panel} stopId='groups' tabIndex='-1'>
        <GroupsList startNewIMChat={props.startNewIMChat} />
      </TabPanel>

      {props.shouldDisplayNotifications && <TabPanel
        {...tab}
        className={style.panel}
        stopId='notifications'
        tabIndex='-1'
      >
        <Notifications />
      </TabPanel>}

      <TabPanel {...tab} className={style.panel} stopId='local' tabIndex='-1'>
        <ChatDialog
          data={props.localChat}
          names={names}
          sendTo={props.sendLocalChatMessage}
        />
      </TabPanel>

      {tabPanels}
    </div>
  )
}
ChatBox.displayName = 'ChatBox'
