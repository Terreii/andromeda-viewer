import { Container, ComponentArguments, ButtonsRow } from './utils'
import Name from '../name'
import Text from '../text'

import { LoadURLNotification } from '../../types/chat'

export default function LoadURL ({ data, onClose }: ComponentArguments<LoadURLNotification>) {
  const href = data.url.toString().replace(/^javascript:/i, '')

  return (
    <Container title={<span><Name id={data.fromId} /> did send you an URL</span>}>
      <p>
        <Text text={data.text} multiline />
      </p>

      <div>
        <a href={href} target='_blank' rel='noopener noreferrer'>{href}</a>
      </div>

      <ButtonsRow>
        <button className='btn btn--primary' onClick={onClose}>
          OK
        </button>
      </ButtonsRow>
    </Container>
  )
}
