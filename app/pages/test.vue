<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <div class="bg-white shadow sm:rounded-lg p-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">🧪 Test Firebase Integration</h2>
      
      <div class="space-y-4">
        <div v-if="!user" class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p class="text-sm text-yellow-800">⚠️ You need to sign in first to test the integration.</p>
          <NuxtLink to="/login" class="text-indigo-600 hover:text-indigo-500 font-medium">Go to Login</NuxtLink>
        </div>

        <div v-else>
          <div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <p class="text-sm text-green-800">✅ Signed in as: {{ user.email }}</p>
          </div>

          <button
            @click="createSampleTrip"
            :disabled="loading"
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <span v-if="loading">Creating Sample Trip...</span>
            <span v-else>🚀 Create Sample Trip with Expenses</span>
          </button>

          <div v-if="message" class="mt-4 p-4 rounded-md" :class="messageType === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'">
            {{ message }}
          </div>

          <div v-if="createdTripId" class="mt-4">
            <NuxtLink
              :to="`/trips/${createdTripId}`"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              👀 View Created Trip
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Trip, Expense } from '~/types'

const user = useFirebaseUser()
const { addTrip, addExpense } = useTravelData()
const router = useRouter()

const loading = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const createdTripId = ref('')

const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

const createSampleTrip = async () => {
  loading.value = true
  message.value = ''
  createdTripId.value = ''

  try {
    const tripId = generateId()
    
    const sampleTrip: Trip = {
      id: tripId,
      title: 'Barcelona Adventure 2026',
      destination: 'Barcelona, Spain',
      startDate: '2026-06-15',
      endDate: '2026-06-22',
      currency: 'EUR',
      budget: 2000,
      notes: 'Summer vacation to explore Gaudí architecture and Mediterranean beaches',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    await addTrip(sampleTrip)

    const sampleExpenses: Expense[] = [
      {
        id: generateId(),
        tripId: tripId,
        description: 'Flight Tickets (Round Trip)',
        amount: 450.00,
        currency: 'EUR',
        date: '2026-05-20',
        category: 'transport'
      },
      {
        id: generateId(),
        tripId: tripId,
        description: 'Hotel Casa Bonita (7 nights)',
        amount: 840.00,
        currency: 'EUR',
        date: '2026-05-25',
        category: 'accommodation'
      },
      {
        id: generateId(),
        tripId: tripId,
        description: 'Sagrada Familia Tickets',
        amount: 35.00,
        currency: 'EUR',
        date: '2026-06-16',
        category: 'sightseeing'
      },
      {
        id: generateId(),
        tripId: tripId,
        description: 'Tapas at El Xampanyet',
        amount: 45.50,
        currency: 'EUR',
        date: '2026-06-16',
        category: 'food'
      },
      {
        id: generateId(),
        tripId: tripId,
        description: 'Park Güell Entry',
        amount: 10.00,
        currency: 'EUR',
        date: '2026-06-17',
        category: 'sightseeing'
      },
      {
        id: generateId(),
        tripId: tripId,
        description: 'Metro Pass (7 days)',
        amount: 35.40,
        currency: 'EUR',
        date: '2026-06-15',
        category: 'transport'
      },
      {
        id: generateId(),
        tripId: tripId,
        description: 'Souvenirs from La Rambla',
        amount: 60.00,
        currency: 'EUR',
        date: '2026-06-20',
        category: 'shopping'
      }
    ]

    for (const expense of sampleExpenses) {
      await addExpense(expense)
    }

    message.value = '✅ Sample trip "Barcelona Adventure 2026" created successfully with 7 expenses!'
    messageType.value = 'success'
    createdTripId.value = tripId

  } catch (error: any) {
    message.value = `❌ Error: ${error.message || 'Failed to create sample trip'}`
    messageType.value = 'error'
    console.error('Error creating sample trip:', error)
  } finally {
    loading.value = false
  }
}
</script>
