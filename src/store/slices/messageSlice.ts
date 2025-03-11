import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  getDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { RootState } from '../store'
import { db } from '../../firestore/firebase'

export interface Message {
  messageID: string
  chatID: string
  content: string
  mediaContent: string
  senderID: string
  timestamp: string
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

export const fetchDMPreviews = createAsyncThunk<
  Message[],
  void,
  { state: RootState }
>('messages/fetchDMPreviews', async (_, { getState, rejectWithValue }) => {
  try {
    //Get the logged-in user's ID
    const currentUser = getState().user.user
    if (!currentUser) {
      return rejectWithValue('User not logged in')
    }
    const userID = currentUser.userId
    console.log('currentuser: ', currentUser)

    //  Fetch DM chats where the logged-in user is a participant
    const chatsRef = collection(db, 'chats')
    const chatQuery = query(
      chatsRef,
      where('isGroupChat', '==', false),
      where('members', 'array-contains', userID)
    )
    const chatSnapshot = await getDocs(chatQuery)

    console.log('fetched chats the user is part of: ', chatSnapshot)

    const dmChatIDs = chatSnapshot.docs.map((doc) => doc.id)

    if (dmChatIDs.length === 0) {
      return [] // No DM chats exist, return empty array
    }

    // Fetch messages only from the user's DM chats
    const messagesRef = collection(db, 'messages')
    const messagesQuery = query(
      messagesRef,
      where('chatID', 'in', dmChatIDs), // Messages only from user's chats
      orderBy('timestamp', 'desc')
    )
    const querySnapshot = await getDocs(messagesQuery)

    console.log('fetched messages the user is part of: ', querySnapshot)

    const latestMessageByChat: Record<string, Message> = {}
    const usersCache: Record<string, { name: string; photoURL: string }> = {}

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

    // Return only latest messages per chat
    return Object.values(latestMessageByChat)
  } catch (error) {
    console.log('Error fetching DM previews: ', error)
    return rejectWithValue('Failed to load DM previews')
  }
})

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

//Create a message

export const createMessage = createAsyncThunk(
  'messages/createMessage',
  async (
    messageData: Omit<Message, 'messageID' | 'timestamp'>,
    { rejectWithValue }
  ) => {
    try {
      const messagesRef = collection(db, 'messages')
      const newMessageRef = await addDoc(messagesRef, {
        ...messageData,
        timestamp: serverTimestamp(), // Firestore timestamp
      })

      return {
        ...messageData,
        messageID: newMessageRef.id,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error('Error sending message:', error)
      return rejectWithValue('Failed to send message')
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
    setMessages: (state, action: PayloadAction<Message[]>) => {
      const newMessages = action.payload

      if (newMessages.length === 0) return

      // ✅ Get chat ID from first message
      const chatID = newMessages[0].chatID

      // ✅ Update only messages from the active chat
      state.messages = [
        ...state.messages.filter((msg) => msg.chatID !== chatID), // Keep other chats intact
        ...newMessages.filter(
          (newMsg) =>
            !state.messages.some(
              (existingMsg) => existingMsg.messageID === newMsg.messageID
            ) // ✅ Avoid duplicates
        ),
      ]
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

export const { addMessage, setMessages } = MessagesSlice.actions
export const selectMessage = (state: RootState) => state.messages.messages
export const selectDMPreviews = (state: RootState) => state.messages.dmPreviews
export const selectLoading = (state: RootState) => state.messages.loading
export default MessagesSlice.reducer
