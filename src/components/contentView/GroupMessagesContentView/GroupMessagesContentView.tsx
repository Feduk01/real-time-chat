import { useDispatch, useSelector } from 'react-redux'
import { format } from 'date-fns'
import { useEffect } from 'react'
import {
  fetchMessages,
  selectMessage,
  selectLoading,
  Message,
} from '../../../store/slices/messageSlice'
import { AppDispatch } from '../../../store/store'
import './GroupMessagesContentView.css'
function GroupMessagesContentView() {
  const dispatch = useDispatch<AppDispatch>()
  const loading = useSelector(selectLoading)
  const messages = useSelector(selectMessage)

  useEffect(() => {
    dispatch(fetchMessages('MwFHtVv5wFjid2RVEMLp'))
  }, [dispatch])

  return (
    <div className="channel-chat-container">
      <main className="channel-chat-main">
        {loading && <p>Loading messages...</p>}
        <ul className="channel-chat-conversation">
          {messages.map((msg: Message) => (
            <li key={msg.messageID} className="channel-chat-message-container">
              <div className="channel-chat-message-container-header">
                <h3 className="channel-chat-message-username">
                  {msg.senderName}
                </h3>
                <p>{format(msg.timestamp, 'dd MMM yy HH:mm')}</p>
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

      <form className="channel-chat-input-container">
        <div className="input-wrapper">
          <input
            className="channel-chat-input"
            type="text"
            placeholder="Type your message here..."
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
