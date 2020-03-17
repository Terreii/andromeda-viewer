import React from 'react'
import { useDispatch } from 'react-redux'

import { Container, ComponentArguments } from './utils'
import Text from '../text'

import { acceptInventoryOffer, declineInventoryOffer } from '../../actions/inventory'

import { useName, useGroupName } from '../../hooks/names'

import { GroupNoticeNotification } from '../../types/chat'
import { getItemTypeName } from '../../types/inventory'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

export default function GroupNotice (
  { data, onClose }: ComponentArguments<GroupNoticeNotification>
) {
  const dispatch = useDispatch()

  const name = useName(data.senderId) || ''
  const groupName = useGroupName(data.groupId)

  return (
    <Container title={`Group Notice from ${groupName} - ${data.title}`}>
      <small>send by {name.toString()}</small>

      <p>
        <Text text={data.text} multiline />
      </p>

      {data.item && <div>
        This notice includes item
        <b> "{data.item!.name}" </b>
        of type
        <b> {getItemTypeName(data.item!.type)}</b>
      </div>}

      <div className={styles.ButtonsRow}>
        {data.item && <button
          className={formStyles.OkButton}
          onClick={() => {
            dispatch(
              acceptInventoryOffer(data.senderId, data.item!.transactionId, data.item!.type, true)
            )
            onClose()
          }}
        >
          Save item
        </button>}

        {data.item && <button
          className={formStyles.DangerButton}
          onClick={() => {
            dispatch(declineInventoryOffer(data.senderId, data.item!.transactionId, true))
            onClose()
          }}
        >
          Decline item
        </button>}

        {!data.item && <button
          className={formStyles.PrimaryButton}
          onClick={onClose}
        >
          OK
        </button>}
      </div>
    </Container>
  )
}
