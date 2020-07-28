/*
 * Displays all Chats (local-chat and IMs)
 */

import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useTabState, Tab, TabList, TabPanel } from 'reakit/Tab'

import ChatDialog from './chatDialog'
import ChatTab from './chatTab'
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
import { selectShouldDisplayNotifications } from '../bundles/notifications'
import { selectActiveTab, changeChatTab } from '../bundles/session'

import { IMChatType, IMDialog } from '../types/chat'

export default function ChatBox () {
  const dispatch = useDispatch()
  const shouldDisplayNotifications = useSelector(selectShouldDisplayNotifications)

  const selectedId = useSelector(selectActiveTab)
  const tab = useTabState({ selectedId })
  useEffect(
    () => { dispatch(changeChatTab(tab.selectedId)) },
    [tab.selectedId, dispatch]
  )
  const setSelectedId = tab.setSelectedId
  useEffect(() => {
    setSelectedId(selectedId)
  }, [selectedId, setSelectedId])

  const doStartNewIMChat = (chatType, targetId, name) => dispatch(
    startNewIMChat(chatType, targetId, name)
  )
  const doLoadImHistory = (sessionId, chatSaveId) => dispatch(
    getIMHistory(sessionId, chatSaveId)
  )

  const tabs = []
  const tabPanels = []

  const getIsActiveTab = ownId => tab.selectedId === ownId

  for (const chat of useSelector(selectActiveIMChats)) {
    const id = chat.sessionId
    const target = chat.target
    const type = chat.type
    const tabId = `tab_${id}`
    const isActive = getIsActiveTab(tabId)

    tabs.push(
      <ChatTab
        key={tabId}
        id={tabId}
        tab={tab}
        isActive={isActive}
        chat={chat}
      />
    )

    tabPanels.push(
      <TabPanel
        {...tab}
        key={`panel_${id}`}
        className='flex flex-col flex-auto h-screen pt-24 m-1 -mt-24'
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
          type={type}
          loadHistory={doLoadImHistory}
        />
      </TabPanel>
    )
  }

  const friendsId = 'tab_friends'
  const isFriendsTabActive = getIsActiveTab(friendsId)

  const groupsId = 'tab_groups'
  const isGroupsTabActive = getIsActiveTab(groupsId)

  const notificationsId = 'tab_notifications'
  const isNotificationsTabActive = getIsActiveTab(notificationsId)

  const localChatId = 'tab_local'
  const isLocalChatTabActive = getIsActiveTab(localChatId)

  return (
    <div className='relative flex flex-col w-screen h-screen pt-12 border-t-2 border-transparent'>
      <TabList
        {...tab}
        className='z-10 flex flex-row flex-wrap mx-2 space-x-1 border-b border-black'
        aria-label='Chats'
        aria-live='polite'
      >
        <Tab
          {...tab}
          id={friendsId}
          className={'flex-auto px-4 py-2 mt-px -mb-px bg-white border-b border-black rounded-t ' +
            'focus:shadow-outline focus:outline-none ' +
            (isFriendsTabActive ? 'border' : '')}
        >
          Friends
        </Tab>

        <Tab
          {...tab}
          id={groupsId}
          className={'flex-auto px-4 py-2 mt-px -mb-px bg-white border-b border-black rounded-t ' +
            'focus:shadow-outline focus:outline-none ' +
            (isGroupsTabActive ? 'border' : '')}
        >
          Groups
        </Tab>

        {shouldDisplayNotifications && (
          <Tab
            {...tab}
            id={notificationsId}
            className={'flex-auto px-4 py-2 mt-px -mb-px bg-white border-b border-black ' +
              'rounded-t focus:shadow-outline focus:outline-none ' +
              (isNotificationsTabActive ? 'border' : '')}
          >
            Notifications
          </Tab>
        )}

        <Tab
          {...tab}
          id={localChatId}
          className={'flex-auto px-4 py-2 mt-px -mb-px bg-white border-b border-black ' +
            'rounded-t focus:shadow-outline focus:outline-none ' +
            (isLocalChatTabActive ? 'border' : '')}
        >
          Local
        </Tab>

        {tabs}
      </TabList>

      <TabPanel
        {...tab}
        className='flex flex-col flex-auto h-screen pt-24 m-1 -mt-24'
        tabIndex={undefined}
      >
        <FriendsList startNewIMChat={doStartNewIMChat} />
      </TabPanel>

      <TabPanel
        {...tab}
        className='flex flex-col flex-auto h-screen pt-24 m-1 -mt-24'
        tabIndex={undefined}
      >
        <GroupsList startNewIMChat={doStartNewIMChat} />
      </TabPanel>

      {shouldDisplayNotifications && (
        <TabPanel
          {...tab}
          className='flex flex-col flex-auto h-screen pt-24 m-1 -mt-24'
          tabIndex={undefined}
        >
          <Notifications />
        </TabPanel>
      )}

      <TabPanel
        {...tab}
        className='flex flex-col flex-auto h-screen pt-24 m-1 -mt-24'
        tabIndex='-1'
      >
        <ChatDialog
          sendTo={text => {
            dispatch(sendLocalChatMessage(text, 1, 0))
          }}
        />
      </TabPanel>

      {tabPanels}
    </div>
  )
}
