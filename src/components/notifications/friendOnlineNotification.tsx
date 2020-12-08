import { Container, ComponentArguments, ButtonsRow } from './utils'
import Name from '../name'

import { FriendOnlineStateChangeNotification } from '../../types/chat'

export default function TextNotificationComponent (
  { data, onClose }: ComponentArguments<FriendOnlineStateChangeNotification>
) {
  const stateText = data.online ? 'online' : 'offline'

  return (
    <Container title={`Friend went ${stateText}`}>
      <p>
        <Name id={data.friendId} />
        {` is ${stateText}`}
      </p>

      <ButtonsRow>
        <button className='btn btn--primary' onClick={onClose}>
          OK
        </button>
      </ButtonsRow>
    </Container>
  )
}
