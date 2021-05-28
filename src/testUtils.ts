import { diff as getObjDiff } from 'deep-object-diff'
import PouchDB from 'pouchdb-browser'
import memoryAdapter from 'pouchdb-adapter-memory'
import auth from 'pouchdb-authentication'
import hoodieApi from 'pouchdb-hoodie-api'
import { NIL } from 'uuid'

import connectCircuit from './actions/connectCircuit'
import { isSignedIn, loadSavedAvatars, loadSavedGrids } from './actions/viewerAccount'
import { signInStatus } from './bundles/account'
import { parseNameString } from './bundles/names'
import { startLogin, login } from './bundles/session'
import { createExtraArgument, createStoreCore, RootState } from './store/configureStore'

import { AssetType } from './types/inventory'

PouchDB.plugin(memoryAdapter)
PouchDB.plugin(auth)
PouchDB.plugin(hoodieApi)

let dbs: PouchDB.Database[] = []

let counter = 0
export function createUniqueDb (
  name: string,
  options?: PouchDB.MemoryAdapter.MemoryAdapterConfiguration,
  autoDestroy: boolean = true
) {
  const db = new PouchDB(name + (counter++), {
    ...(options || {}),
    adapter: 'memory'
  })
  if (autoDestroy) {
    dbs.push(db)
  }
  return db
}

beforeEach(() => {
  dbs = []
})

afterEach(async () => {
  for (const db of dbs) {
    try {
      await db.destroy()
    } catch (err) {}
  }
})

/**
 * Different states the App can be in.
 * Used to set the starting state from the TestStore.
 */
export enum AppState {
  /** Default start state. No user is logged in. */
  LoggedOff,
  /** A user is logged in, but not unlocked. */
  LoggedIn,
  /** A user is logged in and the App was unlocked */
  Unlocked,
  /** A user is logged in, App unlocked and a grid session is active */
  Connected
}

/**
 * Create a store and some helper functions for testing actions.
 *
 * It can also set the state of the Store to be one of:
 *   - Logged off - No user is logged in
 *   - Logged in  - An user is logged in, but viewer is not unlocked
 *   - Unlocked   - An user is logged in and the viewer is unlocked
 *   - Connected  - There is also an avatar "connected" to a grid
 *
 * It returns mocks for the UDP-Circuit and both fatch functions (proxy and LLSD).
 */
export async function createTestStore ({ localDB, remoteDB, state = AppState.LoggedOff }: {
  localDB?: PouchDB.Database,
  remoteDB?: PouchDB.Database,
  state?: AppState
}) {
  let isSetup = true // when the the create Databases callback is called the first time
  const extraArgument = createExtraArgument(({ local, remote }) => {
    const result: { local: PouchDB.Database | null, remote: PouchDB.Database | null } = {
      local: null,
      remote: null
    }
    if (isSetup && state === AppState.LoggedOff) {
      isSetup = false
      return {
        local: localDB ?? createUniqueDb('local'),
        remote: remoteDB ?? createUniqueDb('remote')
      }
    }

    if (local) {
      result.local = createUniqueDb('local')
    }
    if (remote) {
      result.remote = createUniqueDb('remote')
    }

    // create the session mock
    if (isSetup) {
      isSetup = false
      const getSession = jest.fn()
      getSession.mockResolvedValueOnce({
        info: {
          authenticated: 'cookie',
          authentication_db: '_users',
          authentication_handlers: ['cookie', 'default']
        },
        ok: true,
        userCtx: {
          name: null,
          roles: []
        }
      })
      result.remote!.getSession = getSession
    }
    return result
  })

  const fetchLLSDMock = jest.fn()
  ;(extraArgument as any).fetchLLSD = fetchLLSDMock

  const proxyFetchMock = jest.fn()
  ;(extraArgument as any).proxyFetch = proxyFetchMock

  // Create the actual store
  const store = createStoreCore(undefined, extraArgument)

  // Set the app state
  if (state !== AppState.LoggedOff) {
    await setStateToLoggedin(state, store, extraArgument)
  }

  // Setup the state diffing
  const initialState = store.getState()
  const states = new Map<string, RootState>()

  // Saves the current state under that key for later comparison
  const setMark = (key: string) => {
    states.set(key, store.getState())
  }

  // Get the diff from one state to another (default the current)
  const getDiff = (startKey?: string, endKey?: string) => {
    if (startKey && !states.has(startKey)) {
      throw new Error(`unknown start key '${startKey}'`)
    }
    if (endKey && !states.has(endKey)) {
      throw new Error(`unknown end key '${endKey}'`)
    }

    const oldState = startKey ? states.get(startKey)! : initialState
    const newerState = endKey ? states.get(endKey)! : store.getState()
    return getObjDiff(oldState, newerState)
  }

  return {
    store,
    cryptoStore: extraArgument.cryptoStore,
    circuit: extraArgument.circuit,
    fetchLLSD: fetchLLSDMock,
    proxyFetch: proxyFetchMock,
    setMark,
    getDiff,
    getCurrentDbs () {
      return { local: extraArgument.db, remote: extraArgument.remoteDB }
    }
  }
}

/**
 * Sets the initial state of the test-store to logged in, but not unlocked.
 */
async function setStateToLoggedin (
  state: AppState,
  store: ReturnType<typeof createStoreCore>,
  extraArgument: ReturnType<typeof createExtraArgument>
) {
  if (state === AppState.LoggedOff) return

  await extraArgument.db.put({
    _id: '_local/account',
    accountId: '6197db66-7452-47d6-bf47-85cfd71a2c71',
    name: 'tester.mactestface@example.com'
  })

  // Store the result of await extraArgument.cryptoStore.setup('testPassword')
  // This saves 450 ms for every test!
  const docs = [
    {
      _id: 'hoodiePluginCryptoStore/salt',
      hoodie: { createdAt: '2020-12-06T11:34:42.493Z' },
      salt: '89c69bef5625fde079e93a87bd2d9944',
      check: {
        tag: '94965b587cc5cb0d7d7e2893f15da622',
        data: 'f19b8ad3bceb30641e4a39797ce02f32f3cdfe82cd831b8da281c8a1724d59fbe92c601a108644b7' +
          '54444bceb5cd339658da3bea4ac92d7fbdcf7146e03353a3',
        nonce: '3c3365f2390d5ddc6ac328e0'
      }
    },
    {
      _id: 'hoodiePluginCryptoStore/pwReset_0',
      hoodie: { createdAt: '2020-12-06T11:34:42.862Z' },
      tag: '8c3a7264a1df942590b41b9911b8c76d',
      data: 'ec5d2cb356a76a521f50dfafd0f2e35cbc941a65f1089be8df4401c525342bbedb3c2c6a0dd015b43c' +
        'c87a14e84362198361456bb3b722ac092eb5105603c47ba6fb54f1e1acc4364c3a5e075f3039419d981b33' +
        'a6705e216a1b38ab2ad267164aff7f5015a62e079b425a930f0f5830daf21a8956',
      nonce: 'dc4d754483bd762a4d915241',
      salt: 'c07abfdcdb58a96781247534c058c5ff'
    },
    {
      _id: 'hoodiePluginCryptoStore/pwReset_1',
      hoodie: { createdAt: '2020-12-06T11:34:42.862Z' },
      tag: '87573943904ffedf7c2b0e54042dab98',
      data: 'ec52ca3af998a51d383e748816aaa5c302d3327cc9b47a24c3e295f593582ba9def47b141981019fb3' +
        '269ce836aa390455e4aead0afe73d502383b289144e026565d564b6b4660f33b82992f25eeed69c4b71ef6' +
        'd27714fd7d289c6449c4622f697f0a8b0b0a292d9503e790490145b5b822f2492c',
      nonce: '80dcfbbf1288027afbd33a6c',
      salt: '5888bd130d817cb749a7fc0619f34f33'
    },
    {
      _id: 'hoodiePluginCryptoStore/pwReset_2',
      hoodie: { createdAt: '2020-12-06T11:34:42.862Z' },
      tag: 'c57d6bb4e33750ef6df0c1f2bc331dab',
      data: 'fb32479e696c4ffdf5fca8da1b0b7ec8910ced82b9de25d23f9be1169ad78892f5dfb688be91a32201' +
        '459884737d5fbc9f1de6d893c59466fe1e6ff5185af711b875af1eebd02b8a1f559e72527981421eb47724' +
        '3072b1e48d02b93bf6b4b7011543e731087e58ded9680570845c4e9e2f0a60b732',
      nonce: 'a8127e2d663ff5dc04b78c2b',
      salt: 'b508fc620216dc7e60d172dfdd797c44'
    },
    {
      _id: 'hoodiePluginCryptoStore/pwReset_3',
      hoodie: { createdAt: '2020-12-06T11:34:42.862Z' },
      tag: 'cfe18dfb727169e92b9e0b363cabca64',
      data: '6dd59b7a1b5c91c62ffecc048d87d2baa59112f7d6c7bbde756c28d5c43db467455e0195a1f15883b2' +
        '5a3bd4b64f06f00c5f9ced93e73df0c7829383baf51f85576f43115ed22cba47099445f2ca79f0ed954667' +
        '2b1dcf41241967af5f5e6de5c75234a12d000db3245e813667c6d6dd0c786eff3b',
      nonce: 'e8826a1bac2f09fe04ecdf16',
      salt: 'f64ea2022deb1467808382e47b7c0312'
    },
    {
      _id: 'hoodiePluginCryptoStore/pwReset_4',
      hoodie: { createdAt: '2020-12-06T11:34:42.862Z' },
      tag: '84cb316e86104a5ed4fcc607dcc5d9c4',
      data: 'c543663ae2b70fed0017334641c27d9314266bc208f5bc721d0fea9e13687a8d2ffd4b508011c1dfc1' +
        '2c7d3da12e9c928fca3f3e3be537e38ba5de65fc0a18b26c5b7a13f2b45845929fc75d41e2dca9f534cea6' +
        '21e3a59bbb00b769f1e96821c3b46a7c39359772a850f76d4992a0e6dca8b5d6b8',
      nonce: '2b00c23f7ed4928032f29eb9',
      salt: '76a7e0751e1c41b2ba92f2ba5693949d'
    },
    {
      _id: 'hoodiePluginCryptoStore/pwReset_5',
      hoodie: { createdAt: '2020-12-06T11:34:42.862Z' },
      tag: '820762e20e50998d0d63b2745e1f276c',
      data: '6d0df0da43d64df5fefb81c48fa7adbf2f0064c314acef8152bd2532fc61b57a059e029ec5d1cd1b92' +
        'a74f354e437a14531ea5668492b3c44217312420eae0aa5d54a0cdfc339baeb7e8510856da2237f54c7ad0' +
        'edaee5970393f32c5629dc66768408ff52fcc80d7f095da209d524741487700a76',
      nonce: 'a8fafd8d4286aa7ea8fe202f',
      salt: 'e51f6c5906fe4934c8617579f6a8fc67'
    },
    {
      _id: 'hoodiePluginCryptoStore/pwReset_6',
      hoodie: { createdAt: '2020-12-06T11:34:42.862Z' },
      tag: '09e88dce11ce7f7d41601401f9293b69',
      data: '03f2a0423fdf811ebfa0caf1d19ea0826045f657c026500745731dc4667327abc0bad5f396259d7538' +
        '02875d1251a960599870344b3f76fd9d07937a87d92969572c7b46cce9a646e1e48a58e72d55e1eb98e558' +
        '855bd97c6519f2deccd7f932339b0a6d9ca2db917a7592a1c7ad8eed90afdc5b88',
      nonce: '1b863de449eba08349ed3dad',
      salt: 'ca66b8b957fa06d0cd0369e6f80ea39f'
    },
    {
      _id: 'hoodiePluginCryptoStore/pwReset_7',
      hoodie: { createdAt: '2020-12-06T11:34:42.862Z' },
      tag: '4a32ed8d12e607dfd2c591e292b081d1',
      data: 'f8aca269292d180661f84711eacfd1d6e96d955e2eb81b725e0fb576a5bf49c037421541551bb5b9f2' +
        'eebabc711b4f7087683b5a327c439da9e602a6ea266551de538d876f9acbe6a974f001564dfef10f432045' +
        '4267ba91ea54a903aa079a678a982760cfd38846581156e0c61776b1d121016292',
      nonce: 'c401e0be116532cf371f2457',
      salt: 'e5b7d7696c7b7d0f040bdc6fa0f64d3f'
    },
    {
      _id: 'hoodiePluginCryptoStore/pwReset_8',
      hoodie: { createdAt: '2020-12-06T11:34:42.862Z' },
      tag: '7db61ca821686a2109f528e8267a8112',
      data: 'b80c67c6a7d4d1b16feb3a432c8cf18d9da8165031bc9baa3a19cac2776ce5f3e482faa0dc802d652e' +
        '6713f88032e7d02baa9581eddf647f1275b2e17e2f5ce133c7ddf414f00b04ed78c3efb8482e26d9544c73' +
        '58e04d411abbfec4becf4984c2b440580c5938d16b9b54b98d841ac994967c30cb',
      nonce: '89d2593fc3ebd67152ec7b2c',
      salt: '7d97f4eb2391bd28be75c34c4a7eed8c'
    },
    {
      _id: 'hoodiePluginCryptoStore/pwReset_9',
      hoodie: { createdAt: '2020-12-06T11:34:42.862Z' },
      tag: '98df17fb27a3699a3c61fbc92731488d',
      data: '0d631f68f0a6c49de806472629d4038b0fcb5466dabd2f7bca37ba73ab3cd8ecc15d95ef961899966d' +
        '3b61d8118f49a729514be1d7bc38994f44e0a0fc0266b04df2fdc7c73a6dea74479715f01a782216ec7b5c' +
        '300bfa8aaedb67da2c83d1403265f21ef414db22c83e4d40d39fa28734cdcc0219',
      nonce: '8c12140236cfec6bc2d6a6dd',
      salt: '534544e0164096b1f084ecb5a8872679'
    }
  ]
  await extraArgument.db.bulkDocs(docs)

  await store.dispatch(isSignedIn())

  if (state !== AppState.LoggedIn) {
    await setStateToUnlocked(state, store, extraArgument)
  }
}

/**
 * Sets the initial state of the test-store to logged in and unlocked.
 *
 * This _must_ be called from `setStateToLoggedin`!
 */
async function setStateToUnlocked (
  state: AppState,
  store: ReturnType<typeof createStoreCore>,
  extraArgument: ReturnType<typeof createExtraArgument>
) {
  await extraArgument.cryptoStore.unlock('testPassword')
  store.dispatch(signInStatus(true, true, 'tester.mactestface@example.com'))

  await store.dispatch(loadSavedGrids())
  await store.dispatch(loadSavedAvatars())

  if (state !== AppState.Unlocked) {
    await setStateToConnectedToGrid(state, store, extraArgument)
  }
}

/**
 * Sets the initial state of the test-store to be "connected" to a Grid.
 *
 * Simulates an avatar logged in. It also sets up the circuit-mock.
 *
 * This _must_ be called from `setStateToUnlocked`!
 */
async function setStateToConnectedToGrid (
  state: AppState,
  store: ReturnType<typeof createStoreCore>,
  extraArgument: ReturnType<typeof createExtraArgument>
) {
  const name = parseNameString('AndromedaViewerTester')
  const grid = {
    _id: 'second_life',
    name: 'Second Life',
    loginURL: 'https://login.agni.lindenlab.com:443/cgi-bin/login.cgi',
    isLLSDLogin: true
  }
  store.dispatch(startLogin({ name, grid, sync: true }))

  store.dispatch(login({
    name,
    save: true,
    avatarIdentifier: '1ad4a264-c480-4322-a7e6-491e82450713@Second Life',
    dataSaveId: '5d14a0ae-b88c-44ed-99b0-b889db7aa700',
    grid,
    uuid: '1ad4a264-c480-4322-a7e6-491e82450713',
    sessionInfo: {
      login: 'true',
      andromedaSessionId: 'e95ecf9b-9104-4d6b-9a4d-09de71e956e8',
      first_name: `"${name.firstName}"`,
      last_name: name.lastName,
      account_type: 'Base',
      account_level_benefits: {
        lastname_change_allowed: '',
        lastname_change_rate: 168,
        lastname_change_cost: 0,
        animated_object_limit: 1,
        one_time_event_allowed: 1,
        live_chat: '',
        signup_bonus: 0,
        mainland_tier: 0,
        partner_fee: 10,
        unpartner_fee: 25,
        stored_im_limit: 15,
        marketplace_concierge_support: '',
        picks_limit: 10,
        gridwide_experience_limit: 0,
        premium_alts: 0,
        create_repeating_events: '',
        script_limit: 20,
        marketplace_listing_limit: 0,
        voice_morphing: '',
        premium_gifts: '',
        repeating_events_cost: -1,
        premium_access: '',
        animation_upload_cost: 10,
        texture_upload_cost: 10,
        mesh_upload_cost: 10,
        sound_upload_cost: 10,
        one_time_event_cost: 50,
        phone_support: '',
        transaction_history_limit: 33,
        priority_entry: '',
        marketplace_ple_limit: 0,
        linden_buy_fee: 0.99,
        attachment_limit: 38,
        beta_grid_land: '',
        use_animesh: '',
        local_experiences: 0,
        stipend: 0,
        create_group_cost: 100,
        group_membership_limit: 42,
        place_pages: {
          num_free_listings: 0,
          additional_listing_cost: 30
        }
      },
      agent_flags: 0,
      'max-agent-groups': 42,
      agent_id: '1ad4a264-c480-4322-a7e6-491e82450713',
      session_id: 'a9795ee4-a246-4314-9925-c140f9a25629',
      secure_session_id: '72295bd5-6f3d-40b1-a702-dec5ff06af78',
      start_location: 'last',
      circuit_code:  1318860113,
      sim_ip: '52.12.223.155',
      sim_port: 12345,
      region_x: 238336,
      region_y: 244736,
      look_at: '[r0.9990919999999999801,r-0.04261430000000000079,r0]',
      agent_access: 'M',
      agent_access_max: 'A',
      'buddy-list': [],
      'inventory-skeleton': [
        // TODO: get correct and full Folder skeleton as soon as the inventory is fixed.
        {
          name: 'Inventory',
          folder_id: 'b47bd021-f252-475e-bda1-a8b84debe6a0',
          type_default: AssetType.Folder,
          parent_id: NIL,
          version: 10
        },
        {
          name: 'Objects',
          folder_id: 'e1a3951e-f276-4ded-9751-a3f09986122b',
          type_default: AssetType.Object,
          parent_id: 'b47bd021-f252-475e-bda1-a8b84debe6a0',
          version: 5
        },
        {
          name: 'Notecards',
          folder_id: 'c0bb2a28-58c9-42de-841b-3e4550ba28c4',
          type_default: AssetType.Notecard,
          parent_id: 'b47bd021-f252-475e-bda1-a8b84debe6a0',
          version: 25
        }
      ],
      'inventory-root': [
        { folder_id: 'b47bd021-f252-475e-bda1-a8b84debe6a0' }
      ],
      message: 'The best tester is Tester MacTestface! https://example.com/',
      seconds_since_epoch: 1607364288,
      openid_url: 'https://id.secondlife.com/openid/webkit',
      openid_token: '123456789abcdefghijk',
      udp_blacklist: 'EnableSimulator,TeleportFinish,CrossedRegion,OpenCircuit',
      agent_region_access: 'A',
      agent_appearance_service: 'http://bake-texture.glb.agni.lindenlab.com/',
      snapshot_config_url: 'http://photos.apps.avatarsunited.com/viewer_config',
      search_token: 'kjihgfedcba9876543210',
      ao_transition: 0,
      seed_capability: 'https://simhost-0b4956d0ed798efbe.agni.secondlife.io:12043/cap/a009835e-9596-d226-0a0a-4472cfac659c',
      cof_version: 0
    },
    localChatHistory: []
  }))

  ;(extraArgument as any).circuit = new CircuitMock()
  store.dispatch(connectCircuit())
}

export class CircuitMock extends window.EventTarget {
  send = jest.fn(() => Promise.resolve())
}
