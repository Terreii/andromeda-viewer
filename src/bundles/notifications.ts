import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit'

import { onlineStateChanged, FriendOnlineStateAction } from './friends'
import { logout, userWasKicked, selectActiveTab } from './session'

import { RootState } from '../store/configureStore'
import { Notification, NotificationTypes } from '../types/chat'

const notificationSlice = createSlice({
  name: 'notifications',

  initialState: {
    active: ((): Notification[] => [])(),
    index: 0
  },

  reducers: {
    receive (state, action: PayloadAction<Notification>) {
      state.active.push({
        ...action.payload,
        id: state.index
      })
      state.index += 1
    },

    close (state, action: PayloadAction<number>) {
      state.active = state.active.filter(notification => notification.id !== action.payload)
    }
  },

  extraReducers: {
    [onlineStateChanged.type] (state, action: FriendOnlineStateAction) {
      for (const friend of action.payload.friends) {
        if (friend.showNotification) {
          state.active.push({
            id: state.index,
            notificationType: NotificationTypes.FriendOnlineStateChange,
            friendId: friend.id,
            online: action.payload.online,
            text: ''
          })
          state.index += 1
        }
      }
    },

    [logout.type] (state) {
      state.active = []
      state.index = 0
    },

    [userWasKicked.type] (state) {
      state.active = []
      state.index = 0
    }
  }
})

export default notificationSlice.reducer

export const { receive, close } = notificationSlice.actions

export const selectNotifications = (state: RootState): Notification[] => state.notifications.active

export const selectShouldDisplayNotifications = createSelector(
  [
    selectNotifications,
    selectActiveTab
  ],
  (notifications, activeTab) => notifications.length > 0 || activeTab === 'notifications'
)
