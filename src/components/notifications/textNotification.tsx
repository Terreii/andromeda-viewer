import { Container, ComponentArguments, ButtonsRow } from './utils'
import Text from '../text'

import { NotificationTypes, TextNotification, SystemNotification } from '../../types/chat'

export default function TextNotificationComponent (
  { data, onClose }: ComponentArguments<TextNotification | SystemNotification>
) {
  const title = data.notificationType === NotificationTypes.System
    ? 'System Notification'
    : data.fromName

  return (
    <Container title={title}>
      <p>
        <Text text={data.text} multiline />
      </p>

      <ButtonsRow>
        <button className='btn btn--primary' onClick={onClose}>
          OK
        </button>
      </ButtonsRow>
    </Container>
  )
}
