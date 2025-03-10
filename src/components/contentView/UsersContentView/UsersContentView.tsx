import { BsChatDots } from 'react-icons/bs'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchAllUsers,
  selectUserList,
  selectUser,
} from '../../../store/slices/userSlice'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../../../firestore/firebase'
import './UsersContentView.css'
import { AppDispatch } from '../../../store/store'

function UsersContentView() {
  const dispatch = useDispatch<AppDispatch>()
  const userList = useSelector(selectUserList)
  const currentUser = useSelector(selectUser)
  const navigate = useNavigate()

  useEffect(() => {
    if (userList.length === 0) {
      dispatch(fetchAllUsers())
    }
  }, [dispatch, userList.length])

  const handleOpenChat = async (userId: string) => {
    if (!currentUser) return

    const chatsRef = collection(db, 'chats')
    const q = query(
      chatsRef,
      where('isGroupChat', '==', false),
      where('members', 'array-contains', currentUser?.userId) // Ensure current user is part of the chat
    )

    const chatSnapshot = await getDocs(q)
    let existingChatId = null

    chatSnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.members.includes(userId)) {
        existingChatId = doc.id // Found an existing chat
      }
    })

    if (existingChatId) {
      console.log('✅ Found existing chat, navigating to chat:', existingChatId)
      navigate(`/main/direct-messages/${existingChatId}`)
    } else {
      console.log('🚀 No existing chat, creating a new chat...')
      const newChatRef = await addDoc(collection(db, 'chats'), {
        isGroupChat: false,
        members: [currentUser?.userId, userId],
        createdAt: serverTimestamp(),
      })

      console.log('✅ New chat created:', newChatRef.id)
      navigate(`/main/direct-messages/${newChatRef.id}`)
    }
  }

  return (
    <ul className="user-list-container">
      {userList.length === 0 ? (
        <p>No users entered the app yet</p>
      ) : (
        userList.map((user) => (
          <li key={user.userId} className="user-card">
            <div className="user-card-img">
              <img src={user.userProfilePicture} alt="user-profile-picture" />
            </div>
            <h3 className="user-card-name">{user.userName}</h3>
            <button onClick={() => handleOpenChat(user.userId)}>
              <BsChatDots />
            </button>
          </li>
        ))
      )}
    </ul>
  )
}

export default UsersContentView
