# Firebase Migration Guide

## Migration Complete! 🎉

Your travel plan website has been successfully migrated from Supabase to Firebase.

## What Was Changed

### 1. Dependencies
- ✅ Installed: `firebase`, `vuefire`
- ✅ Removed: `@nuxtjs/supabase`, `@supabase/supabase-js`, `supabase`

### 2. Configuration Files
- ✅ Created: [app/plugins/firebase.client.ts](app/plugins/firebase.client.ts) - Firebase initialization plugin
- ✅ Updated: [nuxt.config.ts](nuxt.config.ts) - Removed Supabase module, added Firebase runtime config
- ✅ Created: [.env.example](.env.example) - Firebase environment variables template

### 3. Composables
- ✅ Created: [app/composables/useFirebaseUser.ts](app/composables/useFirebaseUser.ts) - Get current user
- ✅ Created: [app/composables/useFirebaseAuth.ts](app/composables/useFirebaseAuth.ts) - Auth operations
- ✅ Updated: [app/composables/useTravelData.ts](app/composables/useTravelData.ts) - Migrated to Firestore

### 4. Pages & Components
- ✅ Updated: [app/pages/login.vue](app/pages/login.vue) - Firebase authentication
- ✅ Updated: [app/pages/profile.vue](app/pages/profile.vue) - Firebase user updates
- ✅ Updated: [app/layouts/default.vue](app/layouts/default.vue) - Firebase user state
- ✅ Updated: [app/middleware/auth.global.ts](app/middleware/auth.global.ts) - Firebase auth check

## Next Steps

### 1. Set up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Authentication** → Email/Password provider
4. Enable **Firestore Database** (start in production mode or test mode)

### 2. Configure Environment Variables
Create a `.env` file in your project root with your Firebase credentials:

\`\`\`bash
NUXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NUXT_PUBLIC_FIREBASE_APP_ID=your-app-id
\`\`\`

You can find these values in Firebase Console → Project Settings → General → Your apps → SDK setup and configuration

### 3. Set up Firestore Security Rules
In Firebase Console → Firestore Database → Rules, add these security rules:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Trips collection - users can only access their own trips
    match /trips/{tripId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Expenses collection - users can only access their own expenses
    match /expenses/{expenseId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
\`\`\`

### 4. Create Firestore Indexes
For better query performance, create these composite indexes in Firebase Console → Firestore Database → Indexes:

- Collection: `trips`
  - Fields: `userId` (Ascending), `createdAt` (Descending)
  
- Collection: `expenses`
  - Fields: `userId` (Ascending), `tripId` (Ascending)

### 5. Migrate Existing Data (Optional)
If you have existing data in Supabase, you'll need to migrate it to Firestore. The structure mapping is:

**Supabase → Firestore:**
- \`trips\` table → \`trips\` collection
  - \`user_id\` → \`userId\`
  - \`start_date\` → \`startDate\`
  - \`end_date\` → \`endDate\`
  - \`created_at\` → \`createdAt\` (as timestamp in milliseconds)
  - \`updated_at\` → \`updatedAt\` (as timestamp in milliseconds)

- \`expenses\` table → \`expenses\` collection
  - \`trip_id\` → \`tripId\`
  - \`user_id\` → \`userId\`
  - \`exchange_rate\` → \`exchangeRate\`
  - \`paid_by\` → \`paidBy\`

### 6. Test the Application
\`\`\`bash
pnpm dev
\`\`\`

1. Test user registration (you may need to add a signup page)
2. Test login functionality
3. Test creating trips and expenses
4. Test password update in profile
5. Test logout

## Key Differences: Supabase vs Firebase

| Feature | Supabase | Firebase |
|---------|----------|----------|
| User Object | \`user.id\` | \`user.uid\` |
| User Email | \`user.email\` | \`user.email\` |
| Real-time Updates | Built-in | Requires listeners |
| Auth State | \`useSupabaseUser()\` | \`useFirebaseUser()\` |
| Database Queries | SQL-like | NoSQL (Firestore) |

## Troubleshooting

### Authentication Issues
- Make sure Email/Password authentication is enabled in Firebase Console
- Check that environment variables are correctly set
- Clear browser cache and localStorage

### Database Issues
- Verify Firestore security rules are properly configured
- Check that indexes are created for compound queries
- Ensure \`userId\` field is included in all document writes

### Development Issues
- Run \`pnpm install\` to ensure all dependencies are installed
- Delete \`.nuxt\` folder and restart dev server if you encounter build issues
- Check browser console for detailed error messages

## Need Help?
- [Firebase Documentation](https://firebase.google.com/docs)
- [VueFire Documentation](https://vuefire.vuejs.org/)
- [Nuxt 3 Documentation](https://nuxt.com/)

---

**Migration completed successfully!** Your app is now powered by Firebase. 🚀
