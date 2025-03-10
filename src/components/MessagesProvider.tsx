import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
} from 'firebase/firestore'
import { db } from '../firestore/firebase'
import { setMessages } from '../store/slices/messageSlice'
import { selectUser } from '../store/slices/userSlice'

function MessagesProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const currentUser = useSelector(selectUser)

  useEffect(() => {
    if (!currentUser) return

    console.log('🟡 Listening for real-time messages...')

    // ✅ Fetch all chat messages where the user is a participant
    const messagesRef = collection(db, 'messages')
    const q = query(
      messagesRef,
      where('chatID', '!=', ''), // ✅ Get all messages from all chats
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('🔄 New messages detected')

      const updatedMessages = snapshot.docs.map((doc) => ({
        messageID: doc.id,
        chatID: doc.data().chatID,
        content: doc.data().content,
        mediaContent: doc.data().mediaContent || '',
        senderID: doc.data().senderID,
        senderName: doc.data().senderName,
        photoURL: doc.data().photoURL || '',
        timestamp:
          doc.data().timestamp?.toDate().toISOString() ||
          new Date().toISOString(), // ✅ Convert to ISO string
      }))

      dispatch(setMessages(updatedMessages)) // ✅ Update Redux state instantly
    })

    return () => {
      console.log('🔴 Unsubscribing from message listener')
      unsubscribe()
    }
  }, [dispatch, currentUser])

  return <>{children}</>
}

export default MessagesProvider
