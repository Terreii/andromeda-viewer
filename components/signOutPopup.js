'use strict'

import React from 'react'

import Popup from './popup'

export default function SignOutPopup ({onCancel, onSignOut}) {
  return <Popup title='Sign Out?' onClose={onCancel}>
    <div>
      <button onClick={onCancel}>cancel</button>
      <button onClick={onSignOut}>sign out</button>
    </div>
  </Popup>
}
