<template>
  <div class="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Sign in to your account
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
        <form @submit.prevent="handleSignIn" class="space-y-6">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
              <div class="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  v-model="email"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
              <div class="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  v-model="password"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-3">
              <p class="text-sm text-red-800">{{ error }}</p>
            </div>

            <div>
              <button
                type="submit"
                :disabled="loading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <span v-if="loading">Signing in...</span>
                <span v-else>Sign in</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

</template>

<script setup lang="ts">
const { signIn } = useFirebaseAuth()
const user = useFirebaseUser()

const loading = ref(false)
const email = ref('')
const password = ref('')
const error = ref('')

const handleSignIn = async () => {
  loading.value = true
  error.value = ''
  
  console.log('[Login] Starting sign in process...')
  
  try {
    await signIn(email.value, password.value)
    
    console.log('[Login] Sign in successful')
    
    // Wait a moment for the auth state to sync
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (user.value) {
      console.log('[Auth] User is synced. Navigating to /')
      await navigateTo('/')
    } else {
      console.warn('[Auth] User is NOT synced yet. Reloading...')
      window.location.href = '/'
    }
    
  } catch (err: any) {
    console.error('[Login] Sign in error:', err)
    error.value = err.message || 'Invalid email or password'
    loading.value = false
  }
}

// Watch user changes and redirect when authenticated
watch(user, (newUser) => {
  if (newUser) {
    console.log('[Auth] User authenticated, redirecting to home')
    navigateTo('/')
  }
})
</script>
