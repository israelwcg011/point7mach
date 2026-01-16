import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword,
  updateEmail,
  type Auth
} from 'firebase/auth'

/**
 * Firebase authentication composable
 */
export const useFirebaseAuth = () => {
  // Only run on client side
  if (process.server) {
    return {
      auth: null as Auth | null,
      signIn: async () => { throw new Error('Auth not available on server') },
      signUp: async () => { throw new Error('Auth not available on server') },
      signOut: async () => { throw new Error('Auth not available on server') },
      updateUserProfile: async () => { throw new Error('Auth not available on server') },
      updateUserPassword: async () => { throw new Error('Auth not available on server') },
      updateUserEmail: async () => { throw new Error('Auth not available on server') }
    }
  }

  const { $auth } = useNuxtApp()
  const auth = $auth as Auth

  const signIn = async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    return await firebaseSignOut(auth)
  }

  const updateUserProfile = async (data: { displayName?: string; photoURL?: string }) => {
    if (!auth.currentUser) throw new Error('No user logged in')
    return await updateProfile(auth.currentUser, data)
  }

  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('No user logged in')
    return await updatePassword(auth.currentUser, newPassword)
  }

  const updateUserEmail = async (newEmail: string) => {
    if (!auth.currentUser) throw new Error('No user logged in')
    return await updateEmail(auth.currentUser, newEmail)
  }

  return {
    auth,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    updateUserPassword,
    updateUserEmail
  }
}
