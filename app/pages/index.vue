<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Your Trips</h1>
        <p class="mt-2 text-gray-600">Manage your upcoming adventures and past memories.</p>
      </div>
      <ClientOnly>
        <NuxtLink 
          v-if="trips.length > 0"
          to="/trips/new" 
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          + New Trip
        </NuxtLink>
      </ClientOnly>
    </div>

    <ClientOnly>
      <div v-if="trips.length === 0" class="text-center py-20 bg-white rounded-lg border-2 border-dashed border-gray-300">
        <div class="mx-auto h-24 w-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <span class="text-4xl">🌍</span>
        </div>
        <h3 class="mt-2 text-lg font-medium text-gray-900">No trips yet</h3>
        <p class="mt-1 text-sm text-gray-500 max-w-sm mx-auto">Ready to start planning your next adventure? Create a new trip to track your expenses.</p>
        <div class="mt-6">
          <NuxtLink to="/trips/new" class="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform hover:scale-105">
            Create Your First Trip
          </NuxtLink>
        </div>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="trip in trips" 
          :key="trip.id" 
          class="group bg-white overflow-hidden shadow-sm rounded-xl hover:shadow-lg transition-all duration-300 border border-gray-100 flex flex-col"
        >
          <NuxtLink :to="`/trips/${trip.id}`" class="block relative h-40 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
            <img v-if="trip.pictureUrl" :src="trip.pictureUrl" :alt="trip.destination" class="absolute inset-0 w-full h-full object-cover z-10" />
            <div class="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors z-20"></div>
            <div class="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-black/60 to-transparent z-20">
              <h3 class="text-xl font-bold text-white truncate">{{ trip.destination }}</h3>
              <p class="text-indigo-100 text-sm">{{ formatDate(trip.startDate) }}</p>
            </div>
            <div class="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <span class="text-white">👉</span>
            </div>
          </NuxtLink>
          
          <div class="px-6 py-5 flex-1 flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{{ trip.title }}</h4>
              </div>
              
              <div class="mt-4">
                <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total Cost</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(getTripCost(trip.id), trip.currency) }}</p>
              </div>
            </div>

            <div class="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button 
                @click.prevent="handleDeleteTrip(trip.id)"
                class="text-sm text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <span>🗑️</span> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <template #fallback>
        <div class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p class="mt-4 text-gray-500">Loading your trips...</p>
        </div>
      </template>
    </ClientOnly>

    <ConfirmModal
      :isOpen="showDeleteModal"
      title="Delete Trip"
      message="Are you sure you want to delete this trip? All associated expenses will be permanently removed. This action cannot be undone."
      confirmText="Delete Trip"
      @confirm="confirmDeleteTrip"
      @close="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { formatDate, formatCurrency } from '~/utils/format'

const { trips, expenses, deleteTrip } = useTravelData()

const showDeleteModal = ref(false)
const tripToDelete = ref<string | null>(null)

const getTripCost = (tripId: string) => {
  const tripExpenses = expenses.value[tripId] || []
  return tripExpenses.reduce((sum, e) => sum + e.amount, 0)
}

const handleDeleteTrip = (tripId: string) => {
  tripToDelete.value = tripId
  showDeleteModal.value = true
}

const confirmDeleteTrip = async () => {
  if (tripToDelete.value) {
    await deleteTrip(tripToDelete.value)
    tripToDelete.value = null
    showDeleteModal.value = false
  }
}
</script>
