import { useDispatch, useSelector } from 'react-redux'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import {
  createMessage,
  selectMessage,
  selectLoading,
  Message,
  fetchMessages,
  addMessage, // ✅ Import addMessage to update Redux state immediately
} from '../../../store/slices/messageSlice'
import { AppDispatch } from '../../../store/store'
import { selectUser } from '../../../store/slices/userSlice'
import './GroupMessagesContentView.css'
import { nanoid } from 'nanoid'

function GroupMessagesContentView() {
  const dispatch = useDispatch<AppDispatch>()
  const loading = useSelector(selectLoading)
  const messages = useSelector(selectMessage)
  const currentUser = useSelector(selectUser)
  const [messageText, setMessageText] = useState('')
  const GROUP_CHAT_ID = 'MwFHtVv5wFjid2RVEMLp' // ✅ Group Chat ID
  const newId = nanoid()

  // ✅ Filter messages for the group chat only
  const groupChatMessages = messages.filter(
    (msg) => msg.chatID === GROUP_CHAT_ID
  )

  useEffect(() => {
    if (groupChatMessages.length === 0) {
      console.log('🔄 Fetching past group messages...')
      dispatch(fetchMessages(GROUP_CHAT_ID))
    }
  }, [dispatch, groupChatMessages.length])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !currentUser) return

    const isImageUrl =
      messageText.startsWith('http') &&
      /\.(jpg|jpeg|png|gif)$/i.test(messageText)

    const newMessage = {
      messageID: newId, // ✅ Temporary ID until Firestore assigns one
      chatID: GROUP_CHAT_ID,
      content: messageText,
      senderID: currentUser.userId,
      senderName: currentUser.userName,
      photoURL: currentUser.userProfilePicture || 'default-profile.png',
      mediaContent: isImageUrl ? messageText : '',
      timestamp: new Date().toISOString(),
    }

    dispatch(addMessage(newMessage))
    try {
      await dispatch(createMessage(newMessage)).unwrap() // ✅ Send message to Firestore
    } catch (error) {
      console.error('Failed to send message:', error)
    }

    setMessageText('')
  }

  return (
    <div className="channel-chat-container">
      <main className="channel-chat-main">
        {loading && <p>Loading messages...</p>}
        <ul className="channel-chat-conversation">
          {groupChatMessages.map((msg: Message) => (
            <li key={msg.messageID} className="channel-chat-message-container">
              <div className="channel-chat-message-container-header">
                <h3 className="channel-chat-message-username">
                  {msg.senderName}
                </h3>
                <p>{format(new Date(msg.timestamp), 'dd MMM yy HH:mm')}</p>
              </div>
              {!msg.mediaContent && (
                <p className="channel-chat-message">{msg.content}</p>
              )}
              {!msg.content && msg.mediaContent.startsWith('http') && (
                <img
                  src={msg.mediaContent}
                  alt="Media Content"
                  className="chat-media-image"
                />
              )}
            </li>
          ))}
        </ul>
      </main>

      {/* ✅ Input Field for Sending Messages */}
      <form
        className="channel-chat-input-container"
        onSubmit={handleSendMessage}
      >
        <div className="input-wrapper">
          <input
            className="channel-chat-input"
            type="text"
            placeholder="Type your message here..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default GroupMessagesContentView
