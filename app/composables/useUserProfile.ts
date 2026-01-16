import type { UserProfile } from '~/types'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  type Firestore 
} from 'firebase/firestore'

export const useUserProfile = () => {
  const userProfile = useState<UserProfile | null>('userProfile', () => null)
  const loading = useState<boolean>('user-profile-loading', () => false)
  const user = useFirebaseUser()

  // Get Firestore instance
  const getDb = () => {
    if (process.server) return null
    const { $db } = useNuxtApp()
    return $db as Firestore | null
  }

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!user.value) return null
    const db = getDb()
    if (!db) return null

    try {
      loading.value = true
      const userDocRef = doc(db, 'users', user.value.uid)
      const userDoc = await getDoc(userDocRef)

      if (userDoc.exists()) {
        const data = userDoc.data()
        userProfile.value = {
          uid: user.value.uid,
          email: user.value.email || '',
          name: data.name,
          birthDate: data.birthDate,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        }
      } else {
        // Create initial profile if it doesn't exist
        const now = Date.now()
        const initialProfile: UserProfile = {
          uid: user.value.uid,
          email: user.value.email || '',
          createdAt: now,
          updatedAt: now
        }
        
        await setDoc(userDocRef, {
          email: user.value.email,
          createdAt: now,
          updatedAt: now
        })
        
        userProfile.value = initialProfile
      }

      return userProfile.value
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    } finally {
      loading.value = false
    }
  }

  // Update user profile
  const updateUserProfile = async (updates: Partial<Pick<UserProfile, 'name' | 'birthDate'>>) => {
    if (!user.value) return
    const db = getDb()
    if (!db) return

    try {
      loading.value = true
      const userDocRef = doc(db, 'users', user.value.uid)
      const now = Date.now()

      const updateData: any = { updatedAt: now }
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.birthDate !== undefined) updateData.birthDate = updates.birthDate

      await updateDoc(userDocRef, updateData)

      // Update local state
      if (userProfile.value) {
        userProfile.value = { 
          ...userProfile.value, 
          ...updates, 
          updatedAt: now 
        }
      }
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Watch user changes
  watch(user, async (newUser) => {
    if (newUser) {
      await fetchUserProfile()
    } else {
      userProfile.value = null
    }
  })

  return {
    userProfile,
    loading,
    fetchUserProfile,
    updateUserProfile
  }
}
