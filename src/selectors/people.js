// Selectors for friends and other people

export const getFriends = state => state.friends

export const getFriendById = (state, friendId) => getFriends(state)
  .find(friend => friend.get('id') === friendId)
