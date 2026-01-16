import { useCurrentUser } from 'vuefire'
import type { User } from 'firebase/auth'

/**
 * Composable to get the current Firebase authenticated user
 * Returns a reactive reference to the current user
 */
export const useFirebaseUser = () => {
  // Return null during SSR
  if (process.server) {
    return ref(null) as Ref<User | null>
  }
  
  return useCurrentUser() as Ref<User | null>
}
