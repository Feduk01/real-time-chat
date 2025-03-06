import { NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { signOut } from 'firebase/auth'
import { auth } from '../../firestore/firebase'
import { selectUser, clearUser } from '../../store/slices/userSlice'
import './navigation.css'

function Navigation({
  isNavOpen,
  setIsNavOpen,
}: {
  isNavOpen: boolean
  setIsNavOpen: (value: boolean) => void
}) {
  const currentUser = useSelector(selectUser)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userName = currentUser?.userName || 'Guest'
  const userProfilePicture =
    currentUser?.userProfilePicture || 'default-profile.png'

  const handleLogout = async () => {
    try {
      await signOut(auth)
      dispatch(clearUser())
      navigate('/')
    } catch (error) {
      console.log('Logout Error', error)
    }
  }

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        className={`nav-toggle ${isNavOpen ? 'hidden' : ''}`}
        onClick={() => setIsNavOpen(true)}
      >
        ☰
      </button>

      {/* Sidebar Navigation */}
      <nav className={`side-nav ${isNavOpen ? 'open' : 'closed'}`}>
        {/* Close Button */}
        {isNavOpen && (
          <button
            className="nav-toggle-close"
            onClick={() => setIsNavOpen(false)}
          >
            ✖
          </button>
        )}

        <ul>
          <li>
            <img src={userProfilePicture} alt="" />
            <h2>{userName}</h2>
          </li>
          <li>
            <NavLink
              to="/main/direct-messages"
              onClick={() => setIsNavOpen(false)}
            >
              Direct Messages
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/main/group-messages"
              onClick={() => setIsNavOpen(false)}
            >
              Group Messages
            </NavLink>
          </li>
          <li>
            <NavLink to="/main/ai-chat" onClick={() => setIsNavOpen(false)}>
              AI Chat
            </NavLink>
          </li>
          <li>
            <NavLink to="/main/users" onClick={() => setIsNavOpen(false)}>
              Users
            </NavLink>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
    </>
  )
}

export default Navigation
