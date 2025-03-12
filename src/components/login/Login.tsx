import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../firestore/firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { useDispatch } from 'react-redux'
import { addNewUser } from '../../store/slices/userSlice'
import './login.css'
import { AppDispatch } from '../../store/store'

function Login() {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)

  const provider = new GoogleAuthProvider()

  const handleGoogleLogin = async () => {
    try {
      console.log('🔵 Login button clicked - Signing in with Popup...')
      setLoading(true)
      const result = await signInWithPopup(auth, provider)

      if (result?.user) {
        console.log('✅ User signed in:', result.user)

        const user = {
          userId: result.user.uid, // ✅ Ensure ID is included
          userName: result.user.displayName || '',
          userEmail: result.user.email || '',
          userProfilePicture: result.user.photoURL || '',
        }

        // Check and add user in Firestore, then navigate
        await dispatch(addNewUser(user))
        navigate('/main')
      } else {
        console.log('❌ No user found in signInWithPopup')
      }
    } catch (error) {
      console.error('🔴 Google Sign-In Error:', error)
    } finally {
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
