export const getIsLoggedIn = state => state.session.get('loggedIn')

export const getAvatarIdentifier = state => state.account.get('avatarIdentifier')
