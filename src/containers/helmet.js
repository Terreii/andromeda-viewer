import React from 'react'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'

import { viewerName } from '../viewerInfo'

function HelmetContainer ({ isLoggedIn, selfName }) {
  return <Helmet
    defaultTitle={isLoggedIn ? `${selfName.getName()} - ${viewerName}` : viewerName}
  />
}

const mapStateToProps = state => {
  return {
    selfName: state.account.get('avatarName'),
    isLoggedIn: state.session.get('loggedIn')
  }
}

export default connect(mapStateToProps)(HelmetContainer)
