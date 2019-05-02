// Selectors for friends and other people

export const getFriends = state => state.friends

export const getFriendById = (state, id) => getFriends(state).find(friend => friend.id === id)
