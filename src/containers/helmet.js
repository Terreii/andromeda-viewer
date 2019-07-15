import React from 'react'
import { useSelector } from 'react-redux'
import Helmet from 'react-helmet'

import { viewerName } from '../viewerInfo'

import { getIsLoggedIn } from '../selectors/session'
import { getOwnAvatarName } from '../selectors/names'

export default function HelmetContainer (props) {
  const selfName = useSelector(getOwnAvatarName)
  const isLoggedIn = useSelector(getIsLoggedIn)

  return <Helmet
    defaultTitle={isLoggedIn
      ? `${selfName.getName()} - ${viewerName}`
      : viewerName
    }
  />
}
