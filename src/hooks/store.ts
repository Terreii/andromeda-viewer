import { TypedUseSelectorHook, useDispatch as useD, useSelector as useSelect } from 'react-redux'

import type { RootState, AppDispatch } from '../store/configureStore'

export const useDispatch = () => useD<AppDispatch>()

export const useSelector: TypedUseSelectorHook<RootState> = useSelect
