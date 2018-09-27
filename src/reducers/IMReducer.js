/*
 * Reduces all IM-Chats and IM-Messages
 */

import Immutable from 'immutable'

function setHistory (state, action) {
  const messages = Immutable
    .fromJS(action.messages.map(msg => {
      return Object.assign({}, msg, { didSave: true })
    }))
    .concat(state.get('messages'))
  const imIds = []
  const messagesFiltered = messages.filter(msg => {
    // filter duplicate messages.
    const id = msg.get('_id')
    if (imIds.includes(id)) {
      return false
    }
    imIds.push(id)
    return true
  })
  return state.merge({
    didLoadHistory: true,
    isLoadingHistory: false,
    messages: messagesFiltered
  })
}

function IMChat (state = Immutable.Map(), action) {
  switch (action.type) {
    case 'CreateNewIMChat':
    case 'IMChatInfosLoaded':
      return state.merge({
        chatUUID: action.chatUUID,
        saveId: action.saveId,
        type: action.chatType,
        withId: action.target,
        didLoadHistory: state.get('didLoadHistory') || false,
        isLoadingHistory: state.get('isLoadingHistory') || false,
        active: true,
        hasUnsavedMSG: state.get('hasUnsavedMSG') || false,
        messages: state.has('messages') ? state.get('messages') : Immutable.List()
      })

    case 'ImprovedInstantMessage':
    case 'SelfSendImprovedInstantMessage':
      const msg = Immutable.Map({
        ...action.msg,
        didSave: false
      })
      const messages = state.has('messages') ? state.get('messages') : Immutable.List()
      const nextMessages = messages.push(msg)
      return state.merge({
        messages: nextMessages,
        hasUnsavedMSG: true
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
      return state.set(action.chatUUID, IMChat(state.get(action.chatUUID), action))

    case 'IMChatInfosLoaded':
      return action.chats.reduce((lastState, chat) => {
        const innerAction = Object.assign({}, chat, {
          type: action.type
        })
        const updatedChat = IMChat(state.get(action.chatUUID), innerAction)
        return lastState.set(chat.chatUUID, updatedChat)
      }, state)

    case 'ImprovedInstantMessage':
    case 'SelfSendImprovedInstantMessage':
      // filter start/end typing
      if (action.msg.dialog === 41 || action.msg.dialog === 42) return state
      return state.set(action.msg.chatUUID, IMChat(state.get(action.msg.chatUUID), action))

    case 'StartSavingIMMessages':
    case 'didSaveIMMessages':
      return state.withMutations(oldState => {
        Object.keys(action.chats).reduce((oldState, key) => {
          const oldChatData = oldState.get(key)
          const newChatData = IMChat(oldChatData, action)
          return oldState.set(key, newChatData)
        }, oldState)
      })

    case 'IMHistoryStartLoading':
      return state.setIn([action.chatUUID, 'isLoadingHistory'], true)

    case 'IMHistoryLoaded':
      return state.set(action.chatUUID, setHistory(state.get(action.chatUUID), action))

    case 'DidLogout':
    case 'UserWasKicked':
      return Immutable.Map()

    default:
      return state
  }
}
