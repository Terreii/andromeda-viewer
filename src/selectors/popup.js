export const selectPopup = state => state.account.getIn(['viewerAccount', 'signInPopup']) ||
  state.session.get('error')

export const selectPopupData = state => state.account.getIn(['viewerAccount', 'popupData'])
