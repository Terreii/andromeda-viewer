import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { login, logout, userWasKicked, LoginAction } from './session'

import { getValueOf, getStringValueOf } from '../network/msgGetters'

import { RootState } from '../store/configureStore'
import { Maturity, parseMaturity } from '../types/viewer'

function getInitialState () {
  return {
    position: [0, 0, 0] as number[],
    lookAt: [0, 0, 0] as number[],

    region: {
      id: '', // UUID
      position: { x: 0, y: 0 },
      estateID: 0,
      parentEstateID: 0,
      flags: 0, // TODO: change to BigInt
      handle: [0, 0], // TODO: change to BigInt
      access: Maturity.General,
      maxAgents: 0,
      hardMaxAgents: 0,
      billableFactor: 0,
      objectBonusFactor: 0,
      maxObjects: 100,
      waterHeight: 0,
      terrainRaiseLimit: 0,
      terrainLowerLimit: 0,
      pricePerMeter: 0,
      redirectGrid: { x: 0, y: 0 },
      useEstateSun: true,
      sunHour: 0
    },

    sim: {
      name: '',
      ip: '',
      port: 0,
      access: 0,
      seedCapability: '', // URL
      eventQueueGetUrl: '', // URL
      product: {
        name: '',
        SKU: ''
      }
    },
    circuitCode: 0
  }
}

const regionSlice = createSlice({
  name: 'region',

  initialState: getInitialState(),

  reducers: {},

  extraReducers: {
    [login.type] (state, action: PayloadAction<LoginAction>) {
      state.position = []
      state.lookAt = JSON.parse(action.payload.sessionInfo.look_at.replace(/r/gi, '')) as number[]

      state.region.position.x = action.payload.sessionInfo.region_x
      state.region.position.y = action.payload.sessionInfo.region_y

      state.sim.ip = action.payload.sessionInfo.sim_ip
      state.sim.port = action.payload.sessionInfo.sim_port
      state.sim.seedCapability = action.payload.sessionInfo.seed_capability
      state.circuitCode = action.payload.sessionInfo.circuit_code

      state.region.access = parseMaturity(action.payload.sessionInfo.agent_region_access)
    },

    RegionHandshake (state, action: any) {
      state.region.id = action.regionID
      state.region.flags = action.flags
    },

    'udp/AgentMovementComplete' (state, action: any) {
      state.position = getValueOf(action, 'Data', 'Position') as number[]
      state.lookAt = getValueOf(action, 'Data', 'LookAt') as number[]
      state.region.handle = getValueOf(action, 'Data', 'RegionHandle') as number[]
    },

    'udp/RegionInfo' (state, action: any) {
      // TODO: EstateID, ParentEstateID
      state.sim.name = getStringValueOf(action, 'RegionInfo', 0, 'SimName') as string
      state.sim.access = getValueOf(action, 'RegionInfo', 0, 'SimAccess') as number
      state.sim.product.name = getStringValueOf(action, 'RegionInfo2', 0, 'ProductName') as string
      state.sim.product.SKU = getStringValueOf(action, 'RegionInfo2', 0, 'ProductSKU') as string

      // TODO use RegionInfo3/RegionFlagsExtended
      state.region.flags = getValueOf(action, 'RegionInfo', 0, 'RegionFlags') as number
      state.region.maxAgents = getValueOf(action, 'RegionInfo2', 0, 'MaxAgents32') as number
      state.region.hardMaxAgents = getValueOf(action, 'RegionInfo2', 0, 'HardMaxAgents') as number
      state.region.billableFactor = getValueOf(action, 'RegionInfo', 0, 'BillableFactor') as number
      state.region.objectBonusFactor =
        getValueOf(action, 'RegionInfo', 0, 'ObjectBonusFactor') as number
      state.region.maxObjects = getValueOf(action, 'RegionInfo2', 0, 'HardMaxObjects') as number
      state.region.waterHeight = getValueOf(action, 'RegionInfo', 0, 'WaterHeight') as number
      state.region.terrainRaiseLimit =
        getValueOf(action, 'RegionInfo', 0, 'TerrainRaiseLimit') as number
      state.region.terrainLowerLimit =
        getValueOf(action, 'RegionInfo', 0, 'TerrainLowerLimit') as number
      state.region.pricePerMeter = getValueOf(action, 'RegionInfo', 0, 'PricePerMeter') as number
      state.region.redirectGrid.x = getValueOf(action, 'RegionInfo', 0, 'RedirectGridX') as number
      state.region.redirectGrid.y = getValueOf(action, 'RegionInfo', 0, 'RedirectGridY') as number
      state.region.useEstateSun = getValueOf(action, 'RegionInfo', 0, 'UseEstateSun') as boolean
      state.region.sunHour = getValueOf(action, 'RegionInfo', 0, 'SunHour') as number
    },

    SeedCapabilitiesLoaded (state, action: any) {
      state.sim.eventQueueGetUrl = action.capabilities.EventQueueGet
    },

    [logout.type] () {
      return getInitialState()
    },
    [userWasKicked.type] () {
      return getInitialState()
    }
  }
})

export default regionSlice.reducer

export const selectRegionId = (state: RootState): string => state.region.region.id

export const selectParentEstateID = (state: RootState): number => state.region.region.parentEstateID

export const selectPosition = (state: RootState): number[] => state.region.position

export const selectEventQueueGetUrl = (state: RootState): string =>
  state.region.sim.eventQueueGetUrl
