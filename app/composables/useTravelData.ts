import type { Trip, Expense, Photo } from '~/types'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc,
  getDoc,
  updateDoc,
  type Firestore 
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, type FirebaseStorage } from 'firebase/storage'

export const useTravelData = () => {
  const trips = useState<Trip[]>('trips', () => [])
  const expenses = useState<Record<string, Expense[]>>('expenses', () => ({}))
  const photos = useState<Record<string, Photo[]>>('photos', () => ({}))
  const loading = useState<boolean>('travel-data-loading', () => false)

  // Simple UUID generator for optimistic updates
  const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  // Get Firebase instances only on client side
  const getDb = () => {
    if (process.server) return null
    const { $db } = useNuxtApp()
    return $db as Firestore
  }

  const getStorage = () => {
    if (process.server) return null
    const { $storage } = useNuxtApp()
    return $storage as FirebaseStorage
  }

  const user = useFirebaseUser()

  const fetchTrips = async () => {
    if (!user.value) return
    const db = getDb()
    if (!db) return

    try {
      const tripsRef = collection(db, 'trips')
      const q = query(
        tripsRef, 
        where('userId', '==', user.value.uid),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)

      trips.value = querySnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          destination: data.destination,
          startDate: data.startDate,
          endDate: data.endDate,
          budget: data.budget,
          currency: data.currency,
          notes: data.notes,
          pictureUrl: data.pictureUrl,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        } as Trip
      })
    } catch (error) {
      console.error('Error fetching trips:', error)
    }
  }

  const fetchExpenses = async () => {
    if (!user.value) return
    const db = getDb()
    if (!db) return

    try {
      const expensesRef = collection(db, 'expenses')
      const q = query(expensesRef, where('userId', '==', user.value.uid))
      const querySnapshot = await getDocs(q)

      const newExpenses: Record<string, Expense[]> = {}
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (!newExpenses[data.tripId]) {
          newExpenses[data.tripId] = []
        }
        newExpenses[data.tripId]!.push({
          id: doc.id,
          tripId: data.tripId,
          description: data.description,
          amount: data.amount,
          currency: data.currency,
          exchangeRate: data.exchangeRate,
          date: data.date,
          category: data.category,
          paidBy: data.paidBy
        })
      })
      expenses.value = newExpenses
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  const fetchPhotos = async () => {
    if (!user.value) return
    const db = getDb()
    if (!db) return

    try {
      const photosRef = collection(db, 'photos')
      const q = query(
        photosRef, 
        where('userId', '==', user.value.uid),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)

      const newPhotos: Record<string, Photo[]> = {}
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        if (!newPhotos[data.tripId]) {
          newPhotos[data.tripId] = []
        }
        newPhotos[data.tripId]!.push({
          id: doc.id,
          tripId: data.tripId,
          url: data.url,
          caption: data.caption,
          date: data.date,
          createdAt: data.createdAt
        })
      })
      photos.value = newPhotos
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  const init = async () => {
    if (!user.value) return
    loading.value = true
    await Promise.all([fetchTrips(), fetchExpenses(), fetchPhotos()])
    loading.value = false
  }

  watch(user, () => {
    if (user.value) {
      init()
    } else {
      trips.value = []
      expenses.value = {}
      photos.value = {}
    }
  })

  const addTrip = async (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>, pictureFile?: File) => {
    if (!user.value) return null
    const db = getDb()
    const storage = getStorage()
    if (!db) return null

    // Optimistic update: Add temporary trip to UI immediately
    const tempId = generateTempId()
    const optimisticTrip: Trip = {
      id: tempId,
      userId: user.value.uid,
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
      currency: trip.currency,
      notes: trip.notes,
      pictureUrl: trip.pictureUrl,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    
    trips.value.push(optimisticTrip)
    expenses.value[tempId] = []

    try {
      const tripsRef = collection(db, 'trips')
      const now = Date.now()
      
      // Upload picture if provided
      let pictureUrl = trip.pictureUrl
      if (pictureFile && storage) {
        const pictureRef = storageRef(storage, `trip-pictures/${user.value.uid}/${tempId}/${pictureFile.name}`)
        await uploadBytes(pictureRef, pictureFile)
        pictureUrl = await getDownloadURL(pictureRef)
      }
      
      // Build document data, excluding undefined fields
      const tripData: any = {
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        currency: trip.currency,
        userId: user.value.uid,
        createdAt: now,
        updatedAt: now
      }
      
      // Only add optional fields if they have values
      if (trip.budget !== undefined) tripData.budget = trip.budget
      if (trip.notes !== undefined) tripData.notes = trip.notes
      if (pictureUrl) tripData.pictureUrl = pictureUrl
      
      const docRef = await addDoc(tripsRef, tripData)

      // Replace optimistic trip with real data from server
      const newTrip: Trip = {
        id: docRef.id,
        userId: user.value.uid,
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        currency: trip.currency,
        notes: trip.notes,
        pictureUrl: pictureUrl,
        createdAt: now,
        updatedAt: now
      }

      const index = trips.value.findIndex(t => t.id === tempId)
      if (index !== -1) {
        trips.value[index] = newTrip
      }
      
      // Move expenses to new ID
      expenses.value[newTrip.id] = expenses.value[tempId] || []
      delete expenses.value[tempId]

      return newTrip
    } catch (error) {
      // Rollback optimistic update
      trips.value = trips.value.filter(t => t.id !== tempId)
      delete expenses.value[tempId]
      console.error('Error adding trip:', error)
      throw error
    }
  }

  const getTrip = (id: string) => trips.value.find(t => t.id === id)

  /**
   * Fetch a single trip by ID (including trips the user doesn't own)
   * This is used for viewing shared trips
   */
  const fetchTripById = async (tripId: string) => {
    if (!user.value) return null
    const db = getDb()
    if (!db) return null

    try {
      const tripRef = doc(db, 'trips', tripId)
      const tripSnap = await getDoc(tripRef)
      
      if (!tripSnap.exists()) {
        return null
      }

      const data = tripSnap.data()
      const trip: Trip = {
        id: tripSnap.id,
        userId: data.userId,
        title: data.title,
        destination: data.destination,
        startDate: data.startDate,
        endDate: data.endDate,
        budget: data.budget,
        currency: data.currency,
        notes: data.notes,
        pictureUrl: data.pictureUrl,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }

      // Add to trips list if not already there
      const existingIndex = trips.value.findIndex(t => t.id === tripId)
      if (existingIndex === -1) {
        trips.value.push(trip)
      } else {
        trips.value[existingIndex] = trip
      }

      return trip
    } catch (error) {
      console.error('Error fetching trip:', error)
      return null
    }
  }

  /**
   * Fetch expenses for a specific trip (including trips the user doesn't own)
   */
  const fetchExpensesByTripId = async (tripId: string) => {
    if (!user.value) return
    const db = getDb()
    if (!db) return

    try {
      const expensesRef = collection(db, 'expenses')
      const q = query(expensesRef, where('tripId', '==', tripId))
      const querySnapshot = await getDocs(q)

      const tripExpenses: Expense[] = []
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        tripExpenses.push({
          id: doc.id,
          tripId: data.tripId,
          description: data.description,
          amount: data.amount,
          currency: data.currency,
          exchangeRate: data.exchangeRate,
          date: data.date,
          category: data.category,
          paidBy: data.paidBy
        })
      })
      
      expenses.value[tripId] = tripExpenses
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  /**
   * Fetch photos for a specific trip (including trips the user doesn't own)
   */
  const fetchPhotosByTripId = async (tripId: string) => {
    if (!user.value) return
    const db = getDb()
    if (!db) return

    try {
      const photosRef = collection(db, 'photos')
      const q = query(
        photosRef, 
        where('tripId', '==', tripId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)

      const tripPhotos: Photo[] = []
      querySnapshot.docs.forEach((doc) => {
        const data = doc.data()
        tripPhotos.push({
          id: doc.id,
          tripId: data.tripId,
          url: data.url,
          caption: data.caption,
          date: data.date,
          createdAt: data.createdAt
        })
      })
      
      photos.value[tripId] = tripPhotos
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  /**
   * Load a trip and all its data by ID (for viewing shared trips)
   */
  const loadTripData = async (tripId: string) => {
    const trip = await fetchTripById(tripId)
    if (trip) {
      await Promise.all([
        fetchExpensesByTripId(tripId),
        fetchPhotosByTripId(tripId)
      ])
    }
    return trip
  }

  const getTripExpenses = (tripId: string) => {
    return computed(() => {
      const exps = expenses.value[tripId] || []
      return [...exps].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0
        const dateB = b.date ? new Date(b.date).getTime() : 0
        if (dateA !== dateB) {
          return dateA - dateB
        }
        return b.amount - a.amount
      })
    })
  }

  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (!user.value) return null
    const db = getDb()
    if (!db) return null

    // Optimistic update: Add temporary expense to UI immediately
    const tempId = generateTempId()
    const optimisticExpense: Expense = {
      id: tempId,
      tripId: expense.tripId,
      description: expense.description,
      amount: expense.amount,
      currency: expense.currency,
      exchangeRate: expense.exchangeRate,
      date: expense.date,
      category: expense.category,
      paidBy: expense.paidBy
    }

    if (!expenses.value[expense.tripId]) {
      expenses.value[expense.tripId] = []
    }
    expenses.value[expense.tripId]!.push(optimisticExpense)

    try {
      const expensesRef = collection(db, 'expenses')
      
      // Build document data, excluding undefined fields
      const expenseData: any = {
        tripId: expense.tripId,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        userId: user.value.uid
      }
      
      // Only add optional fields if they have values
      if (expense.exchangeRate !== undefined) expenseData.exchangeRate = expense.exchangeRate
      if (expense.date !== undefined) expenseData.date = expense.date
      if (expense.paidBy !== undefined) expenseData.paidBy = expense.paidBy
      
      const docRef = await addDoc(expensesRef, expenseData)

      // Replace optimistic expense with real data from server
      const newExpense: Expense = {
        id: docRef.id,
        tripId: expense.tripId,
        description: expense.description,
        amount: expense.amount,
        currency: expense.currency,
        exchangeRate: expense.exchangeRate,
        date: expense.date,
        category: expense.category,
        paidBy: expense.paidBy
      }

      if (expenses.value[newExpense.tripId]) {
        const index = expenses.value[newExpense.tripId]!.findIndex(e => e.id === tempId)
        if (index !== -1) {
          expenses.value[newExpense.tripId]![index] = newExpense
        }
      }

      return newExpense
    } catch (error) {
      // Rollback optimistic update
      if (expenses.value[expense.tripId]) {
        expenses.value[expense.tripId] = expenses.value[expense.tripId]!.filter(e => e.id !== tempId)
      }
      console.error('Error adding expense:', error)
      throw error
    }
  }

  const deleteTrip = async (tripId: string) => {
    if (!user.value) return
    const db = getDb()
    if (!db) return

    // Optimistic update: Remove from UI immediately
    const deletedTrip = trips.value.find(t => t.id === tripId)
    const deletedExpenses = expenses.value[tripId] || []
    
    trips.value = trips.value.filter(t => t.id !== tripId)
    delete expenses.value[tripId]

    try {
      const tripRef = doc(db, 'trips', tripId)
      await deleteDoc(tripRef)

      // Also delete all expenses for this trip
      const expensesRef = collection(db, 'expenses')
      const q = query(expensesRef, where('tripId', '==', tripId))
      const querySnapshot = await getDocs(q)
      
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
    } catch (error) {
      // Rollback optimistic update
      if (deletedTrip) {
        trips.value.push(deletedTrip)
        expenses.value[tripId] = deletedExpenses
      }
      console.error('Error deleting trip:', error)
      throw error
    }
  }

  const deleteExpense = async (tripId: string, expenseId: string) => {
    if (!user.value) return
    const db = getDb()
    if (!db) return

    // Optimistic update: Remove from UI immediately
    let deletedExpense: Expense | undefined
    let deletedIndex = -1
    
    if (expenses.value[tripId]) {
      deletedIndex = expenses.value[tripId].findIndex(e => e.id === expenseId)
      if (deletedIndex !== -1) {
        deletedExpense = expenses.value[tripId][deletedIndex]
        expenses.value[tripId] = expenses.value[tripId].filter(e => e.id !== expenseId)
      }
    }

    try {
      const expenseRef = doc(db, 'expenses', expenseId)
      await deleteDoc(expenseRef)
    } catch (error) {
      // Rollback optimistic update
      if (deletedExpense && deletedIndex !== -1) {
        if (!expenses.value[tripId]) {
          expenses.value[tripId] = []
        }
        expenses.value[tripId].splice(deletedIndex, 0, deletedExpense)
      }
      console.error('Error deleting expense:', error)
      throw error
    }
  }

  const updateTrip = async (tripId: string, updates: Partial<Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>>, pictureFile?: File, removePicture?: boolean) => {
    if (!user.value) return
    const db = getDb()
    const storage = getStorage()
    if (!db) return

    // Find current trip for rollback
    const currentTrip = trips.value.find(t => t.id === tripId)
    if (!currentTrip) return

    // Optimistic update
    const index = trips.value.findIndex(t => t.id === tripId)
    if (index !== -1) {
      trips.value[index] = { ...currentTrip, ...updates, updatedAt: Date.now() }
    }

    try {
      const tripRef = doc(db, 'trips', tripId)
      const now = Date.now()
      
      // Handle picture upload or removal
      let pictureUrl = updates.pictureUrl
      if (pictureFile && storage) {
        // Upload new picture
        const pictureRef = storageRef(storage, `trip-pictures/${user.value.uid}/${tripId}/${pictureFile.name}`)
        await uploadBytes(pictureRef, pictureFile)
        pictureUrl = await getDownloadURL(pictureRef)
        
        // Delete old picture if it exists
        if (currentTrip.pictureUrl && storage) {
          try {
            const oldPictureRef = storageRef(storage, currentTrip.pictureUrl)
            await deleteObject(oldPictureRef)
          } catch (e) {
            console.warn('Could not delete old picture:', e)
          }
        }
      } else if (removePicture && currentTrip.pictureUrl && storage) {
        // Remove picture
        try {
          const oldPictureRef = storageRef(storage, currentTrip.pictureUrl)
          await deleteObject(oldPictureRef)
        } catch (e) {
          console.warn('Could not delete picture:', e)
        }
        pictureUrl = undefined
      }
      
      // Build update data, excluding undefined fields
      const updateData: any = { updatedAt: now }
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.destination !== undefined) updateData.destination = updates.destination
      if (updates.startDate !== undefined) updateData.startDate = updates.startDate
      if (updates.endDate !== undefined) updateData.endDate = updates.endDate
      if (updates.currency !== undefined) updateData.currency = updates.currency
      if (updates.budget !== undefined) updateData.budget = updates.budget
      if (updates.notes !== undefined) updateData.notes = updates.notes
      if (pictureUrl !== undefined) updateData.pictureUrl = pictureUrl
      if (removePicture) updateData.pictureUrl = null
      
      await updateDoc(tripRef, updateData)
      
      // Update local state with the picture URL
      if (index !== -1 && pictureUrl !== undefined) {
        trips.value[index] = { ...trips.value[index]!, pictureUrl }
      } else if (index !== -1 && removePicture) {
        trips.value[index] = { ...trips.value[index]!, pictureUrl: undefined }
      }
    } catch (error) {
      // Rollback optimistic update
      if (index !== -1) {
        trips.value[index] = currentTrip
      }
      console.error('Error updating trip:', error)
      throw error
    }
  }

  const updateExpense = async (tripId: string, expenseId: string, updates: Partial<Omit<Expense, 'id' | 'tripId'>>) => {
    if (!user.value) return
    const db = getDb()
    if (!db) return

    // Find current expense for rollback
    const currentExpenses = expenses.value[tripId]
    if (!currentExpenses) return
    
    const expenseIndex = currentExpenses.findIndex(e => e.id === expenseId)
    if (expenseIndex === -1) return
    
    const currentExpense = currentExpenses[expenseIndex]!

    // Optimistic update
    currentExpenses[expenseIndex] = { ...currentExpense, ...updates }

    try {
      const expenseRef = doc(db, 'expenses', expenseId)
      
      // Build update data, excluding undefined fields
      const updateData: any = {}
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.amount !== undefined) updateData.amount = updates.amount
      if (updates.currency !== undefined) updateData.currency = updates.currency
      if (updates.category !== undefined) updateData.category = updates.category
      if (updates.exchangeRate !== undefined) updateData.exchangeRate = updates.exchangeRate
      if (updates.date !== undefined) updateData.date = updates.date
      if (updates.paidBy !== undefined) updateData.paidBy = updates.paidBy
      
      await updateDoc(expenseRef, updateData)
    } catch (error) {
      // Rollback optimistic update
      if (expenses.value[tripId]) {
        expenses.value[tripId]![expenseIndex] = currentExpense
      }
      console.error('Error updating expense:', error)
      throw error
    }
  }

  const getTripPhotos = (tripId: string) => {
    return computed(() => {
      return photos.value[tripId] || []
    })
  }

  const addPhoto = async (photo: Omit<Photo, 'id' | 'createdAt'>) => {
    if (!user.value) return null
    const db = getDb()
    if (!db) return null

    // Optimistic update: Add temporary photo to UI immediately
    const tempId = generateTempId()
    const now = Date.now()
    const optimisticPhoto: Photo = {
      id: tempId,
      tripId: photo.tripId,
      url: photo.url,
      caption: photo.caption,
      date: photo.date,
      createdAt: now
    }

    if (!photos.value[photo.tripId]) {
      photos.value[photo.tripId] = []
    }
    photos.value[photo.tripId]!.unshift(optimisticPhoto) // Add to beginning for newest first

    try {
      const photosRef = collection(db, 'photos')
      
      // Build document data, excluding undefined fields
      const photoData: any = {
        tripId: photo.tripId,
        url: photo.url,
        userId: user.value.uid,
        createdAt: now
      }
      
      // Only add optional fields if they have values
      if (photo.caption !== undefined) photoData.caption = photo.caption
      if (photo.date !== undefined) photoData.date = photo.date
      
      const docRef = await addDoc(photosRef, photoData)

      // Replace optimistic photo with real data from server
      const newPhoto: Photo = {
        id: docRef.id,
        tripId: photo.tripId,
        url: photo.url,
        caption: photo.caption,
        date: photo.date,
        createdAt: now
      }

      if (photos.value[newPhoto.tripId]) {
        const index = photos.value[newPhoto.tripId]!.findIndex(p => p.id === tempId)
        if (index !== -1) {
          photos.value[newPhoto.tripId]![index] = newPhoto
        }
      }

      return newPhoto
    } catch (error) {
      // Rollback optimistic update
      if (photos.value[photo.tripId]) {
        photos.value[photo.tripId] = photos.value[photo.tripId]!.filter(p => p.id !== tempId)
      }
      console.error('Error adding photo:', error)
      throw error
    }
  }

  const uploadPhotos = async (
    tripId: string, 
    files: File[], 
    caption?: string, 
    date?: string,
    onProgress?: (progress: number, uploaded: number, total: number) => void
  ) => {
    if (!user.value) return []
    const storage = getStorage()
    const db = getDb()
    if (!storage || !db) return []

    const uploadedPhotos: Photo[] = []
    const totalFiles = files.length
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Create a unique file name
        const timestamp = Date.now()
        const fileName = `${user.value.uid}/${tripId}/${timestamp}_${file.name}`
        const fileRef = storageRef(storage, `photos/${fileName}`)
        
        // Upload file to Firebase Storage
        await uploadBytes(fileRef, file)
        
        // Get download URL
        const url = await getDownloadURL(fileRef)
        
        // Save photo metadata to Firestore
        const photoData: any = {
          tripId,
          url,
          userId: user.value.uid,
          createdAt: timestamp,
          storagePath: `photos/${fileName}` // Store path for deletion later
        }
        
        if (caption) photoData.caption = caption
        if (date) photoData.date = date
        
        const docRef = await addDoc(collection(db, 'photos'), photoData)
        
        const newPhoto: Photo = {
          id: docRef.id,
          tripId,
          url,
          caption,
          date,
          createdAt: timestamp
        }
        
        uploadedPhotos.push(newPhoto)
        
        // Add to state
        if (!photos.value[tripId]) {
          photos.value[tripId] = []
        }
        photos.value[tripId]!.unshift(newPhoto)
        
        // Report progress
        if (onProgress) {
          const progress = Math.round(((i + 1) / totalFiles) * 100)
          onProgress(progress, i + 1, totalFiles)
        }
      }
      
      return uploadedPhotos
    } catch (error) {
      console.error('Error uploading photos:', error)
      throw error
    }
  }

  const updatePhoto = async (tripId: string, photoId: string, updates: Partial<Omit<Photo, 'id' | 'tripId' | 'createdAt'>>) => {
    if (!user.value) return
    const db = getDb()
    if (!db) return

    // Find current photo for rollback
    const currentPhotos = photos.value[tripId]
    if (!currentPhotos) return
    
    const photoIndex = currentPhotos.findIndex(p => p.id === photoId)
    if (photoIndex === -1) return
    
    const currentPhoto = currentPhotos[photoIndex]!

    // Optimistic update
    currentPhotos[photoIndex] = { ...currentPhoto, ...updates }

    try {
      const photoRef = doc(db, 'photos', photoId)
      
      // Build update data, excluding undefined fields
      const updateData: any = {}
      if (updates.url !== undefined) updateData.url = updates.url
      if (updates.caption !== undefined) updateData.caption = updates.caption
      if (updates.date !== undefined) updateData.date = updates.date
      
      await updateDoc(photoRef, updateData)
    } catch (error) {
      // Rollback optimistic update
      if (photos.value[tripId]) {
        photos.value[tripId]![photoIndex] = currentPhoto
      }
      console.error('Error updating photo:', error)
      throw error
    }
  }

  const deletePhoto = async (tripId: string, photoId: string) => {
    if (!user.value) return
    const db = getDb()
    const storage = getStorage()
    if (!db) return

    // Optimistic update: Remove from UI immediately
    let deletedPhoto: Photo | undefined
    let deletedIndex = -1
    
    if (photos.value[tripId]) {
      deletedIndex = photos.value[tripId].findIndex(p => p.id === photoId)
      if (deletedIndex !== -1) {
        deletedPhoto = photos.value[tripId][deletedIndex]
        photos.value[tripId] = photos.value[tripId].filter(p => p.id !== photoId)
      }
    }

    try {
      // First get the photo document to retrieve storage path
      const photoRef = doc(db, 'photos', photoId)
      const photoQuery = query(collection(db, 'photos'), where('__name__', '==', photoId))
      const photoDoc = await getDocs(photoQuery)
      
      // Delete from Firestore
      await deleteDoc(photoRef)
      
      // If storage path exists, delete from Storage
      if (storage && photoDoc.docs.length > 0) {
        const photoData = photoDoc.docs[0]?.data()
        if (photoData?.storagePath) {
          try {
            const fileRef = storageRef(storage, photoData.storagePath)
            await deleteObject(fileRef)
          } catch (storageError) {
            // Ignore storage errors if file doesn't exist
            console.warn('Could not delete file from storage:', storageError)
          }
        }
      }
    } catch (error) {
      // Rollback optimistic update
      if (deletedPhoto && deletedIndex !== -1) {
        if (!photos.value[tripId]) {
          photos.value[tripId] = []
        }
        photos.value[tripId].splice(deletedIndex, 0, deletedPhoto)
      }
      console.error('Error deleting photo:', error)
      throw error
    }
  }

  return {
    trips,
    expenses,
    photos,
    loading,
    init,
    updateTrip,
    getTrip,
    getTripExpenses,
    getTripPhotos,
    addTrip,
    addExpense,
    addPhoto,
    uploadPhotos,
    updateExpense,
    updatePhoto,
    deleteTrip,
    deleteExpense,
    deletePhoto,
    fetchTripById,
    fetchExpensesByTripId,
    fetchPhotosByTripId,
    loadTripData,
    resetData: () => {
      trips.value = []
      expenses.value = {}
      photos.value = {}
    }
  }
}
