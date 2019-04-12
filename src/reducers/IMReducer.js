/*
 * Reduces all IM-Chats and IM-Messages
 */

import Immutable from 'immutable'

function imChat (state = Immutable.Map(), action) {
  switch (action.type) {
    case 'CreateNewIMChat':
    case 'IMChatInfosLoaded':
      return state.merge({
        _id: state.has('_id') ? state.get('_id') : action._id,
        didSaveChatInfo: action.type === 'IMChatInfosLoaded',
        chatUUID: action.chatUUID,
        saveId: action.saveId,
        type: action.chatType,
        withId: action.target,
        name: action.name,
        didLoadHistory: state.get('didLoadHistory') || false,
        isLoadingHistory: state.get('isLoadingHistory') || false,
        active: state.get('active') || false,
        hasUnsavedMSG: state.get('hasUnsavedMSG') || false,
        messages: state.has('messages') ? state.get('messages') : Immutable.List()
      })

    case 'startSavingIMChatInfo':
    case 'didSaveIMChatInfo':
      if (action.chatUUIDs.includes(state.get('chatUUID'))) {
        return state.set('didSaveChatInfo', action.type === 'startSavingIMChatInfo')
      } else {
        return state
      }

    case 'ActivateIMChat':
      return state.set('active', true)

    case 'ImprovedInstantMessage':
    case 'SelfSendImprovedInstantMessage':
    case 'IM_PERSONAL_RECEIVED':
      const messages = state.has('messages') ? state.get('messages') : Immutable.List()
      return state.merge({
        messages: messages.push(Immutable.Map({
          ...action.msg,
          didSave: false
        })),
        active: true,
        hasUnsavedMSG: true
      })

    case 'IMHistoryLoaded':
      const historyMsg = action.messages.map(msg => Immutable.Map({
        ...msg,
        didSave: true
      }))
      return state.merge({
        messages: Immutable.List(historyMsg).concat(state.get('messages')),
        isLoadingHistory: false,
        didLoadHistory: action.didLoadAll
      })

    case 'StartSavingIMMessages':
      let stillHasUnsaved = false

      const newMessages = state.get('messages').withMutations(messages => {
        const thisChat = action.chats[state.get('chatUUID')]

        messages.forEach((msg, index) => {
          if (!thisChat.includes(msg.get('_id'))) {
            if (!msg.get('didSave')) {
              stillHasUnsaved = true // side effect
            }
            return
          }

          messages = messages.set(index, msg.set('didSave', true))
        })
      })

      return state.merge({
        messages: newMessages,
        hasUnsavedMSG: stillHasUnsaved
      })

    case 'didSaveIMMessages':
      return state.withMutations(oldState => {
        let stillHasUnsaved = false
        const thisChat = action.chats[oldState.get('chatUUID')]
        const didSave = thisChat.saved.reduce((all, msg) => {
          all[msg._id] = msg
          return all
        }, {})

        const newMessages = oldState.get('messages').map(msg => {
          const id = msg.get('_id')

          if (thisChat.didError.includes(id)) {
            stillHasUnsaved = true
            return msg.set('didSave', false)
          }

          if (didSave[id] != null) {
            return msg.merge(didSave[id])
          }

          if (!msg.get('didSave')) {
            stillHasUnsaved = true
          }
          return msg
        })

        oldState
          .set('messages', newMessages)
          .set('hasUnsavedMSG', stillHasUnsaved)
      })

    default:
      return state
  }
}

export default function IMReducer (state = Immutable.Map(), action) {
  switch (action.type) {
    case 'CreateNewIMChat':
    case 'ActivateIMChat':
      return state.set(action.chatUUID, imChat(state.get(action.chatUUID), action))

    case 'IMChatInfosLoaded':
      return action.chats.reduce((lastState, chat) => {
        const innerAction = Object.assign({}, chat, {
          type: action.type
        })
        const chatData = state.get(chat.chatUUID)
        const updatedChat = imChat(chatData, innerAction)

        return updatedChat === chatData
          ? lastState
          : lastState.set(chat.chatUUID, updatedChat)
      }, state)

    case 'startSavingIMChatInfo':
      return state.withMutations(oldState => {
        action.chatUUIDs.reduce((state, id) => {
          const updatedChat = imChat(state.get(id), action)
          return state.set(id, updatedChat)
        }, oldState)
      })

    case 'didSaveIMChatInfo':
      return state.withMutations(oldState => {
        action.didError.reduce((state, id) => {
          const updatedChat = imChat(state.get(id), action)
          return state.set(id, updatedChat)
        }, oldState)
      })

    case 'ImprovedInstantMessage':
    case 'SelfSendImprovedInstantMessage':
    case 'IM_PERSONAL_RECEIVED':
      // filter start/end typing
      if (action.msg.dialog === 41 || action.msg.dialog === 42) return state

      const oldChat = state.get(action.msg.chatUUID)
      const updatedChat = imChat(oldChat, action)

      return oldChat === updatedChat
        ? state
        : state.set(action.msg.chatUUID, updatedChat)

    case 'StartSavingIMMessages':
    case 'didSaveIMMessages':
      return state.withMutations(oldState => {
        Object.keys(action.chats).reduce((oldState, key) => {
          const oldChatData = oldState.get(key)
          const newChatData = imChat(oldChatData, action)
          return oldState.set(key, newChatData)
        }, oldState)
      })

    case 'IMHistoryStartLoading':
      return state.setIn([action.chatUUID, 'isLoadingHistory'], true)

    case 'IMHistoryLoaded':
      return state.set(action.chatUUID, imChat(state.get(action.chatUUID), action))

    case 'DidLogout':
    case 'UserWasKicked':
      return Immutable.Map()

    default:
      return state
  }
}
