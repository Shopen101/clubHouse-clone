import { combineReducers, configureStore, Store } from '@reduxjs/toolkit'
import { Context, createWrapper } from 'next-redux-wrapper'
import { roomsReducer } from './slices/roomSlice'
import { userReducer } from './slices/userSlice'
import { RootState } from './types'

export const rootReducer = combineReducers({
  rooms: roomsReducer,
  user: userReducer,
})

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    devTools: true,
  })

export const wrapper = createWrapper<Store>(makeStore, { debug: true })

