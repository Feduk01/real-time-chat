import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import {
  fetchMessages,
  selectMessage,
  selectLoading,
  createMessage,
} from '../../../store/slices/messageSlice'
import { AppDispatch } from '../../../store/store'
import {
  fetchAllUsers,
  selectUser,
  selectUserList,
} from '../../../store/slices/userSlice'
import './DirectMessagesChat.css'

function DirectMessagesChat() {
  const { userId } = useParams() // Get userId from URL
  const dispatch = useDispatch<AppDispatch>()
  const messages = useSelector(selectMessage)
  const loading = useSelector(selectLoading)
  const currentUser = useSelector(selectUser)
  const userList = useSelector(selectUserList)

  const [messageText, setMessageText] = useState('') // ✅ Controlled input
  const [otherUser, setOtherUser] = useState<{
    name: string
    photoURL: string
  } | null>(null)
  const [hasFetchedMessages, setHasFetchedMessages] = useState(false)

  useEffect(() => {
    if (!userList.length) {
      dispatch(fetchAllUsers())
    }
  }, [dispatch, userList.length])

  useEffect(() => {
    if (!userId) return
    if (!hasFetchedMessages) {
      dispatch(fetchMessages(userId))
      setHasFetchedMessages(true)
    }
  }, [dispatch, userId, hasFetchedMessages])

  useEffect(() => {
    if (!userId || !currentUser) return

    // ✅ CASE 1: Extract user from messages (if available)
    const chatMessages = messages.filter((msg) => msg.chatID === userId)

    if (chatMessages.length > 0) {
      const otherUserId = chatMessages.find(
        (msg) => msg.senderID !== currentUser.userId
      )?.senderID

      if (otherUserId) {
        const foundUser = userList.find(
          (user) => user.userId.trim() === otherUserId.trim()
        )

        if (foundUser) {
          setOtherUser({
            name: foundUser.userName,
            photoURL: foundUser.userProfilePicture || 'default-profile.png',
          })
          return
        }
      }
    }

    // ✅ CASE 2: No messages yet → Get user directly from `userList`
    const foundUser = userList.find((user) => user.userId === userId)

    if (foundUser) {
      setOtherUser({
        name: foundUser.userName,
        photoURL: foundUser.userProfilePicture || 'default-profile.png',
      })
    }
  }, [userId, currentUser, messages, userList])

  console.log('otherUser is: ', otherUser)

  const handleSendMessage = async () => {
    if (!messageText.trim() || !userId || !currentUser) return
    const isImageUrl =
      messageText.startsWith('http') &&
      /\.(jpg|jpeg|png|gif)$/i.test(messageText)

    const newMessage = {
      chatID: userId, // ✅ Chat ID from URL
      content: messageText,
      senderID: currentUser.userId,
      senderName: currentUser.userName,
      photoURL: currentUser.userProfilePicture || 'default-profile.png',
      mediaContent: isImageUrl ? messageText : '', // ✅ Media content (if any),
      timestamp: new Date().toISOString(),
    }

    try {
      await dispatch(createMessage(newMessage)).unwrap() // ✅ Ensure async completion
    } catch (error) {
      console.error('Failed to send message:', error)
    }

    setMessageText('') // ✅ Clear input after sending
  }
  const chatMessages = messages.filter((msg) => msg.chatID === userId)
  return (
    <div className="dm-chat-container">
      <header className="dm-chat-header">
        <div className="header-user-info">
          <img
            src={otherUser?.photoURL || 'default-profile.png'}
            alt={otherUser?.name || 'User'}
            className="user-info-img"
          />
          <h2>Chat with {otherUser?.name || 'User'}</h2>
        </div>
      </header>

      <main className="dm-chat-main">
        {loading && <p>Loading messages...</p>}
        <ul className="dm-chat-conversation">
          {messages.length === 0 ? (
            <p>No messages yet. Start the conversation!</p>
          ) : (
            chatMessages.map((msg) => (
              <li
                className={`dm-chat-message-container ${
                  msg.senderID === currentUser?.userId ? 'self' : ''
                }`}
                key={msg.messageID}
              >
                <div className="dm-chat-message-container-header">
                  <h3 className="dm-chat-message-username">
                    {msg.senderID === currentUser?.userId
                      ? 'You'
                      : msg.senderName}
                  </h3>
                  <p className="dm-chat-timestamp">
                    {format(new Date(msg.timestamp), 'dd MMM yy HH:mm')}
                  </p>
                </div>

                {!msg.mediaContent && (
                  <p className="dm-chat-message">{msg.content}</p>
                )}
                {msg.mediaContent && msg.mediaContent.startsWith('http') && (
                  <img
                    src={msg.mediaContent}
                    alt="Media Content"
                    className="chat-media-image"
                  />
                )}
              </li>
            ))
          )}
        </ul>
      </main>

      <form
        className="dm-chat-input-container"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="input-wrapper">
          <input
            type="text"
            className="dm-chat-input"
            placeholder="Type your message..."
            value={messageText} // ✅ Controlled input
            onChange={(e) => setMessageText(e.target.value)}
          />
          <button className="send-button" onClick={handleSendMessage}>
            Send
          </button>
        </div>
      </form>
    </div>
  )
}

export default DirectMessagesChat
