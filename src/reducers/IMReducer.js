/*
 * Reduces all IM-Chats and IM-Messages
 */

import { IMChatType } from '../types/chat'

function getDefaultImChat () {
  return {
    _id: null,
    sessionId: null,
    saveId: null,
    type: IMChatType.personal,
    target: null,
    name: null,

    didSaveChatInfo: false,
    didLoadHistory: false,
    isLoadingHistory: false,
    active: false,
    hasUnsavedMSG: false,
    areTyping: new Set(),
    messages: []
  }
}

function imChat (state = getDefaultImChat(), action) {
  switch (action.type) {
    case 'IM_CHAT_CREATED':
    case 'IM_CHAT_INFOS_LOADED':
      return {
        ...state,
        _id: state._id || action._id,
        didSaveChatInfo: action.type === 'IM_CHAT_INFOS_LOADED',
        sessionId: action.sessionId,
        saveId: action.saveId,
        type: action.chatType,
        target: action.target,
        name: action.name
      }

    case 'GROUP_CHAT_SESSIONS_STARTED':
      return {
        ...state,
        _id: state._id || `${action.avatarDataSaveId}/imChatsInfos/${action.saveId}`,
        sessionId: state.sessionId || action.id,
        saveId: state.saveId || action.saveId,
        type: IMChatType.group,
        target: action.id,
        name: action.name
      }

    case 'SAVING_IM_CHAT_INFO_STARTED':
    case 'SAVING_IM_CHAT_INFO_FINISHED':
      if (action.sessionIds.includes(state.sessionId)) {
        return {
          ...state,
          didSaveChatInfo: action.type === 'SAVING_IM_CHAT_INFO_STARTED'
        }
      } else {
        return state
      }

    case 'IM_CHAT_ACTIVATED':
      return {
        ...state,
        active: true
      }

    case 'PERSONAL_IM_RECEIVED':
    case 'GROUP_IM_RECEIVED':
    case 'CONFERENCE_IM_RECEIVED':
    case 'BUSY_AUTO_RESPONSE_RECEIVED':
    case 'SYSTEM_IM_RECEIVED':
      return {
        ...state,
        messages: state.messages.concat([{
          ...action.msg,
          didSave: false
        }]),
        active: true,
        hasUnsavedMSG: true
      }

    case 'IMHistoryStartLoading':
      return {
        ...state,
        isLoadingHistory: true
      }

    case 'IM_START_TYPING':
    case 'IM_STOP_TYPING':
      const newTyper = new Set(state.areTyping)

      if (action.type === 'IM_START_TYPING') {
        newTyper.add(action.agentId)
      } else {
        newTyper.delete(action.agentId)
      }

      return {
        ...state,
        areTyping: newTyper
      }

    case 'IMHistoryLoaded':
      const historyMsg = action.messages.map(msg => ({
        ...msg,
        didSave: true
      }))
      return {
        ...state,
        messages: historyMsg.concat(state.messages),
        isLoadingHistory: false,
        didLoadHistory: action.didLoadAll
      }

    case 'INSTANT_MESSAGE_START_SAVING':
      let stillHasUnsaved = false
      const thisChat = action.chats[state.sessionId]

      return {
        ...state,
        messages: state.messages.map(msg => {
          if (!thisChat.includes(msg._id)) {
            if (!msg.didSave) {
              stillHasUnsaved = true // side effect
            }
            return msg
          }

          return {
            ...msg,
            didSave: true
          }
        }),
        hasUnsavedMSG: stillHasUnsaved
      }

    case 'INSTANT_MESSAGE_DID_SAVE':
      const thisChatDidSave = action.chats[state.sessionId]
      let stillHasUnsavedAfterSave = false
      const didSave = thisChatDidSave.saved.reduce((all, msg) => {
        all[msg._id] = msg
        return all
      }, {})

      const newMessages = state.messages.map(msg => {
        // if it did error
        if (thisChatDidSave.didError.includes(msg._id)) {
          stillHasUnsavedAfterSave = true // side effect
          return {
            ...msg,
            didSave: false
          }
        }

        // did save
        if (didSave[msg._id] != null) {
          return {
            ...msg,
            ...didSave[msg._id]
          }
        }

        // didn't save yet.
        if (!msg.didSave) {
          stillHasUnsaved = true // side effect
        }

        return msg
      })

      return {
        ...state,
        messages: newMessages,
        hasUnsavedMSG: stillHasUnsavedAfterSave
      }

    default:
      return state
  }
}

export default function IMReducer (state = {}, action) {
  switch (action.type) {
    case 'IM_CHAT_CREATED':
    case 'IM_CHAT_ACTIVATED':
      return {
        ...state,
        [action.sessionId]: imChat(state[action.sessionId], action)
      }

    case 'IM_CHAT_INFOS_LOADED':
      return action.chats.reduce((state, chat) => {
        const innerAction = Object.assign({}, chat, {
          type: action.type
        })

        const updatedChat = imChat(state[chat.sessionId], innerAction)
        state[chat.sessionId] = updatedChat

        return state
      }, { ...state })

    case 'GROUP_CHAT_SESSIONS_STARTED':
      return Object.keys(action.groups).reduce((state, groupId) => {
        const chat = imChat(state[groupId], {
          ...action,
          ...action.groups[groupId]
        })
        state[groupId] = chat
        return state
      }, { ...state })

    case 'SAVING_IM_CHAT_INFO_STARTED':
      return action.sessionIds.reduce((state, id) => {
        const updatedChat = imChat(state[id], action)
        state[id] = updatedChat
        return state
      }, { ...state })

    case 'SAVING_IM_CHAT_INFO_FINISHED':
      return action.didError.length === 0
        ? state
        : action.didError.reduce((state, id) => {
          const updatedChat = imChat(state[id], action)
          state[id] = updatedChat
          return state
        }, { ...state })

    case 'PERSONAL_IM_RECEIVED':
    case 'GROUP_IM_RECEIVED':
    case 'CONFERENCE_IM_RECEIVED':
    case 'BUSY_AUTO_RESPONSE_RECEIVED':
    case 'SYSTEM_IM_RECEIVED':
      const idKey = {
        PERSONAL_IM_RECEIVED: 'sessionId',
        GROUP_IM_RECEIVED: 'groupId',
        CONFERENCE_IM_RECEIVED: 'conferenceId',
        BUSY_AUTO_RESPONSE_RECEIVED: 'sessionId',
        SYSTEM_IM_RECEIVED: 'sessionId'
      }[action.type]
      const id = action[idKey]

      const oldChat = state[id]
      const updatedChat = imChat(oldChat, action)

      return oldChat === updatedChat
        ? state
        : {
          ...state,
          [id]: updatedChat
        }

    case 'IM_START_TYPING':
    case 'IM_STOP_TYPING':
      const oldIMChatData = state[action.sessionId]
      if (oldIMChatData == null) return state

      const newIMChatData = imChat(oldIMChatData, action)
      return newIMChatData === oldIMChatData
        ? state
        : {
          ...state,
          [action.sessionId]: newIMChatData
        }

    case 'INSTANT_MESSAGE_START_SAVING':
    case 'INSTANT_MESSAGE_DID_SAVE':
      return Object.keys(action.chats).reduce((state, key) => {
        const newChatData = imChat(state[key], action)
        state[key] = newChatData
        return state
      }, { ...state })

    case 'IMHistoryStartLoading':
    case 'IMHistoryLoaded':
      return {
        ...state,
        [action.sessionId]: imChat(state[action.sessionId], action)
      }

    case 'DidLogout':
    case 'UserWasKicked':
      return {}

    default:
      return state
  }
}
