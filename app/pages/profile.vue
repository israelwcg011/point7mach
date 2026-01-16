<template>
  <div class="min-h-[80vh] py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-2xl">
      <div class="text-center mb-8">
        <span class="text-4xl">👤</span>
        <h2 class="mt-4 text-3xl font-extrabold text-gray-900">
          Profile Settings
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Manage your account information and security
        </p>
      </div>

      <!-- Account Information -->
      <div class="bg-white shadow sm:rounded-lg mb-6">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Account Information</h3>
          
          <form @submit.prevent="handleProfileUpdate" class="mt-5 space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
              <div class="mt-1">
                <input
                  type="text"
                  id="name"
                  v-model="profileForm.name"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label for="birthDate" class="block text-sm font-medium text-gray-700">Birth Date</label>
              <div class="mt-1">
                <input
                  type="date"
                  id="birthDate"
                  v-model="profileForm.birthDate"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div class="rounded-md bg-gray-50 px-4 py-3">
              <div class="flex">
                <div class="flex-shrink-0">
                  <span class="text-xl">📧</span>
                </div>
                <div class="ml-3 flex-1">
                  <p class="text-sm font-medium text-gray-900">Email Address</p>
                  <p class="mt-1 text-sm text-gray-600">{{ user?.email }}</p>
                </div>
              </div>
            </div>

            <div v-if="profileMessage" :class="[
              'rounded-md p-4',
              profileMessageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            ]">
              <div class="flex">
                <div class="flex-shrink-0">
                  <span>{{ profileMessageType === 'success' ? '✓' : '✗' }}</span>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium">{{ profileMessage }}</p>
                </div>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="isProfileSubmitting"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ isProfileSubmitting ? 'Saving...' : 'Save Profile' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Change Password -->
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900">Change Password</h3>
          <div class="mt-2 max-w-xl text-sm text-gray-500">
            <p>Update your password to keep your account secure.</p>
          </div>
          
          <form @submit.prevent="handlePasswordChange" class="mt-5 space-y-4">
            <div>
              <label for="new-password" class="block text-sm font-medium text-gray-700">New Password</label>
              <div class="mt-1">
                <input
                  type="password"
                  id="new-password"
                  v-model="passwordForm.newPassword"
                  required
                  minlength="6"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
            </div>

            <div>
              <label for="confirm-password" class="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div class="mt-1">
                <input
                  type="password"
                  id="confirm-password"
                  v-model="passwordForm.confirmPassword"
                  required
                  minlength="6"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div v-if="message" :class="[
              'rounded-md p-4',
              messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            ]">
              <div class="flex">
                <div class="flex-shrink-0">
                  <span>{{ messageType === 'success' ? '✓' : '✗' }}</span>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium">{{ message }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <NuxtLink
                to="/"
                class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                &larr; Back to Dashboard
              </NuxtLink>
              <button
                type="submit"
                :disabled="isSubmitting"
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {{ isSubmitting ? 'Updating...' : 'Update Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useFirebaseUser()
const { updateUserPassword } = useFirebaseAuth()
const { userProfile, fetchUserProfile, updateUserProfile } = useUserProfile()
const router = useRouter()

const profileForm = reactive({
  name: '',
  birthDate: ''
})

const profileMessage = ref('')
const profileMessageType = ref<'success' | 'error'>('success')
const isProfileSubmitting = ref(false)

const passwordForm = reactive({
  newPassword: '',
  confirmPassword: ''
})

const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const isSubmitting = ref(false)

// Load user profile
onMounted(async () => {
  if (user.value) {
    await fetchUserProfile()
    if (userProfile.value) {
      profileForm.name = userProfile.value.name || ''
      profileForm.birthDate = userProfile.value.birthDate || ''
    }
  }
})

const handleProfileUpdate = async () => {
  profileMessage.value = ''
  isProfileSubmitting.value = true

  try {
    await updateUserProfile({
      name: profileForm.name || undefined,
      birthDate: profileForm.birthDate || undefined
    })

    profileMessage.value = 'Profile updated successfully!'
    profileMessageType.value = 'success'

    setTimeout(() => {
      profileMessage.value = ''
    }, 3000)
  } catch (error: any) {
    profileMessage.value = error.message || 'Failed to update profile. Please try again.'
    profileMessageType.value = 'error'
  } finally {
    isProfileSubmitting.value = false
  }
}

const handlePasswordChange = async () => {
  message.value = ''
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    message.value = 'Passwords do not match'
    messageType.value = 'error'
    return
  }

  if (passwordForm.newPassword.length < 6) {
    message.value = 'Password must be at least 6 characters long'
    messageType.value = 'error'
    return
  }

  isSubmitting.value = true

  try {
    await updateUserPassword(passwordForm.newPassword)

    message.value = 'Password updated successfully!'
    messageType.value = 'success'
    
    // Clear form
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''

    // Redirect to dashboard after 2 seconds
    setTimeout(() => {
      router.push('/')
    }, 2000)
  } catch (error: any) {
    message.value = error.message || 'Failed to update password. Please try again.'
    messageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}

// Redirect if not authenticated
watchEffect(() => {
  if (!user.value) {
    router.push('/login')
  }
})
</script>
