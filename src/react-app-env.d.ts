/// <reference types="react-scripts" />

declare module 'redux-burger-menu' {
  export interface ReduxBurgerMenuState {
    isOpen: boolean
  }

  export interface ReduxBurgerMenuAction {
    type: 'TOGGLE_MENU',
    payload: {
      isOpen: boolean,
      menuId?: string
    }
  }

  export function action (isOpen = false, menuIs?: string): ReduxBurgerMenuAction

  export function reducer (state: ReduxBurgerMenuState, action: any): ReduxBurgerMenuState
}
