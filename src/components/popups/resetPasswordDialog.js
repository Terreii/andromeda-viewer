import React from 'react'

import Popup from './popup'

export default function ResetPasswordDialog ({ type, onChangePassword, onSignOut, onCancel }) {
  return <Popup title='Reset password' onClose={onCancel}>
    <div />
  </Popup>
}
