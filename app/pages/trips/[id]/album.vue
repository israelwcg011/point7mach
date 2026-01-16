<template>
  <div v-if="trip" class="min-h-screen bg-gray-900">
    <!-- Sidebar -->
    <div 
      v-show="sidebarOpen"
      class="fixed top-0 left-0 h-screen w-80 bg-black/40 backdrop-blur-sm border-r border-gray-800 flex flex-col transition-all duration-300 overflow-y-auto z-40"
    >
      <!-- Header -->
      <div class="p-6 border-b border-gray-800">
        <NuxtLink :to="`/trips/${tripId}`" class="text-gray-400 hover:text-white transition-colors mb-4 inline-flex items-center gap-2">
          <span>←</span> Back to trip
        </NuxtLink>
        <h1 class="text-2xl font-bold text-white mt-4">{{ trip.title }}</h1>
        <p class="text-gray-400 text-sm mt-1">📍 {{ trip.destination }}</p>
        <p class="text-gray-500 text-xs mt-1">{{ formatDate(trip.startDate) }} - {{ formatDate(trip.endDate) }}</p>
      </div>

      <!-- Album Info -->
      <div class="p-6 border-b border-gray-800">
        <h2 class="text-xl font-bold text-white mb-2">Image Gallery</h2>
        <p class="text-gray-400 text-sm">{{ photos.length }} {{ photos.length === 1 ? 'photo' : 'photos' }}</p>
        <p v-if="!user" class="text-sm text-gray-500 mt-4">You must be logged in to start uploading images</p>
      </div>

      <!-- Upload Button -->
      <div class="p-6">
        <button 
          v-if="user && isTripOwner"
          @click="showUploadModal = true"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors shadow-lg flex items-center justify-center gap-2"
        >
          <span class="text-lg">📸</span> Upload Photos
        </button>
        <div v-else-if="user && !isTripOwner" class="w-full bg-gray-700 text-gray-400 px-4 py-3 rounded-lg text-sm font-medium text-center">
          Read-only access
        </div>
      </div>

      <!-- Tips -->
      <div class="p-6 flex-1">
        <div class="bg-gray-800/50 rounded-lg p-4">
          <p class="text-xs text-gray-400 font-medium mb-2">💡 {{ isTripOwner ? 'Tips:' : 'Info:' }}</p>
          <ul v-if="isTripOwner" class="text-xs text-gray-500 space-y-1">
            <li>• Upload multiple photos at once</li>
            <li>• Add captions to your memories</li>
            <li>• Photos are stored securely</li>
            <li>• Only you can see your albums</li>
          </ul>
          <ul v-else class="text-xs text-gray-500 space-y-1">
            <li>• You have read-only access to this trip</li>
            <li>• Only the trip creator can add or edit photos</li>
            <li>• You can view and browse all photos</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div 
      class="min-h-screen overflow-y-auto transition-all duration-300"
      :class="sidebarOpen ? 'ml-80' : 'ml-0'"
    >
      <!-- Sidebar Toggle Button -->
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="fixed top-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-all duration-300 border border-gray-700"
        :style="{ left: sidebarOpen ? '21rem' : '1rem' }"
      >
        <svg v-if="!sidebarOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <!-- Empty State -->
      <div v-if="photos.length === 0" class="flex items-center justify-center min-h-screen p-8">
        <div class="text-center max-w-md">
          <div class="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-8 rounded-full inline-block mb-6">
            <span class="text-6xl">📷</span>
          </div>
          <h3 class="text-2xl font-bold text-white mb-3">Welcome to image gallery</h3>
          <p class="text-gray-400 mb-2">{{ user && isTripOwner ? 'Start uploading images to create your travel gallery' : user && !isTripOwner ? 'This trip has no photos yet' : 'You must be logged in to start uploading images' }}</p>
          <p class="text-sm text-gray-500 mb-8">Share your favorite moments from this trip and relive the memories</p>
          <button 
            v-if="user && isTripOwner"
            @click="showUploadModal = true"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg"
          >
            Upload your first photo →
          </button>
        </div>
      </div>

      <!-- Masonry Grid -->
      <div v-else class="p-8">
        <div class="masonry-grid">
          <TransitionGroup name="photo">
            <div 
              v-for="photo in photos" 
              :key="photo.id" 
              class="masonry-item group relative cursor-pointer overflow-hidden rounded-lg"
              @click="openLightbox(photo)"
            >
              <img 
                :src="photo.url" 
                :alt="photo.caption || 'Travel photo'"
                class="w-full h-full object-cover shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]"
                loading="lazy"
              />
              <!-- Overlay on hover -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-end p-4">
                <p v-if="photo.caption" class="text-white text-sm font-medium mb-2 drop-shadow-lg">{{ photo.caption }}</p>
                <p v-if="photo.date" class="text-white/90 text-xs mb-3 drop-shadow-md">{{ formatDate(photo.date) }}</p>
                <div v-if="isTripOwner" class="flex gap-2 justify-end">
                  <button 
                    @click.stop="handleEditPhoto(photo)"
                    class="p-2.5 bg-white/95 hover:bg-white text-gray-900 rounded-full transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
                    title="Edit photo"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    @click.stop="handleDeletePhoto(photo.id)"
                    class="p-2.5 bg-red-500/95 hover:bg-red-600 text-white rounded-full transition-all hover:scale-110 shadow-lg backdrop-blur-sm"
                    title="Delete photo"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <UploadPhotoModal
      v-if="showUploadModal"
      :tripId="tripId"
      :tripStartDate="trip.startDate"
      :tripEndDate="trip.endDate"
      :isUploading="isUploading"
      :progress="uploadProgress"
      :uploadedCount="uploadedCount"
      @close="showUploadModal = false"
      @upload="handlePhotoUpload"
      @progress="handleUploadProgress"
    />

    <!-- Edit Modal -->
    <EditPhotoModal
      v-if="showEditModal && photoToEdit"
      :photo="photoToEdit"
      :tripStartDate="trip.startDate"
      :tripEndDate="trip.endDate"
      @update="handlePhotoUpdate"
      @close="showEditModal = false; photoToEdit = null"
    />

    <!-- Delete Confirmation -->
    <ConfirmModal
      :isOpen="showDeleteConfirm"
      title="Delete Photo"
      message="Are you sure you want to delete this photo? This action cannot be undone."
      confirmText="Delete"
      @confirm="confirmDeletePhoto"
      @close="showDeleteConfirm = false"
    />

    <!-- Photo Lightbox -->
    <PhotoLightbox
      v-if="lightboxPhoto"
      :photo="lightboxPhoto"
      :isOpen="!!lightboxPhoto"
      :currentIndex="currentPhotoIndex"
      :totalPhotos="photos.length"
      :hasPrevious="currentPhotoIndex > 0"
      :hasNext="currentPhotoIndex < photos.length - 1"
      :isOwner="isTripOwner"
      @close="closeLightbox"
      @previous="showPreviousPhoto"
      @next="showNextPhoto"
      @edit="handleEditPhoto"
      @delete="handleDeletePhoto"
    />
  </div>
  <div v-else class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="text-center">
      <p class="text-gray-400 mb-4">Trip not found.</p>
      <NuxtLink to="/" class="text-indigo-400 hover:text-indigo-300 underline">Go back home</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'
import type { Photo } from '~/types'

definePageMeta({
  layout: false // Use no layout for full-screen experience
})

const route = useRoute()
const { getTrip, getTripPhotos, uploadPhotos, updatePhoto, deletePhoto, loadTripData } = useTravelData()
const { isOwner } = useTripOwnership()
const user = useFirebaseUser()

const tripId = route.params.id as string
const trip = computed(() => getTrip(tripId))
const photos = getTripPhotos(tripId)
const isTripOwner = computed(() => isOwner(trip.value))

// Load trip data on mount if not already loaded
onMounted(async () => {
  if (!trip.value) {
    await loadTripData(tripId)
  }
})

const showUploadModal = ref(false)
const showEditModal = ref(false)
const showDeleteConfirm = ref(false)
const photoToEdit = ref<Photo | null>(null)
const photoToDelete = ref<string | null>(null)
const lightboxPhoto = ref<Photo | null>(null)
const isUploading = ref(false)
const sidebarOpen = ref(false)
const uploadProgress = ref(0)
const uploadedCount = ref(0)

const handlePhotoUpload = async (files: File[], caption?: string, date?: string) => {
  try {
    isUploading.value = true
    uploadProgress.value = 0
    uploadedCount.value = 0
    
    await uploadPhotos(tripId, files, caption, date, (progress, uploaded, total) => {
      uploadProgress.value = progress
      uploadedCount.value = uploaded
    })
    
    showUploadModal.value = false
  } catch (error) {
    alert('Failed to upload photos. Please check your connection and try again.')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
    uploadedCount.value = 0
  }
}

const handleUploadProgress = (progress: number, uploaded: number) => {
  uploadProgress.value = progress
  uploadedCount.value = uploaded
}

const handleEditPhoto = (photo: Photo) => {
  photoToEdit.value = photo
  showEditModal.value = true
}

const handlePhotoUpdate = async (data: Partial<Photo>) => {
  if (photoToEdit.value) {
    try {
      await updatePhoto(tripId, photoToEdit.value.id, data)
      showEditModal.value = false
      photoToEdit.value = null
    } catch (error) {
      alert('Failed to update photo. Please check your connection and try again.')
    }
  }
}

const handleDeletePhoto = (id: string) => {
  photoToDelete.value = id
  showDeleteConfirm.value = true
}

const confirmDeletePhoto = async () => {
  if (photoToDelete.value) {
    try {
      await deletePhoto(tripId, photoToDelete.value)
      photoToDelete.value = null
      showDeleteConfirm.value = false
    } catch (error) {
      alert('Failed to delete photo. Please check your connection and try again.')
    }
  }
}

const currentPhotoIndex = computed(() => {
  if (!lightboxPhoto.value) return -1
  return photos.value.findIndex(p => p.id === lightboxPhoto.value!.id)
})

const openLightbox = (photo: Photo) => {
  lightboxPhoto.value = photo
}

const closeLightbox = () => {
  lightboxPhoto.value = null
}

const showPreviousPhoto = () => {
  const index = currentPhotoIndex.value
  if (index > 0) {
    const prevPhoto = photos.value[index - 1]
    if (prevPhoto) {
      lightboxPhoto.value = prevPhoto
    }
  }
}

const showNextPhoto = () => {
  const index = currentPhotoIndex.value
  if (index < photos.value.length - 1) {
    const nextPhoto = photos.value[index + 1]
    if (nextPhoto) {
      lightboxPhoto.value = nextPhoto
    }
  }
}

// Prevent body scroll when modal is open
watch(showUploadModal, (isOpen) => {
  if (process.client) {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})

// Clean up body overflow on unmount
onUnmounted(() => {
  if (process.client) {
    document.body.style.overflow = ''
  }
})

// Set page title
useHead({
  title: computed(() => trip.value ? `${trip.value.title} - Photo Album` : 'Photo Album'),
  meta: [
    { name: 'description', content: 'View and manage your travel photos' }
  ]
})
</script>

<style scoped>
.masonry-grid {
  column-count: 1;
  column-gap: 1.5rem;
  padding: 0;
}

@media (min-width: 640px) {
  .masonry-grid {
    column-count: 2;
  }
}

@media (min-width: 1024px) {
  .masonry-grid {
    column-count: 3;
  }
}

@media (min-width: 1536px) {
  .masonry-grid {
    column-count: 4;
  }
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 1.5rem;
  display: inline-block;
  width: 100%;
}

/* Photo transitions */
.photo-enter-active,
.photo-leave-active {
  transition: all 0.4s ease;
}

.photo-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.photo-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.photo-move {
  transition: transform 0.4s ease;
}

/* Custom scrollbar for dark theme */
::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 5px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
