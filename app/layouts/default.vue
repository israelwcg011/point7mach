<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <NuxtLink to="/" class="flex-shrink-0 flex items-center">
              <span class="text-2xl font-bold text-indigo-600 tracking-tight">point7mach</span>
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <template v-if="user">
              <span class="text-sm text-gray-500 mr-4">{{ displayName }}</span>
              <NuxtLink
                to="/profile"
                class="text-sm font-medium text-gray-500 hover:text-gray-900 mr-4"
              >
                Profile
              </NuxtLink>
              <button
                @click="handleLogout"
                class="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Sign out
              </button>
            </template>
            <NuxtLink
              v-else
              to="/login"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const user = useFirebaseUser()
const { userProfile, fetchUserProfile } = useUserProfile()
const { signOut } = useFirebaseAuth()
const router = useRouter()

const displayName = computed(() => {
  if (userProfile.value?.name) {
    return userProfile.value.name
  }
  return user.value?.email || 'User'
})

// Fetch user profile when user is available
watch(user, async (newUser) => {
  if (newUser) {
    await fetchUserProfile()
  }
}, { immediate: true })

const handleLogout = async () => {
  await signOut()
  router.push('/login')
}
</script>

<style>
body {
  @apply bg-gray-50;
}
</style>
