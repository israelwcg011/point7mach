import type { Trip } from '~/types'

/**
 * Composable to check if the current user is the owner of a trip
 * This is used to conditionally show/hide edit features
 */
export const useTripOwnership = () => {
  const user = useFirebaseUser()

  /**
   * Check if the current user is the owner of a given trip
   */
  const isOwner = (trip: Trip | null | undefined): boolean => {
    if (!trip || !user.value) return false
    return trip.userId === user.value.uid
  }

  /**
   * Get a reactive ref that indicates if the current user is the owner
   */
  const isOwnerRef = (trip: Ref<Trip | null | undefined> | ComputedRef<Trip | null | undefined>) => {
    return computed(() => isOwner(trip.value))
  }

  return {
    isOwner,
    isOwnerRef
  }
}
