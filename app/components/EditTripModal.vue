<template>
  <TransitionRoot as="template" :show="true">
    <Dialog as="div" class="fixed z-10 inset-0 overflow-y-auto" @close="$emit('close')">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
          <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div>
              <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
                <span class="text-2xl">✏️</span>
              </div>
              <div class="mt-3 text-center sm:mt-5">
                <DialogTitle as="h3" class="text-lg leading-6 font-medium text-gray-900">
                  Edit Trip Details
                </DialogTitle>
              </div>
            </div>
            <form @submit.prevent="handleSubmit" class="mt-5 sm:mt-6 space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700">Trip Title</label>
                <input
                  type="text"
                  id="title"
                  v-model="form.title"
                  required
                  class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label for="destination" class="block text-sm font-medium text-gray-700">Destination</label>
                <input
                  type="text"
                  id="destination"
                  v-model="form.destination"
                  required
                  class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label for="startDate" class="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    v-model="form.startDate"
                    required
                    class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label for="endDate" class="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    v-model="form.endDate"
                    required
                    :min="form.startDate"
                    class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label for="currency" class="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  id="currency"
                  v-model="form.currency"
                  class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option v-for="curr in currencies" :key="curr" :value="curr">{{ curr }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Trip Picture</label>
                <div class="mt-1">
                  <div v-if="form.pictureUrl || previewUrl" class="mb-2">
                    <img :src="previewUrl || form.pictureUrl" alt="Trip picture" class="w-full h-40 object-cover rounded-md" />
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
                      v-if="form.pictureUrl || previewUrl"
                      type="button"
                      @click="removePicture"
                      class="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">Upload a picture for your trip (optional)</p>
                </div>
              </div>

              <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button type="submit" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm">
                  Save Changes
                </button>
                <button type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm" @click="$emit('close')">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { Dialog, DialogOverlay, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'
import type { Trip, Currency } from '~/types'

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits(['close', 'update'])

const currencies: Currency[] = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD', 'BRL']

const form = reactive({
  title: props.trip.title,
  destination: props.trip.destination,
  startDate: props.trip.startDate,
  endDate: props.trip.endDate,
  currency: props.trip.currency,
  pictureUrl: props.trip.pictureUrl
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
  form.pictureUrl = undefined
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleSubmit = () => {
  emit('update', {
    title: form.title,
    destination: form.destination,
    startDate: form.startDate,
    endDate: form.endDate,
    currency: form.currency,
    pictureFile: selectedFile.value,
    removePicture: !selectedFile.value && !form.pictureUrl
  })
  emit('close')
}
</script>
