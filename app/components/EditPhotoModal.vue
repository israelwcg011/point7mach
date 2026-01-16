<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Edit Photo</h3>
          <p class="text-sm text-gray-500 mt-1">Update photo details</p>
        </div>

        <div class="px-6 py-4">
          <!-- Image Preview -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Current Photo
            </label>
            <div class="rounded-lg overflow-hidden bg-gray-100">
              <img 
                :src="photo.url" 
                alt="Photo preview"
                class="w-full h-48 object-cover"
              />
            </div>
          </div>

          <!-- Caption Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Caption
            </label>
            <input
              v-model="editedCaption"
              type="text"
              placeholder="Add a description for this photo"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- Date Input -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              v-model="editedDate"
              type="date"
              :min="tripStartDate"
              :max="tripEndDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p v-if="tripStartDate && tripEndDate" class="mt-1 text-xs text-gray-500">
              Date must be between {{ formatDate(tripStartDate) }} and {{ formatDate(tripEndDate) }}
            </p>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            @click="handleUpdate"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Photo } from '~/types'
import { formatDate } from '~/utils/format'

const props = defineProps<{
  photo: Photo
  tripStartDate?: string
  tripEndDate?: string
}>()

const emit = defineEmits<{
  close: []
  update: [data: Partial<Photo>]
}>()

const editedCaption = ref(props.photo.caption || '')
const editedDate = ref(props.photo.date || '')

const handleUpdate = () => {
  const updates: Partial<Photo> = {}
  
  if (editedCaption.value !== props.photo.caption) {
    updates.caption = editedCaption.value || undefined
  }
  
  if (editedDate.value !== props.photo.date) {
    updates.date = editedDate.value || undefined
  }

  emit('update', updates)
}

// Handle escape key to close modal
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      emit('close')
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})
</script>
