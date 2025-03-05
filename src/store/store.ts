import { configureStore } from '@reduxjs/toolkit'
import { UserSlice } from './slices/userSlice'
import { MessagesSlice } from './slices/messageSlice'

export const store = configureStore({
  reducer: {
    user: UserSlice.reducer,
    messages: MessagesSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
