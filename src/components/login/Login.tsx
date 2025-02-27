import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../firestore/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useDispatch } from 'react-redux'
import { setUser } from '../../store/slices/userSlice'
import './login.css'

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)

  const provider = new GoogleAuthProvider()

  const handleGoogleLogin = async () => {
    try {
      console.log('🔵 Login button clicked - Signing in with Popup...')
      setLoading(true)
      const result = await signInWithPopup(auth, provider)

      if (result?.user) {
        console.log('✅ User signed in:', result.user)
        dispatch(
          setUser({
            userId: result.user.uid,
            userName: result.user.displayName || '',
            userEmail: result.user.email || '',
            userProfilePicture: result.user.photoURL || '',
          })
        )
        navigate('/main')
      } else {
        console.log('❌ No user found in signInWithPopup')
      }
    } catch (error) {
      console.error('🔴 Google Sign-In Error:', error)
      setLoading(false)
    }
  }
  return (
    <div className="login-page">
      <button
        className="login-btn"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Login'}
      </button>
    </div>
  )
}

export default Login
