import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import { viewerName } from '../viewerInfo'

import { getIsLoggedIn, getAvatarName } from '../selectors/session'

function HelmetContainer ({ isLoggedIn, selfName }) {
  return <Helmet
    defaultTitle={isLoggedIn
      ? `${selfName.getName()} - ${viewerName}`
      : viewerName
    }
  />
}

const mapStateToProps = state => {
  return {
    selfName: getAvatarName(state),
    isLoggedIn: getIsLoggedIn(state)
  }
}

export default connect(mapStateToProps)(HelmetContainer)
