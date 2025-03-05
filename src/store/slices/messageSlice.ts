import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  getDoc,
} from 'firebase/firestore'
import { RootState } from '../store'
import { db } from '../../firestore/firebase'

export interface Message {
  messageID: string
  chatID: string
  content: string
  mediaContent: string
  senderID: string
  timestamp: Date
  senderName: string
}

interface MessageState {
  messages: Message[]
  loading: boolean
}

const initialState: MessageState = {
  messages: [],
  loading: false,
}

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (chatID: string, { rejectWithValue }) => {
    try {
      const messagesRef = collection(db, 'messages')
      const q = query(
        messagesRef,
        where('chatID', '==', chatID),
        orderBy('timestamp', 'asc')
      )

      const querySnapshot = await getDocs(q)

      const messages: Message[] = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const messageData = docSnap.data()
          const userRef = doc(db, 'users', messageData.senderID) // Fetch user document
          const userSnap = await getDoc(userRef)
          const userName = userSnap.exists()
            ? userSnap.data().userName
            : 'Unknown User'
          return {
            messageID: docSnap.id,
            chatID: messageData.chatID,
            content: messageData.content,
            mediaContent: messageData.mediaContent,
            senderID: messageData.senderID,
            senderName: userName, // Attach username
            timestamp: messageData.timestamp.toDate().toISOString(),
          }
        })
      )

      //   const messages: Message[] = querySnapshot.docs.map((doc) => ({
      //     messageID: doc.id,
      //     chatID: doc.data().chatID,
      //     content: doc.data().content,
      //     mediaContent: doc.data().mediaContent,
      //     senderID: doc.data().senderID,
      //     timestamp: doc.data().timestamp.toDate().toISOString(),

      return messages
    } catch (error) {
      console.log('Error fetching messages: ', error)
      return rejectWithValue('Failed to load messages')
    }
  }
)

export const MessagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true
      })
      .addCase(
        fetchMessages.fulfilled,
        (state, action: PayloadAction<Message[]>) => {
          state.loading = false
          state.messages = action.payload
        }
      )
      .addCase(fetchMessages.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { addMessage } = MessagesSlice.actions
export const selectMessage = (state: RootState) => state.messages.messages
export const selectLoading = (state: RootState) => state.messages.loading
export default MessagesSlice.reducer
