import { BsChatDots } from 'react-icons/bs'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchAllUsers, selectUserList } from '../../../store/slices/userSlice'
import { useNavigate } from 'react-router-dom'
import './UsersContentView.css'
import { AppDispatch } from '../../../store/store'

function UsersContentView() {
  const dispatch = useDispatch<AppDispatch>()
  const userList = useSelector(selectUserList)
  const navigate = useNavigate()

  useEffect(() => {
    if (userList.length === 0) {
      dispatch(fetchAllUsers())
    }
  }, [dispatch, userList.length])

  // const handleOpenChat = (chatID: string) => {
  //   navigate(`/dm/${chatID}`)
  // }

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
            <button>
              <BsChatDots />
            </button>
          </li>
        ))
      )}
    </ul>
  )
}

export default UsersContentView
