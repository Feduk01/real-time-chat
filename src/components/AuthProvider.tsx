import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firestore/firebase'
import { setUser, clearUser } from '../store/slices/userSlice'
function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()

  useEffect(() => {
    console.log('🟡 Global AuthProvider - Checking authentication state...')

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('🔄 Global `onAuthStateChanged` TRIGGERED - User:', user)

      if (user) {
        console.log('✅ Global `onAuthStateChanged` - User detected:', user)

        dispatch(
          setUser({
            userId: user.uid,
            userName: user.displayName || '',
            userEmail: user.email || '',
            userProfilePicture: user.photoURL || '',
          })
        )
      } else {
        console.log(
          '🔴 Global `onAuthStateChanged` - No user found - Calling clearUser()'
        )
        dispatch(clearUser())
      }
    })
    return () => unsubscribe()
  }, [dispatch])
  return <>{children}</>
}

export default AuthProvider
