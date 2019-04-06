// Selectors for SIM, region, position and movement

export const getRegionId = state => state.session.getIn(['regionInfo', 'regionID'])

export const getParentEstateID = state => state.session.getIn(['regionInfo', 'ParentEstateID'])

export const getPosition = state => state.session.getIn(['position', 'position'])

export const getEventQueueGetUrl = state => state.session.get('eventQueueGetUrl')
