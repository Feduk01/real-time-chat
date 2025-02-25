import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

export interface User {
  userId: string
  userName: string
  userEmail: string
  userProfilePicture: string
}

interface UserState {
  user: User | null
}

const initialState: UserState = {
  user: null,
}

export const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      return state
    },
    clearUser: (state) => {
      state.user = null
    },
  },
})
export const { setUser, clearUser } = UserSlice.actions
export const selectUser = (state: RootState) => state.user
export default UserSlice.reducer
