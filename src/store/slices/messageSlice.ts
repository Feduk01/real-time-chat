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
  photoURL: string
}

interface MessageState {
  messages: Message[]
  loading: boolean
  dmPreviews: Message[]
}

const initialState: MessageState = {
  messages: [],
  loading: false,
  dmPreviews: [],
}

//fetching Dm messages

export const fetchDMPreviews = createAsyncThunk(
  'messages/fetchDMPreviews',
  async (_, { rejectWithValue }) => {
    try {
      //Fetch chat collection
      const chatsRef = collection(db, 'chats')
      const chatQuery = query(chatsRef, where('isGroupChat', '==', false))
      const chatSnapshot = await getDocs(chatQuery)

      const dmChatIDs = chatSnapshot.docs.map((doc) => doc.id) // Get only DM chat IDs

      if (dmChatIDs.length === 0) {
        return [] // No DM chats exist, return empty array
      }

      // Fetch messages only from DM chats
      const messagesRef = collection(db, 'messages')
      const messagesQuery = query(
        messagesRef,
        where('chatID', 'in', dmChatIDs), // messages only from DM chats
        orderBy('timestamp', 'asc')
      )
      const querySnapshot = await getDocs(messagesQuery)

      const latestMessageByChat: Record<string, Message> = {}
      const usersCache: Record<string, { name: string; photoURL: string }> = {} // Cache for sender names & profile pictures

      // Process messages
      await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
          const messageData = docSnap.data()
          const chatID = messageData.chatID

          // If we already stored a message for this chatID, skip it
          if (latestMessageByChat[chatID]) return

          // Fetch sender details (username and profile picture)
          if (!usersCache[messageData.senderID]) {
            const userRef = doc(db, 'users', messageData.senderID)
            const userSnap = await getDoc(userRef)

            usersCache[messageData.senderID] = userSnap.exists()
              ? {
                  name: userSnap.data().userName,
                  photoURL:
                    userSnap.data().userProfilePicture || 'default-profile.png',
                }
              : { name: 'Unknown User', photoURL: 'default-profile.png' }
          }

          // Store only ONE latest message per chat
          latestMessageByChat[chatID] = {
            messageID: docSnap.id,
            chatID: messageData.chatID,
            content: messageData.content,
            mediaContent: messageData.mediaContent || '',
            senderID: messageData.senderID,
            senderName: usersCache[messageData.senderID].name,
            photoURL: usersCache[messageData.senderID].photoURL,
            timestamp: messageData.timestamp.toDate().toISOString(),
          }
        })
      )

      // Ensure only ONE latest message per chat is stored
      return Object.values(latestMessageByChat)
    } catch (error) {
      console.log('Error fetching DM previews: ', error)
      return rejectWithValue('Failed to load DM previews')
    }
  }
)

//Fetching group messages
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
          const userRef = doc(db, 'users', messageData.senderID)
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
            senderName: userName,
            timestamp: messageData.timestamp.toDate().toISOString(),
            photoURL: messageData.photoURL || '',
          }
        })
      )
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
      // Handle group messages
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
      // Handle DM Previews
      .addCase(fetchDMPreviews.pending, (state) => {
        state.loading = true
      })
      .addCase(
        fetchDMPreviews.fulfilled,
        (state, action: PayloadAction<Message[]>) => {
          state.loading = false
          state.dmPreviews = action.payload
        }
      )
      .addCase(fetchDMPreviews.rejected, (state) => {
        state.loading = false
      })
  },
})

export const { addMessage } = MessagesSlice.actions
export const selectMessage = (state: RootState) => state.messages.messages
export const selectDMPreviews = (state: RootState) => state.messages.dmPreviews
export const selectLoading = (state: RootState) => state.messages.loading
export default MessagesSlice.reducer
