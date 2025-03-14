import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from 'firebase/firestore'
import { RootState } from '../store'
import { db } from '../../firestore/firebase'
import { getAIResponse } from '../../utils/openAIService'

// Define AI chat message structure
export interface AIMessage {
  messageID?: string // Firestore-generated ID
  content: string
  role: 'user' | 'assistant'
  timestamp: string
}

// Define AI chat session structure
interface AIChatState {
  messages: AIMessage[]
  loading: boolean
  error: string | null
}

const initialState: AIChatState = {
  messages: [],
  loading: false,
  error: null,
}

// ✅ Fetch AI chat history for a logged-in user
export const fetchAIChat = createAsyncThunk<
  AIMessage[],
  string, // userID
  { state: RootState }
>('aiChat/fetchAIChat', async (userID, { rejectWithValue }) => {
  try {
    const chatQuery = query(
      collection(db, 'ai-chat'),
      where('userID', '==', userID)
    )
    const chatSnapshot = await getDocs(chatQuery)

    if (chatSnapshot.empty) {
      return [] // No AI chat found
    }

    const chatDoc = chatSnapshot.docs[0]
    const messagesRef = collection(chatDoc.ref, 'messages')
    const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'))
    const messagesSnapshot = await getDocs(messagesQuery)

    return messagesSnapshot.docs.map((docSnap) => ({
      messageID: docSnap.id,
      content: docSnap.data().content,
      role: docSnap.data().role,
      timestamp: docSnap.data().timestamp.toDate().toISOString(),
    }))
  } catch (error) {
    console.error('Error fetching AI chat:', error)
    return rejectWithValue('Failed to load AI chat')
  }
})

// ✅ Send a message & get AI response
export const sendAIMessage = createAsyncThunk<
  AIMessage,
  { userID: string; content: string },
  { state: RootState }
>(
  'aiChat/sendAIMessage',
  async ({ userID, content }, { rejectWithValue, dispatch }) => {
    try {
      const chatQuery = query(
        collection(db, 'ai-chat'),
        where('userID', '==', userID)
      )
      const chatSnapshot = await getDocs(chatQuery)

      let chatRef
      if (chatSnapshot.empty) {
        // No session exists, create one
        const newChatRef = await addDoc(collection(db, 'ai-chat'), {
          userID,
          createdAt: serverTimestamp(),
        })
        chatRef = newChatRef
      } else {
        chatRef = chatSnapshot.docs[0].ref
      }

      const messagesRef = collection(chatRef, 'messages')

      // ✅ Save user message first
      const userMessageRef = await addDoc(messagesRef, {
        content,
        role: 'user',
        timestamp: serverTimestamp(),
      })

      const userMessage: AIMessage = {
        messageID: userMessageRef.id,
        content,
        role: 'user',
        timestamp: new Date().toISOString(),
      }

      // ✅ Dispatch user message **IMMEDIATELY** so it appears in UI instantly
      dispatch(addAIMessage(userMessage))

      // ✅ Send user message to OpenAI API
      const aiResponse = await getAIResponse(content)

      // ✅ Save AI response in Firestore
      const aiMessageRef = await addDoc(messagesRef, {
        content: aiResponse,
        role: 'assistant',
        timestamp: serverTimestamp(),
      })

      const aiMessage: AIMessage = {
        messageID: aiMessageRef.id,
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      }

      return aiMessage // ✅ AI message added to Redux state
    } catch (error) {
      console.error('Error sending AI message:', error)
      return rejectWithValue('Failed to send message')
    }
  }
)

// ✅ Clear AI chat when user logs out
export const clearAIChat = createAsyncThunk<
  void,
  string,
  { rejectValue: string } // ✅ Explicit error type
>('aiChat/clearAIChat', async (userID, { rejectWithValue }) => {
  try {
    const chatQuery = query(
      collection(db, 'ai-chat'),
      where('userID', '==', userID)
    )
    const chatSnapshot = await getDocs(chatQuery)

    if (!chatSnapshot.empty) {
      const chatDoc = chatSnapshot.docs[0]
      const messagesRef = collection(chatDoc.ref, 'messages')
      const messagesSnapshot = await getDocs(messagesRef)
      for (const messageDoc of messagesSnapshot.docs) {
        await deleteDoc(messageDoc.ref) // ✅ Delete each message
      }

      // Delete the chat document itself
      await deleteDoc(chatDoc.ref)
    }
  } catch (error) {
    console.error('Error clearing AI chat:', error)
    return rejectWithValue('Failed to clear AI chat') // ✅ Ensures correct error type
  }
})

// ✅ AI Chat Slice
export const aiChatSlice = createSlice({
  name: 'aiChat',
  initialState,
  reducers: {
    addAIMessage: (state, action: PayloadAction<AIMessage>) => {
      state.messages.push(action.payload)
    },
    clearAIChatAfterLogOut: (state) => {
      state.messages = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIChat.pending, (state) => {
        state.loading = true
      })
      .addCase(
        fetchAIChat.fulfilled,
        (state, action: PayloadAction<AIMessage[]>) => {
          state.loading = false
          state.messages = action.payload
        }
      )
      .addCase(fetchAIChat.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(sendAIMessage.pending, (state) => {
        state.loading = true
      })
      .addCase(
        sendAIMessage.fulfilled,
        (state, action: PayloadAction<AIMessage>) => {
          state.loading = false
          state.messages.push(action.payload) // Add AI response to Redux state
        }
      )
      .addCase(sendAIMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(clearAIChat.fulfilled, (state) => {
        state.messages = [] // Clear chat state on logout
      })
  },
})

// // ✅ Helper function to get AI response (Mock for now)
// const getAIResponse = async (message: string): Promise<string> => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(`AI Response to: ${message}`) // Replace with OpenAI API call
//     }, 1000)
//   })
// }
export const { addAIMessage, clearAIChatAfterLogOut } = aiChatSlice.actions
export const selectAIChatMessages = (state: RootState) => state.aiChat.messages
export const selectAIChatLoading = (state: RootState) => state.aiChat.loading

export default aiChatSlice.reducer
