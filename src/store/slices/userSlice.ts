import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { collection, getDocs, doc, getDoc, setDoc } from 'firebase/firestore'
import { RootState } from '../store'
import { db } from '../../firestore/firebase'

export interface User {
  userId: string
  userName: string
  userEmail: string
  userProfilePicture: string
}

interface UserState {
  user: User | null
  users: User[]
  loading: boolean
}

const initialState: UserState = {
  user: null,
  loading: false,
  users: [],
}

export const fetchAllUsers = createAsyncThunk(
  'user/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const userRef = collection(db, 'users')
      const userSnapshot = await getDocs(userRef)

      const users: User[] = userSnapshot.docs.map((docSnap) => {
        const userData = docSnap.data()
        return {
          userId: docSnap.id,
          userName: userData.userName,
          userEmail: userData.userEmail,
          userProfilePicture:
            userData.userProfilePicture || 'default-profile.png',
        }
      })

      return users
    } catch (error) {
      console.log('Error fetching users: ', error)
      return rejectWithValue('Failed to load users')
    }
  }
)

export const addNewUser = createAsyncThunk(
  'user/addNewUser',
  async (user: User, { rejectWithValue }) => {
    try {
      const userRef = doc(db, 'users', user.userId)
      const userSnapshot = await getDoc(userRef)

      if (!userSnapshot.exists()) {
        console.log('🆕 New user detected. Adding to Firestore...')
        await setDoc(userRef, {
          userName: user.userName,
          userEmail: user.userEmail,
          userProfilePicture: user.userProfilePicture || 'default-profile.png',
        })
      } else {
        console.log('✅ User already exists in Firestore')
      }

      // Return the full user object including userId
      return {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        userProfilePicture: user.userProfilePicture,
      }
    } catch (error) {
      console.error('Error adding new user:', error)
      return rejectWithValue('Failed to add user')
    }
  }
)

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
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(
        fetchAllUsers.fulfilled,
        (state, action: PayloadAction<User[]>) => {
          state.loading = false
          state.users = action.payload
        }
      )
      .addCase(fetchAllUsers.rejected, (state) => {
        state.loading = false
      })
      .addCase(addNewUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload // Now includes userId
      })
  },
})
export const { setUser, clearUser } = UserSlice.actions
export const selectUser = (state: RootState): User | null => state.user.user
export const selectUserList = (state: RootState) => state.user.users
export default UserSlice.reducer
