// Selectors for SIM, region, position and movement

export const getRegionId = state => state.session.regionInfo.regionID

export const getParentEstateID = state => state.session.regionInfo.ParentEstateID

export const getPosition = state => state.session.position.position

export const getEventQueueGetUrl = state => state.session.eventQueueGetUrl
