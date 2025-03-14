import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  sendAIMessage,
  fetchAIChat,
  selectAIChatMessages,
  selectAIChatLoading,
} from '../../../store/slices/aiChatSlice'
import { AppDispatch } from '../../../store/store'
import { selectUser } from '../../../store/slices/userSlice'
import { format } from 'date-fns'
import './AIChatContentView.css'

function AIChat() {
  const dispatch = useDispatch<AppDispatch>()
  const currentUser = useSelector(selectUser)
  const aiMessages = useSelector(selectAIChatMessages)
  const loading = useSelector(selectAIChatLoading)
  const [messageText, setMessageText] = useState('')

  // ✅ Fetch AI chat messages when component loads
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchAIChat(currentUser.userId))
    }
  }, [dispatch, currentUser])

  // ✅ Handle message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !currentUser) return

    try {
      await dispatch(
        sendAIMessage({ userID: currentUser.userId, content: messageText })
      ).unwrap()
    } catch (error) {
      console.error('Error sending AI message:', error)
    }

    setMessageText('') // ✅ Clear input field
  }

  return (
    <div className="ai-chat-container">
      <header className="ai-chat-header">
        <h2>AI Chat Assistant</h2>
      </header>

      <main className="ai-chat-messages">
        {loading && (
          <p className="ai-chat-start-message">Loading messages...</p>
        )}

        <ul className="ai-chat-list">
          {aiMessages.length === 0 ? (
            <p className="ai-chat-placeholder">
              Start a conversation with the AI!
            </p>
          ) : (
            aiMessages.map((msg) => (
              <li
                key={msg.messageID}
                className={`ai-chat-message ${
                  msg.role === 'user' ? 'user-message' : 'ai-message'
                }`}
              >
                <p className="ai-chat-content">{msg.content}</p>
                <span className="ai-chat-timestamp">
                  {format(new Date(msg.timestamp), 'dd MMM yy HH:mm')}
                </span>
              </li>
            ))
          )}
        </ul>
      </main>

      <form className="ai-chat-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="ai-chat-input"
          placeholder="Ask something..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  )
}

export default AIChat
