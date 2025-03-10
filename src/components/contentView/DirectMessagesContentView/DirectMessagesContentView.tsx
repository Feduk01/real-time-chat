import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch } from '../../../store/store'
import {
  fetchDMPreviews,
  selectDMPreviews,
} from '../../../store/slices/messageSlice'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import './DirectMessagesContentView.css'

function DirectMessagesContentView() {
  const dispatch = useDispatch<AppDispatch>()
  const dmPreviews = useSelector(selectDMPreviews)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchDMPreviews())
  }, [dispatch])

  const handleOpenChat = (userId: string) => {
    navigate(`/main/direct-messages/${userId}`)
  }

  return (
    <div className="dm-container">
      {dmPreviews.length === 0 ? (
        <p>No direct messages yet.</p>
      ) : (
        dmPreviews.map((dm) => (
          <div
            key={dm.messageID}
            className="dm-message-container"
            onClick={() => handleOpenChat(dm.chatID)}
          >
            <div className="user-img">
              <img src={dm.photoURL} alt={dm.senderName} />
            </div>
            <div className="user-info-container">
              <h4 className="user-name">{dm.senderName}</h4>

              {dm.mediaContent ? (
                <img
                  src={dm.mediaContent}
                  alt="Media Content"
                  className="chat-media-image"
                />
              ) : (
                <p className="user-message">{dm.content}</p>
              )}
            </div>

            <div className="timestamp">
              <p>{format(new Date(dm.timestamp), 'dd MMM yy HH:mm')}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default DirectMessagesContentView
