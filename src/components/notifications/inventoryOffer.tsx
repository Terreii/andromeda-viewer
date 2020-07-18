import React from 'react'
import { useDispatch } from 'react-redux'

import { Container, ComponentArguments } from './utils'
import Text from '../text'

import { acceptInventoryOffer, declineInventoryOffer } from '../../actions/inventory'

import { useName } from '../../hooks/names'

import { InventoryOfferedNotification } from '../../types/chat'
import { getItemTypeName } from '../../types/inventory'

import styles from './notifications.module.css'

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

  const name = useName(data.fromId)

  return (
    <Container title={`${name} did offer you ${a} ${itemTypeName} item.`}>
      <p>
        <Text text={data.text} multiline />
      </p>

      <div className={styles.ButtonsRow}>
        <button className='btn btn--ok' onClick={doAccept}>
          Accept
        </button>

        <button className='btn btn--danger' onClick={doDecline}>
          Decline
        </button>
      </div>
    </Container>
  )
}
