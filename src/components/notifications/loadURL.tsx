import React from 'react'

import { Container } from './utils'
import Text from '../text'

import { useName } from '../../hooks/names'

import { LoadURLNotification } from '../../types/chat'

import formStyles from '../formElements.module.css'
import styles from './notifications.module.css'

interface NotificationArgs {
  data: LoadURLNotification
  onClose: () => void
}

export default function LoadURL ({ data, onClose }: NotificationArgs) {
  const href = data.url.toString().replace(/^javascript:/i, '')

  const name = useName(data.fromId)

  return <Container title={`${name} did send you an URL`}>
    <p>
      <Text text={data.text} multiline />
    </p>

    <div>
      <a href={href} target='_blank' rel='noopener noreferrer'>{href}</a>
    </div>

    <div className={styles.ButtonsRow}>
      <button className={formStyles.PrimaryButton} onClick={onClose}>
        OK
      </button>
    </div>
  </Container>
}
