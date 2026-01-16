<template>
  <Teleport to="body">
    <div 
      v-if="isOpen"
      class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
      @click="handleBackdropClick"
    >
      <!-- Close Button -->
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all z-10"
      >
        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Previous Button -->
      <button
        v-if="hasPrevious"
        @click.stop="$emit('previous')"
        class="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all z-10"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Next Button -->
      <button
        v-if="hasNext"
        @click.stop="$emit('next')"
        class="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all z-10"
      >
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <!-- Image Container -->
      <div class="relative max-w-7xl max-h-[90vh] w-full px-4" @click.stop>
        <img
          :src="photo.url"
          :alt="photo.caption || 'Photo'"
          class="w-full h-full object-contain max-h-[80vh] rounded-lg"
        />

        <!-- Image Info -->
        <div class="mt-4 text-center">
          <p v-if="photo.caption" class="text-white text-lg font-medium mb-1">{{ photo.caption }}</p>
          <p v-if="photo.date" class="text-white/60 text-sm mb-3">{{ formatDate(photo.date) }}</p>
          
          <!-- Action Buttons -->
          <div v-if="isOwner" class="flex justify-center gap-3 mt-4">
            <button
              @click.stop="$emit('edit', photo)"
              class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all backdrop-blur-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              @click.stop="$emit('delete', photo.id)"
              class="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-all backdrop-blur-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>

        <!-- Image Counter -->
        <div class="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
          {{ currentIndex + 1 }} / {{ totalPhotos }}
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'
import type { Photo } from '~/types'

const props = defineProps<{
  photo: Photo
  isOpen: boolean
  currentIndex: number
  totalPhotos: number
  hasPrevious: boolean
  hasNext: boolean
  isOwner?: boolean
}>()

const emit = defineEmits<{
  close: []
  previous: []
  next: []
  edit: [photo: Photo]
  delete: [id: string]
}>()

const handleBackdropClick = (e: MouseEvent) => {
  // Close when clicking the backdrop (not the image)
  if (e.target === e.currentTarget) {
    emit('close')
  }
}

// Handle keyboard navigation
onMounted(() => {
  const handleKeydown = (e: KeyboardEvent) => {
    if (!props.isOpen) return
    
    switch (e.key) {
      case 'Escape':
        emit('close')
        break
      case 'ArrowLeft':
        if (props.hasPrevious) emit('previous')
        break
      case 'ArrowRight':
        if (props.hasNext) emit('next')
        break
    }
  }

  window.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<style scoped>
/* Prevent body scroll when lightbox is open */
body:has(.fixed.z-\[100\]) {
  overflow: hidden;
}
</style>
