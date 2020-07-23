import React from 'react'
import { useDispatch } from 'react-redux'

import { UUID as LLUUID } from '../../llsd'
import { Container, ComponentArguments, ButtonsRow } from './utils'
import Name from '../name'
import Text from '../text'

import { acceptInventoryOffer, declineInventoryOffer } from '../../actions/inventory'

import { useGroupName } from '../../hooks/names'

import { GroupNoticeNotification } from '../../types/chat'
import { getItemTypeName } from '../../types/inventory'

export default function GroupNotice (
  { data, onClose }: ComponentArguments<GroupNoticeNotification>
) {
  const dispatch = useDispatch()

  const groupName = useGroupName(data.groupId)

  return (
    <Container title={`Group Notice from ${groupName} - ${data.title}`}>
      <small>send by <Name id={data.senderId || LLUUID.nil} /></small>

      <p>
        <Text text={data.text} multiline />
      </p>

      {data.item && (
        <div>
          This notice includes item
          <b> "{data.item?.name}" </b>
          of type
          <b> {getItemTypeName(data.item?.type)}</b>
        </div>
      )}

      <ButtonsRow>
        {data.item && (
          <button
            className='btn btn--ok'
            onClick={() => {
              const item = data.item
              if (item) {
                dispatch(
                  acceptInventoryOffer(
                    data.senderId,
                    item.transactionId ?? '',
                    item.type,
                    true
                  )
                )
              }
              onClose()
            }}
          >
            Save item
          </button>
        )}

        {data.item && (
          <button
            className='btn btn--danger'
            onClick={() => {
              dispatch(declineInventoryOffer(data.senderId, data.item?.transactionId ?? '', true))
              onClose()
            }}
          >
            Decline item
          </button>
        )}

        {!data.item && (
          <button
            className='btn btn--primary'
            onClick={onClose}
          >
            OK
          </button>
        )}
      </ButtonsRow>
    </Container>
  )
}
