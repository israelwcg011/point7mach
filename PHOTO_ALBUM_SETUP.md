# Photo Album Feature - Firebase Setup

## Firebase Storage Setup

### 1. Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Storage** in the left sidebar
4. Click **Get Started**
5. Choose your security rules (we'll update them later)
6. Select a storage location (use the same region as your Firestore)

### 2. Deploy Storage Rules

The storage rules are defined in `storage.rules`. Deploy them using:

```bash
firebase deploy --only storage
```

Storage rules ensure:
- Users can only access their own photos
- Maximum file size is 10MB
- Only image files are allowed
- Proper folder structure: `photos/{userId}/{tripId}/{fileName}`

## Firestore Collection Structure

### Collection: `photos`

```javascript
{
  id: string (auto-generated),
  tripId: string (reference to trips collection),
  url: string (Firebase Storage download URL),
  storagePath: string (path to file in Storage for deletion),
  caption: string (optional),
  date: string (ISO 8601 date, optional),
  createdAt: number (timestamp),
  userId: string (reference to users collection)
}
```

## Firestore Security Rules

Add these rules to your `firestore.rules` file to secure photo access:

```javascript
// Photos collection rules
match /photos/{photoId} {
  // Allow users to read their own photos
  allow read: if request.auth != null && resource.data.userId == request.auth.uid;
  
  // Allow users to create photos for their own trips
  allow create: if request.auth != null 
    && request.resource.data.userId == request.auth.uid
    && request.resource.data.tripId != null
    && request.resource.data.url != null
    && request.resource.data.createdAt is number;
  
  // Allow users to update their own photos
  allow update: if request.auth != null && resource.data.userId == request.auth.uid;
  
  // Allow users to delete their own photos
  allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
}
```

## Firestore Indexes

Add this composite index for efficient querying in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "photos",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```

## Setup Steps

1. **Enable Firebase Storage**: 
   - Follow the steps above to enable Storage in your Firebase Console
   - Choose the same region as your Firestore database

2. **Deploy Storage Rules**:
   - Rules are defined in `storage.rules`
   - Deploy using: `firebase deploy --only storage`

3. **Update Firestore Rules**:
   - Photo rules are already in `firestore.rules`
   - Deploy using: `firebase deploy --only firestore:rules`

4. **Create Firestore Indexes**:
   - Index configuration is in `firestore.indexes.json`
   - Deploy using: `firebase deploy --only firestore:indexes`
   - Or Firebase will prompt you to create it when needed

5. **Deploy Everything** (recommended):
   ```bash
   firebase deploy
   ```

## Features Included

✅ **Direct File Upload**: Upload photos directly from your device
✅ **Multiple File Upload**: Upload multiple photos at once
✅ **Drag & Drop**: Drag photos into the upload area
✅ **File Validation**: Only images up to 10MB each
✅ **Masonry Grid Layout**: Beautiful responsive photo gallery  
✅ **Dark Theme UI**: Immersive full-screen album experience
✅ **Photo Management**: Edit captions, dates, and delete photos
✅ **Real-time Updates**: Optimistic UI with Firebase sync
✅ **User Isolation**: Each user only sees their own photos
✅ **Trip Association**: Photos are linked to specific trips
✅ **Storage Optimization**: Files stored in Firebase Storage
✅ **Automatic Cleanup**: Deleting photos also removes files from Storage

## How to Use

### Accessing the Photo Album

1. Navigate to any trip in your travel planner
2. Click the **📸 View Photo Album** button in the trip header
3. You'll be taken to a full-screen dark-themed gallery

### Uploading Photos

1. Click **Upload Photos** in the sidebar
2. Either:
   - Click to browse and select files from your device
   - Drag and drop photos into the upload area
3. Select multiple photos at once (they'll all be uploaded together)
4. Optionally add:
   - **Caption**: A description that applies to all photos
   - **Date**: A date that applies to all photos
5. Preview your photos before uploading
6. Click **Upload X Photos** to upload them to Firebase

### Photo Requirements

- **File Types**: JPG, PNG, GIF, WEBP
- **Maximum Size**: 10MB per photo
- **Multiple Upload**: Yes, upload many at once

## Future Enhancements (Optional)

- [ ] Full-screen photo viewer/lightbox
- [ ] Individual captions per photo during upload
- [ ] Photo sorting and filtering
- [ ] Photo albums within trips
- [ ] Social sharing
- [ ] Image compression/optimization
- [ ] Bulk download album
