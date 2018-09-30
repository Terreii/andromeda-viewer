/*
 * Displays all Chats (local-chat and IMs)
 */

import React from 'react'
import Tabs, { TabPane } from 'rc-tabs'
import TabContent from 'rc-tabs/lib/TabContent'
import ScrollableInkTabBar from 'rc-tabs/lib/ScrollableInkTabBar'
import Helmet from 'react-helmet'

import ChatDialog from './chatDialog'
import FriendsList from './friendsList'
import GroupsList from './groupsList'

import 'rc-tabs/assets/index.css'

export default function ChatBox (props) {
  const names = props.names.get('names')
  const imsIds = props.IMs.keySeq().toJSON()

  const panels = imsIds.map(id => {
    const chat = props.IMs.get(id)
    const target = chat.get('withId')
    const name = names.has(target)
      ? names.get(target).getName()
      : target

    return <TabPane tab={name} key={id}>
      <ChatDialog
        data={chat}
        isIM
        sendTo={text => props.sendInstantMessage(text, target, id)}
        names={names}
        loadHistory={props.getIMHistory}
      />
    </TabPane>
  })

  return <React.Fragment>
    <Helmet aria-disabled='false'>
      <title>{props.selfName.getName()}</title>
    </Helmet>
    <Tabs
      defaultActiveKey='local'
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
        <GroupsList groups={props.groups} />
      </TabPane>

      <TabPane tab='Local' key='local'>
        <ChatDialog
          data={props.localChat}
          names={names}
          sendTo={props.sendLocalChatMessage}
        />
      </TabPane>

      {panels}
    </Tabs>
  </React.Fragment>
}
ChatBox.displayName = 'ChatBox'
