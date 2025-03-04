import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { signOut } from 'firebase/auth'
import { auth } from '../../firestore/firebase'
import { selectUser, clearUser } from '../../store/slices/userSlice'
import './navigation.css'
function Navigation() {
  const currentUser = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  // const userName = currentUser.user ? currentUser.user.userName : 'Guest'
  const { userName, userProfilePicture } = currentUser.user || {}

  const handleLogout = async () => {
    try {
      await signOut(auth)
      dispatch(clearUser())
      setTimeout(() => {
        navigate('/')
      }, 500)
    } catch (error) {
      console.log('Logout Error', error)
    }
  }

  return (
    <nav className="side-nav">
      <ul>
        <li>
          <img src={userProfilePicture} alt="" />
          <h2>{userName}</h2>
        </li>
        <li>
          <NavLink to="/main/direct-messages">Direct Messages</NavLink>
        </li>
        <li>
          <NavLink to="/main/group-messages">Group Messages</NavLink>
        </li>
        <li>
          <NavLink to="/main/ai-chat">AI Chat</NavLink>
        </li>
        <li>
          <NavLink to="/main/users">Users</NavLink>
        </li>
        <li>
          <button onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
