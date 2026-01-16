export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server
  if (process.server) return
  
  // Allow access to login page without authentication
  if (to.path === '/login') {
    return
  }
  
  // Wait for Firebase auth to initialize
  const { $authReady } = useNuxtApp()
  await $authReady
  
  const user = useFirebaseUser()

  // If user is not authenticated, redirect to login
  if (!user.value) {
    return navigateTo('/login')
  }
})
