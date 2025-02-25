import { NavLink } from 'react-router-dom'
import { auth } from '../../firestore/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useSelector, useDispatch } from 'react-redux'
import { selectUser, setUser, User } from '../../store/slices/userSlice'
import './login.css'

function Login() {
  const user = useSelector(selectUser)
  const dispatch = useDispatch()

  const provider = new GoogleAuthProvider()

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      if (user) {
        dispatch(
          setUser({
            userId: user.uid,
            userName: user.displayName || '',
            userEmail: user.email || '',
            userProfilePicture: user.photoURL || '',
          })
        )
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error)
    }
  }

  return (
    <div className="login-page">
      <button className="login-btn" onClick={handleGoogleLogin}>
        <NavLink to="/main">Login</NavLink>
      </button>
    </div>
  )
}

export default Login
