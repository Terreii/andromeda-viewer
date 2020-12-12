// Reducer for general session info.

import { createSlice, createSelector, PayloadAction, Action } from '@reduxjs/toolkit'

import { selectIsSignedIn, selectSavedAvatars, selectAnonymAvatarData } from './account'
import AvatarName from '../avatarName'

import { LocalChatMessage } from '../types/chat'
import { Grid, Maturity, MaturityString, parseMaturity } from '../types/viewer'

const sessionSlice = createSlice({
  name: 'session',

  initialState: getDefaultState(),

  reducers: {
    startLogin (state, action: PayloadAction<{ name: AvatarName, grid: Grid, sync: boolean }>) {},

    // didLogin
    login (state, action: PayloadAction<LoginAction>) {
      state.avatarIdentifier = action.payload.avatarIdentifier
      state.activeChatTab = 'tab_local'
      state.error = null
      state.sync = action.payload.save
      state.andromedaSessionId = action.payload.sessionInfo.andromedaSessionId

      state.agentFlags = action.payload.sessionInfo.agent_flags
      state.maxGroups = action.payload.sessionInfo['max-agent-groups']

      state.agentId = action.payload.sessionInfo.agent_id
      state.sessionId = action.payload.sessionInfo.session_id
      state.secureSessionId = action.payload.sessionInfo.secure_session_id
      state.startLocation = action.payload.sessionInfo.start_location

      state.agentAccess = parseMaturity(action.payload.sessionInfo.agent_access)
      state.agentAccessMax = parseMaturity(action.payload.sessionInfo.agent_access_max)

      state.openId.url = action.payload.sessionInfo.openid_url
      state.openId.token = action.payload.sessionInfo.openid_token
      state.udpBlockList = action.payload.sessionInfo.udp_blacklist.split(',')

      state.agentAppearanceService = action.payload.sessionInfo.agent_appearance_service
      state.snapshotConfigUrl = action.payload.sessionInfo.snapshot_config_url
      state.searchToken = action.payload.sessionInfo.search_token
      state.aoTransition = action.payload.sessionInfo.ao_transition

      state.secondsSinceEpoch = action.payload.sessionInfo.seconds_since_epoch
      state.cofVersion = action.payload.sessionInfo.cof_version
    },

    loginFailed (state, action: PayloadAction<{ error: string }>) {},

    closeErrorMessage (state, action: Action) {
      state.error = null
    },

    // CHAT_TAB_CHANGED
    changeChatTab (state, action: PayloadAction<string>) {
      state.activeChatTab = action.payload.startsWith('tab_')
        ? action.payload
        : 'tab_' + action.payload
    },

    startLogout: () => {},

    // DidLogout
    logout: getDefaultState,

    // UserWasKicked
    userWasKicked (_state, action: PayloadAction<{ reason: string }>) {
      const state = getDefaultState()
      state.error = action.payload.reason
      return state
    }
  }
})

export default sessionSlice.reducer

export const {
  startLogin,
  login,
  loginFailed,
  closeErrorMessage,
  changeChatTab,
  startLogout,
  logout,
  userWasKicked
} = sessionSlice.actions

// Selectors

export const selectAndromedaSessionId = (state: any): string | null =>
  state.session.andromedaSessionId

export const selectAvatarIdentifier = (state: any): string => state.session.avatarIdentifier

export const selectCurrentAvatarData = createSelector(
  [
    selectSavedAvatars,
    selectAnonymAvatarData,
    selectAvatarIdentifier
  ],
  (savedAvatars, anonymAvatarData, avatarIdentifier) => anonymAvatarData != null
    ? anonymAvatarData
    : savedAvatars.find(avatarData => avatarData.avatarIdentifier === avatarIdentifier)
)

export const selectAvatarDataSaveId = createSelector(
  [
    selectCurrentAvatarData
  ],
  avatarData => avatarData != null ? avatarData.dataSaveId : null
)

export const selectErrorMessage = (state: any): string | null => state.session.error

export const selectAgentId = (state: any): string => state.session.agentId

export const selectSessionId = (state: any): string => state.session.sessionId

export const selectIsLoggedIn = createSelector(
  [
    selectAvatarIdentifier,
    selectSessionId
  ],
  (avatarIdentifier, sessionId) => avatarIdentifier != null && sessionId != null
)

export const selectShouldSync = (state: any): boolean => state.session.sync

export const selectActiveTab = (state: any): string => state.session.activeChatTab

// checks if the chat history should be saved and synced
export const selectShouldSaveChat = createSelector(
  [
    selectShouldSync,
    selectIsSignedIn
  ],
  (sync, isSignedIn) => sync && isSignedIn
)

// Helpers

function getDefaultState () {
  return {
    avatarIdentifier: null as string | null,
    activeChatTab: 'local',
    error: null as string | null,
    sync: false,

    agentFlags: 0,
    maxGroups: 0,
    agentId: null as string | null,
    sessionId: null as string | null,
    secureSessionId: null as string | null,
    startLocation: 'last',
    agentAccess: Maturity.General,
    agentAccessMax: Maturity.General,
    secondsSinceEpoch: 0,
    andromedaSessionId: null as string | null,
    openId: {
      url: '',
      token: ''
    },
    udpBlockList: [] as string[],
    agentAppearanceService: '',
    snapshotConfigUrl: '',
    searchToken: '',
    aoTransition: 0,
    cofVersion: 0
  }
}

export interface LoginAction {
  /**
   * Name of the logged in avatar
   */
  name: AvatarName
  /**
   * Should the avatar and its data be saved and synced?
   */
  save: boolean
  /**
   * unique id of the avatar for the viewer.
   * It is the [uuid]@[gridname]
   */
  avatarIdentifier: string
  /**
   * UUID that is used as the prefix of data to store.
   */
  dataSaveId: string
  /**
   * Grid to login into.
   */
  grid: Grid
  /**
   * Avatar UUID returned from the grid.
   */
  uuid: string
  localChatHistory: LocalChatMessage[]
  /**
   * More info returned from the login process.
   */
  sessionInfo: {
    login: 'true' | 'false'
    andromedaSessionId: string,
    first_name: string
    last_name: string
    account_type: string
    account_level_benefits: AccountLevelBenefits
    agent_flags: number
    'max-agent-groups': number
    agent_id: string
    session_id: string
    secure_session_id: string
    start_location: 'last' | 'home'
    circuit_code: number
    sim_ip: string
    sim_port: number
    region_x: number
    region_y: number
    look_at: string
    agent_access: MaturityString
    agent_access_max: MaturityString
    'buddy-list': {
      buddy_id: string
      buddy_rights_given: number
      buddy_rights_has: number
    }[]
    'inventory-skeleton': {
      version: number
      name: string
      type_default: number
      parent_id: string
      folder_id: string
    }[]
    'inventory-root': { folder_id: string }[]
    message: string
    seconds_since_epoch: number
    openid_url: string
    openid_token: string
    udp_blacklist: string // 🙄
    agent_region_access: MaturityString
    agent_appearance_service: string
    snapshot_config_url: string
    search_token: string
    ao_transition: number
    seed_capability: string
    cof_version: number
  }
}

export interface AccountLevelBenefits {
  lastname_change_allowed: string
  lastname_change_rate: number
  lastname_change_cost: number
  animated_object_limit: number
  one_time_event_allowed: number
  live_chat: string
  signup_bonus: number
  mainland_tier: number
  partner_fee: number
  unpartner_fee: number
  stored_im_limit: number
  picks_limit: number
  gridwide_experience_limit: number
  premium_alts: number
  create_repeating_events: string
  script_limit: number
  voice_morphing: string
  premium_gifts: string
  repeating_events_cost: number
  premium_access: string
  animation_upload_cost: number
  texture_upload_cost: number
  mesh_upload_cost: number
  sound_upload_cost: number
  one_time_event_cost: number
  phone_support: string
  transaction_history_limit: number
  priority_entry: string
  marketplace_concierge_support: string
  marketplace_listing_limit: number
  marketplace_ple_limit: number
  linden_buy_fee: number
  attachment_limit: number
  beta_grid_land: string
  use_animesh: string
  local_experiences: number
  stipend: number
  create_group_cost: number
  group_membership_limit: number
  place_pages: {
    num_free_listings: number
    additional_listing_cost: number
  }
}
