<template>
  <Teleport to="body">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">Upload Photos</h3>
          <p class="text-sm text-gray-500 mt-1">Add photos to your travel album</p>
        </div>

        <div class="px-6 py-4">
          <!-- File Upload Area -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Select Photos *
            </label>
            <div
              @drop.prevent="handleDrop"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              :class="[
                'border-2 border-dashed rounded-lg p-8 text-center transition-all',
                isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
              ]"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                @change="handleFileSelect"
                class="hidden"
              />
              
              <div v-if="selectedFiles.length === 0">
                <div class="text-5xl mb-3">📸</div>
                <p class="text-sm text-gray-600 mb-2">
                  <button
                    @click="$refs.fileInput.click()"
                    class="text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Click to upload
                  </button>
                  or drag and drop
                </p>
                <p class="text-xs text-gray-500">PNG, JPG, GIF up to 10MB each</p>
              </div>

              <div v-else class="space-y-2">
                <div class="text-3xl mb-2">✅</div>
                <p class="text-sm font-medium text-gray-900">{{ selectedFiles.length }} {{ selectedFiles.length === 1 ? 'file' : 'files' }} selected</p>
                <div v-if="compressedSize > 0" class="text-xs text-green-600 font-medium">
                  Compressed: {{ formatFileSize(originalSize) }} → {{ formatFileSize(compressedSize) }}
                  <span class="text-green-700">({{ Math.round((1 - compressedSize / originalSize) * 100) }}% saved)</span>
                </div>
                <button
                  @click="$refs.fileInput.click()"
                  class="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Choose different files
                </button>
              </div>
            </div>
          </div>

          <!-- Compression Progress -->
          <div v-if="isCompressing" class="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-sm font-medium text-blue-900">Optimizing images for faster upload...</span>
            </div>
          </div>

          <!-- File Previews -->
          <div v-if="selectedFiles.length > 0" class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-3">
              Preview ({{ selectedFiles.length }} {{ selectedFiles.length === 1 ? 'photo' : 'photos' }})
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-64 overflow-y-auto">
              <div
                v-for="(file, index) in selectedFiles"
                :key="index"
                class="relative group"
              >
                <img
                  :src="previewUrls[index]"
                  :alt="`Preview ${index + 1}`"
                  class="w-full h-32 object-cover rounded-lg"
                />
                <button
                  @click="removeFile(index)"
                  class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div class="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded truncate">
                  {{ file.name }}
                </div>
              </div>
            </div>
          </div>

          <!-- Global Caption (optional) -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Caption for all photos (optional)
            </label>
            <input
              v-model="globalCaption"
              type="text"
              placeholder="e.g., Day trip to the mountains"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <!-- Global Date (optional) -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Date for all photos (optional)
            </label>
            <input
              v-model="globalDate"
              type="date"
              :min="tripStartDate"
              :max="tripEndDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p v-if="tripStartDate && tripEndDate" class="mt-1 text-xs text-gray-500">
              Date must be between {{ formatDate(tripStartDate) }} and {{ formatDate(tripEndDate) }}
            </p>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploading" class="mb-4 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-900">Uploading your photos...</span>
              <span class="text-sm font-semibold text-indigo-600">{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                class="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
                :style="{ width: `${uploadProgress}%` }"
              ></div>
            </div>
            <p class="text-xs text-gray-600 mt-2 flex items-center gap-1">
              <svg class="w-4 h-4 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ uploadedCount }} of {{ selectedFiles.length }} photos uploaded
            </p>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3">
          <button
            @click="$emit('close')"
            :disabled="uploading"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ uploading ? 'Uploading...' : 'Cancel' }}
          </button>
          <button
            @click="handleUpload"
            :disabled="selectedFiles.length === 0 || uploading"
            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ uploading ? 'Uploading...' : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'Photo' : 'Photos'}` }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import imageCompression from 'browser-image-compression'
import type { Photo } from '~/types'
import { formatDate } from '~/utils/format'

const props = defineProps<{
  tripId: string
  tripStartDate?: string
  tripEndDate?: string
  isUploading?: boolean
  progress?: number
  uploadedCount?: number
}>()

const emit = defineEmits<{
  close: []
  upload: [files: File[], caption?: string, date?: string]
  progress: [progress: number, uploaded: number]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])
const globalCaption = ref('')
const globalDate = ref('')
const isDragging = ref(false)
const isCompressing = ref(false)
const originalSize = ref(0)
const compressedSize = ref(0)

// Use props for upload state, but fallback to local state for UI display
const uploading = computed(() => props.isUploading ?? false)
const uploadProgress = computed(() => props.progress ?? 0)
const uploadedCount = computed(() => props.uploadedCount ?? 0)

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    addFiles(Array.from(target.files))
  }
}

const handleDrop = (event: DragEvent) => {
  isDragging.value = false
  if (event.dataTransfer?.files) {
    addFiles(Array.from(event.dataTransfer.files))
  }
}

const addFiles = async (files: File[]) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'))
  
  if (imageFiles.length === 0) return
  
  isCompressing.value = true
  
  try {
    // Compression options
    const options = {
      maxSizeMB: 1, // Max file size in MB
      maxWidthOrHeight: 1920, // Max width/height (maintains aspect ratio)
      useWebWorker: true, // Use web worker for better performance
      fileType: 'image/jpeg', // Convert to JPEG for better compression
      initialQuality: 0.85 // 85% quality (good balance)
    }
    
    const compressedFiles: File[] = []
    let totalOriginalSize = 0
    let totalCompressedSize = 0
    
    for (const file of imageFiles) {
      totalOriginalSize += file.size
      
      // Compress the image
      const compressedFile = await imageCompression(file, options)
      totalCompressedSize += compressedFile.size
      
      // Rename to preserve original filename
      const renamedFile = new File(
        [compressedFile], 
        file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
        { type: 'image/jpeg' }
      )
      
      compressedFiles.push(renamedFile)
      
      // Create preview URL from compressed file
      const reader = new FileReader()
      reader.onload = (e) => {
        previewUrls.value.push(e.target?.result as string)
      }
      reader.readAsDataURL(renamedFile)
    }
    
    selectedFiles.value = [...selectedFiles.value, ...compressedFiles]
    originalSize.value += totalOriginalSize
    compressedSize.value += totalCompressedSize
    
  } catch (error) {
    console.error('Error compressing images:', error)
    alert('Failed to compress images. Please try again.')
  } finally {
    isCompressing.value = false
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
  previewUrls.value.splice(index, 1)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const handleUpload = async () => {
  if (selectedFiles.value.length === 0) return
  
  // Emit the upload event - the parent will handle progress updates
  emit('upload', selectedFiles.value, globalCaption.value || undefined, globalDate.value || undefined)
}

// Clean up preview URLs when component unmounts
onUnmounted(() => {
  previewUrls.value.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
})

// Handle escape key to close modal
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !uploading.value) {
      emit('close')
    }
  }
  window.addEventListener('keydown', handleEscape)
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
  })
})
</script>
