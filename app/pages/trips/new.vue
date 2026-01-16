<template>
  <div class="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <span class="text-4xl">✈️</span>
      </div>
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Plan a New Adventure
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Start by giving your trip a name and setting the dates.
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700">Trip Title</label>
            <div class="mt-1">
              <input
                type="text"
                id="title"
                v-model="form.title"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                placeholder="e.g. Summer in Italy"
              />
            </div>
          </div>

          <div>
            <label for="destination" class="block text-sm font-medium text-gray-700">Destination</label>
            <div class="mt-1">
              <input
                type="text"
                id="destination"
                v-model="form.destination"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                placeholder="e.g. Rome, Italy"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date</label>
              <div class="mt-1">
                <input
                  type="date"
                  id="startDate"
                  v-model="form.startDate"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label for="endDate" class="block text-sm font-medium text-gray-700">End Date</label>
              <div class="mt-1">
                <input
                  type="date"
                  id="endDate"
                  v-model="form.endDate"
                  required
                  :min="form.startDate"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
            <div class="mt-1">
              <select
                id="currency"
                v-model="form.currency"
                class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md transition-colors"
              >
                <option v-for="curr in currencies" :key="curr" :value="curr">{{ curr }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Trip Picture (Optional)</label>
            <div class="mt-1">
              <div v-if="previewUrl" class="mb-2">
                <img :src="previewUrl" alt="Trip picture preview" class="w-full h-40 object-cover rounded-md" />
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  @change="handleFileChange"
                  class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                <button
                  v-if="previewUrl"
                  type="button"
                  @click="removePicture"
                  class="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              <p class="mt-1 text-xs text-gray-500">Add a picture to make your trip card more memorable</p>
            </div>
          </div>

          <div class="flex items-center justify-between pt-4">
            <NuxtLink
              to="/"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              &larr; Back to Dashboard
            </NuxtLink>
            <button
              type="submit"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Create Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Currency } from '~/types'

const { addTrip } = useTravelData()
const router = useRouter()

const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD', 'BRL']

const form = reactive({
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  currency: 'USD' as Currency
})

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const removePicture = () => {
  selectedFile.value = null
  previewUrl.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSubmit = async () => {
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    alert('End date cannot be earlier than start date')
    return
  }

  try {
    console.log('[New Trip] Creating trip...', form)
    const trip = await addTrip({
      title: form.title,
      destination: form.destination,
      startDate: form.startDate,
      endDate: form.endDate,
      currency: form.currency,
      budget: undefined,
      notes: undefined
    }, selectedFile.value || undefined)

    console.log('[New Trip] Trip created:', trip)
    if (trip) {
      router.push(`/trips/${trip.id}`)
    } else {
      console.error('[New Trip] No trip returned')
      alert('Failed to create trip. Are you logged in?')
    }
  } catch (error) {
    console.error('[New Trip] Error:', error)
    alert('Failed to create trip. Please check the console for details.')
  }
}
</script>
