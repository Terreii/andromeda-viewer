import { useSelector } from 'react-redux'

import { IMChatType } from '../types/chat'

import { selectGroups } from '../bundles/groups'

import chatBubble from '../icons/chat_bubble.svg'

function GroupRow ({ group, startNewIMChat }) {
  const name = group.name

  return (
    <li className='flex flex-row items-center p-1 rounded even:bg-gray-400'>
      <div className='flex-auto'>{name}</div>
      <button
        type='button'
        className='rounded focus:outline-none focus:shadow-outline'
        onClick={event => { startNewIMChat(IMChatType.group, group.id, name) }}
      >
        <img src={chatBubble} height='20' width='20' alt={`Start new chat with ${name}`} />
      </button>
    </li>
  )
}

export default function GroupsList ({ startNewIMChat }) {
  const groups = useSelector(selectGroups)

  return (
    <main
      className='p-4 mt-1 overflow-y-scroll focus:shadow-outline focus:outline-none'
      tabIndex='0'
      aria-label='Groups'
    >
      <ul className='max-w-xl pl-4 mx-auto list-none'>
        {groups.map(group => (
          <GroupRow
            key={group.id}
            group={group}
            startNewIMChat={startNewIMChat}
          />
        ))}
      </ul>
    </main>
  )
}
