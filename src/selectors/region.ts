// Selectors for SIM, region, position and movement

export const getRegionId = (state: any): string => state.session.regionInfo.regionID

export const getParentEstateID = (state: any): number => state.session.regionInfo.ParentEstateID

export const getPosition = (state: any): number[] => state.session.position.position

export const getEventQueueGetUrl = (state: any): string => state.session.eventQueueGetUrl
