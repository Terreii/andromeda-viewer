import { Container, ComponentArguments, ButtonsRow } from './utils'
import Name from '../name'
import Text from '../text'

import { useDispatch } from '../../hooks/store'

import { acceptTeleportLure, declineTeleportLure } from '../../actions/friendsActions'

import { TeleportLure } from '../../types/chat'

export default function FriendshipOffer ({ data, onClose }: ComponentArguments<TeleportLure>) {
  const dispatch = useDispatch()

  const doAccept = () => {
    dispatch(acceptTeleportLure(data.fromId, data.lureId))
    onClose()
  }
  const doDecline = () => {
    dispatch(declineTeleportLure(data.fromId, data.lureId))
    onClose()
  }

  return (
    <Container
      title={<span><Name id={data.fromId} /> has offered to teleport you to their location.</span>}
    >
      <p>
        <Text text={data.text} multiline />
      </p>

      <ButtonsRow>
        <button className='btn btn--ok' onClick={doAccept} disabled>
          Accept (not yet implemented)
        </button>

        <button className='btn btn--danger' onClick={doDecline}>
          Decline
        </button>
      </ButtonsRow>
    </Container>
  )
}
