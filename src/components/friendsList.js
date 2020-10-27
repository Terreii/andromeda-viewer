import { useSelector, useDispatch } from 'react-redux'

import { IMChatType } from '../types/chat'

import { updateRights } from '../actions/friendsActions'
import { selectFriends } from '../bundles/friends'
import { selectNames } from '../bundles/names'
import Name from './name'

import chatBubble from '../icons/chat_bubble.svg'

/*
 * A List of Friends
 * Does start a new IM-Chat
 */
const titles = {
  rightsGiven: {
    canSeeOnline: "Friend can see when you're online",
    canSeeOnMap: 'Friend can locate you on the map',
    canModifyObjects: 'Friend can edit, delete or take objects'
  },
  rightsHas: {
    canSeeOnline: 'You can see when they are online',
    canSeeOnMap: 'You can locate them on the map',
    canModifyObjects: "You can edit this friend's objects"
  }
}

function FriendRow ({ friend, name, skipLink, onRightsChanged, startNewIMChat }) {
  const rights = []
  ;['rightsGiven', 'rightsHas'].forEach(key => {
    const rightsMap = friend[key]
    ;['canSeeOnline', 'canSeeOnMap', 'canModifyObjects'].forEach(rightName => {
      if (key === 'rightsHas' && rightName === 'canSeeOnline') {
        return // Indicator that you can see friends online state isn't
        // there in the official viewer
      }

      rights.push(
        <input
          key={`friend-${friend.id}-${key}-${rightName}`}
          type='checkbox'
          className='m-1 form-checkbox'
          disabled={key === 'rightsHas'} // on the rights friend has given me
          checked={rightsMap[rightName]}
          title={titles[key][rightName]}
          aria-label={titles[key][rightName]}
          onChange={event => {
            if (event.target.disabled || key === 'rightsHas') return
            onRightsChanged(rightName, event.target.checked)
          }}
        />
      )
    })
  })

  return (
    <li
      id={'friends_list_' + friend.id}
      className='flex flex-row items-center p-1 rounded even:bg-gray-400'
    >
      <div
        id={`online_status_${friend.id}`}
        aria-label={friend.online ? 'online' : 'offline'}
        title={friend.online ? 'online' : 'offline'}
        className={`w-2 h-2 my-auto mr-1 border rounded-full ${friend.online
          ? 'bg-green-400 border-green-400'
          : 'border-black'
        }`}
      />

      <Name
        id={friend.id}
        className='flex-auto block'
        aria-labelledby={`online_status_${friend.id}`}
      />

      <a className='sr-only' href={skipLink}>{`Skip ${name}`}</a>

      <button
        type='button'
        className='m-1 rounded focus:outline-none focus:shadow-outline'
        onClick={event => { startNewIMChat(IMChatType.personal, friend.id, name) }}
      >
        <img src={chatBubble} height='20' width='20' alt={`Start new chat with ${name}`} />
      </button>
      {rights}
    </li>
  )
}

export default function FriendsList ({ startNewIMChat }) {
  const dispatch = useDispatch()
  const friends = useSelector(selectFriends)
  const names = useSelector(selectNames)

  return (
    <main
      className='p-4 mt-1 overflow-y-scroll focus:shadow-outline focus:outline-none'
      tabIndex='0'
      aria-label='Friends'
    >
      <ul className='max-w-xl pl-4 mx-auto list-none'>
        {friends.map((friend, index, all) => {
          const name = friend.id in names ? names[friend.id].getName() : friend.id

          return (
            <FriendRow
              key={friend.id}
              skipLink={index + 1 < all.length
                ? '#friends_list_' + all[index + 1].id
                : '#skip-friends-list-content'}
              friend={friend}
              name={name}
              onRightsChanged={(rightName, nextValue) => {
                dispatch(updateRights(friend.id, {
                  [rightName]: nextValue
                }))
              }}
              startNewIMChat={startNewIMChat}
            />
          )
        })}
      </ul>
      <div id='skip-friends-list-content' />
    </main>
  )
}
