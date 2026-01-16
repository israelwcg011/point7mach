# Deployment Guide - Travel Plan Website

This guide covers deploying your application to production securely.

## 🎯 Quick Start

```bash
# 1. Run security check
./scripts/pre-deploy-check.sh

# 2. Deploy Firebase rules
firebase deploy --only firestore:rules,storage

# 3. Build and deploy
pnpm build
# Then deploy to your chosen platform
```

---

## 📋 Pre-Deployment Checklist

### 1. Environment Variables

Create a `.env` file with your actual Firebase credentials:

```bash
NUXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NUXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

**⚠️ NEVER commit `.env` to Git!**

---

## 🔥 Firebase Setup

### 1. Deploy Security Rules

```bash
# Login to Firebase
firebase login

# Initialize (if not done)
firebase init

# Deploy rules
firebase deploy --only firestore:rules,storage
```

### 2. Configure Firebase Console

1. **Authentication**
   - Enable Email/Password provider
   - Enable email enumeration protection
   - Add authorized domains for production

2. **Firestore Database**
   - Verify rules are deployed
   - Set up automated backups:
     ```bash
     gcloud firestore export gs://[YOUR_BUCKET]/backups
     ```

3. **Storage**
   - Verify rules are deployed
   - Set CORS if needed:
     ```json
     [
       {
         "origin": ["https://yourdomain.com"],
         "method": ["GET", "POST", "DELETE"],
         "maxAgeSeconds": 3600
       }
     ]
     ```

4. **App Check (Recommended)**
   - Go to Build → App Check
   - Register your web app
   - Enable reCAPTCHA v3

---

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables in Vercel:**
1. Go to Project Settings → Environment Variables
2. Add all `NUXT_PUBLIC_FIREBASE_*` variables
3. Redeploy

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

**Environment Variables in Netlify:**
1. Site Settings → Build & deploy → Environment
2. Add all variables
3. Redeploy

### Option 3: Firebase Hosting

```bash
# Build
pnpm build

# Deploy
firebase deploy --only hosting
```

**Firebase Hosting Config** (`firebase.json`):
```json
{
  "hosting": {
    "public": ".output/public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          }
        ]
      }
    ]
  }
}
```

### Option 4: Custom Server (VPS/Cloud)

```bash
# Build
pnpm build

# Start production server
node .output/server/index.mjs
```

**Recommended: Use PM2**
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start .output/server/index.mjs --name travel-app

# Save configuration
pm2 save
pm2 startup
```

---

## 🔒 Post-Deployment Security

### 1. Verify HTTPS

```bash
curl -I https://yourdomain.com
# Should show: "HTTP/2 200" or "HTTP/1.1 200"
# Should NOT redirect from HTTPS to HTTP
```

### 2. Test Security Headers

```bash
curl -I https://yourdomain.com
# Should include:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# X-XSS-Protection: 1; mode=block
```

### 3. Test Authentication

1. Try accessing `/trips` without login → should redirect to `/login`
2. Login with valid credentials
3. Try accessing another user's trip → should show read-only

### 4. Test File Upload

1. Upload a 5MB image → should succeed
2. Upload an 11MB image → should fail
3. Upload a .txt file → should fail (images only)

### 5. Monitor Firebase

- Check Firebase Console → Usage tab
- Set up billing alerts
- Monitor for unusual activity

---

## 📊 Monitoring Setup

### 1. Firebase Monitoring (Built-in)

- Navigate to Firebase Console
- Go to each service (Auth, Firestore, Storage)
- Review usage and errors

### 2. Error Tracking (Optional - Sentry)

```bash
# Install Sentry
pnpm add @sentry/vue @sentry/vite-plugin
```

**In `plugins/sentry.client.ts`:**
```typescript
import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: 'YOUR_SENTRY_DSN',
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.2,
  })
})
```

### 3. Analytics (Optional - Google Analytics)

```bash
pnpm add @nuxtjs/google-analytics
```

---

## 🔧 Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .nuxt .output node_modules
pnpm install
pnpm build
```

### Firebase Rules Not Working

```bash
# Verify deployment
firebase deploy --only firestore:rules,storage

# Check Firebase Console → Rules tab
# Ensure "Published" date is recent
```

### Images Not Loading

1. Check Storage CORS configuration
2. Verify Storage rules are deployed
3. Check browser console for errors

### Authentication Issues

1. Verify authorized domains in Firebase Console
2. Check environment variables are set correctly
3. Clear browser cache and cookies

---

## 📈 Performance Optimization

### 1. Enable Caching

Add to `nuxt.config.ts`:
```typescript
routeRules: {
  '/': { prerender: true },
  '/login': { prerender: true },
  '/profile': { ssr: false },
  '/trips/**': { ssr: false }
}
```

### 2. Image Optimization

Already implemented:
- Images compressed before upload
- Lazy loading in galleries

### 3. CDN Configuration

Firebase Storage acts as CDN automatically.
For additional CDN (Cloudflare):
1. Point domain to your hosting
2. Enable Cloudflare proxy
3. Set cache rules

---

## 🎯 Production Best Practices

### DO:
- ✅ Use environment variables for all configs
- ✅ Enable HTTPS everywhere
- ✅ Set up automated backups
- ✅ Monitor error logs daily (first week)
- ✅ Test thoroughly before launch
- ✅ Keep dependencies updated
- ✅ Use latest stable versions

### DON'T:
- ❌ Commit `.env` to Git
- ❌ Use placeholder values in production
- ❌ Disable security rules "temporarily"
- ❌ Share Firebase credentials publicly
- ❌ Skip testing authentication flow
- ❌ Ignore Firebase quota warnings

---

## 📞 Emergency Procedures

### If Site is Compromised:

1. **Immediate Actions:**
   ```bash
   # Disable the site
   firebase hosting:disable
   
   # Revoke all sessions
   # Go to Firebase Console → Authentication → Users
   # Delete suspicious users
   ```

2. **Investigate:**
   - Check Firebase Console logs
   - Review recent changes
   - Check for unauthorized users

3. **Recovery:**
   - Restore from backup
   - Update all credentials
   - Review and update security rules
   - Enable App Check

### If Database is Corrupted:

```bash
# Restore from backup
gcloud firestore import gs://[BUCKET]/backups/[DATE]
```

---

## 🎉 Launch Checklist

Final checks before going live:

- [ ] Environment variables configured
- [ ] Firebase rules deployed
- [ ] HTTPS enabled and working
- [ ] All features tested in production
- [ ] Error monitoring set up
- [ ] Backups configured
- [ ] Team members have necessary access
- [ ] Documentation updated
- [ ] Domain DNS configured
- [ ] SSL certificate valid
- [ ] Security headers verified
- [ ] Performance tested
- [ ] Mobile responsiveness checked
- [ ] Cross-browser testing done
- [ ] Billing alerts configured

---

## 📚 Additional Resources

- [Nuxt Deployment Docs](https://nuxt.com/docs/getting-started/deployment)
- [Firebase Hosting Guide](https://firebase.google.com/docs/hosting)
- [Security Best Practices](./SECURITY_AUDIT.md)
- [Firebase Console](https://console.firebase.google.com)

---

## 🆘 Support

If you encounter issues:

1. Check `SECURITY_AUDIT.md` for common problems
2. Review Firebase Console error logs
3. Check browser console for client-side errors
4. Review hosting platform logs

---

*Good luck with your deployment! 🚀*
