/*
 * Displays all Chats (local-chat and IMs)
 */

import React from 'react'
import Tabs, { TabPane } from 'rc-tabs'
import TabContent from 'rc-tabs/lib/TabContent'
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar'

import ChatDialog from './chatDialog'
import FriendsList from './friendsList'
import GroupsList from './groupsList'
import NotificationsContainer from '../containers/notificationsContainer'

import { IMChatType, IMDialog } from '../types/chat'

import 'rc-tabs/assets/index.css'
import './chatBox.css'

const Notifications = React.memo(NotificationsContainer)

export default function ChatBox (props) {
  const names = props.names

  const panels = props.IMs.map(chat => {
    const id = chat.chatUUID
    const target = chat.target
    const type = chat.type
    const name = type === IMChatType.personal
      ? (target in names ? names[target].getName() : chat.name)
      : chat.name

    return <TabPane tab={name} key={id}>
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
    </TabPane>
  })

  return <Tabs
    activeKey={props.activeTab}
    onChange={props.changeTab}
    renderTabBar={() => <ScrollableInkTabBar />}
    renderTabContent={() => <TabContent />}
  >
    <TabPane tab='Friends' key='friends'>
      <FriendsList
        names={names}
        friends={props.friends}
        startNewIMChat={props.startNewIMChat}
        updateRights={props.updateRights}
      />
    </TabPane>

    <TabPane tab='Groups' key='groups'>
      <GroupsList
        groups={props.groups}
        startNewIMChat={props.startNewIMChat}
      />
    </TabPane>

    {props.shouldDisplayNotifications && <TabPane
      tab='Notifications'
      key='notifications'
    >
      <Notifications />
    </TabPane>}

    <TabPane tab='Local' key='local'>
      <ChatDialog
        data={props.localChat}
        names={names}
        sendTo={props.sendLocalChatMessage}
      />
    </TabPane>

    {panels}
  </Tabs>
}
ChatBox.displayName = 'ChatBox'
