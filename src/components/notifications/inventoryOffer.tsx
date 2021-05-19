import { Container, ComponentArguments, ButtonsRow } from './utils'
import Name from '../name'
import Text from '../text'

import { acceptInventoryOffer, declineInventoryOffer } from '../../actions/inventory'

import { useDispatch } from '../../hooks/store'

import { InventoryOfferedNotification } from '../../types/chat'
import { getItemTypeName } from '../../types/inventory'

export default function InventoryOffer (
  { data, onClose }: ComponentArguments<InventoryOfferedNotification>
) {
  const dispatch = useDispatch()

  const doAccept = () => {
    dispatch(acceptInventoryOffer(
      data.fromId,
      data.item.transactionId,
      data.item.type,
      false,
      data.fromObject
    ))
    onClose()
  }
  const doDecline = () => {
    dispatch(declineInventoryOffer(data.fromId, data.item.transactionId, false, data.fromObject))
    onClose()
  }

  const itemTypeName = getItemTypeName(data.item.type)
  const a = ['a', 'e', 'i', 'o', 'u'].includes(itemTypeName.charAt(0).toLowerCase()) ? 'an' : 'a'
  const titleText = ` did offer you ${a} ${itemTypeName} item.`

  return (
    <Container title={<span><Name id={data.fromId} />{titleText}</span>}>
      <p>
        <Text text={data.text} multiline />
      </p>

      <ButtonsRow>
        <button className='btn btn--ok' onClick={doAccept}>
          Accept
        </button>

        <button className='btn btn--danger' onClick={doDecline}>
          Decline
        </button>
      </ButtonsRow>
    </Container>
  )
}
