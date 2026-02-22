# Medical Guide App - Deployment Guide

## ✅ **COMPLETED LOCALLY**
- Full-stack authentication system
- User registration & login with JWT
- Password-protected accounts
- Medical cards syncing with database
- Multi-device ready
- PWA with offline support

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Deploy Backend to Railway**

1. Install Railway CLI:
   ```bash
   npm install -g @railway/cli
   ```

2. Login to Railway:
   ```bash
   railway login
   ```

3. Deploy backend:
   ```bash
   cd backend
   railway init
   railway up
   ```

4. Add environment variables in Railway dashboard:
   - Copy all variables from `.env.production`
   - **IMPORTANT**: Change `JWT_SECRET` to a new random string
   - Update `FRONTEND_URL` after deploying frontend

5. Run database migration:
   ```bash
   railway run npx prisma migrate deploy
   ```

6. Get your backend URL: `https://your-app.railway.app`

---

### **Step 2: Deploy Frontend to Vercel**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Update API URL in frontend:
   - Open `frontend/src/services/api.js`
   - Replace `http://localhost:3001/api` with `https://your-backend.railway.app/api`

3. Deploy frontend:
   ```bash
   cd frontend
   vercel --prod
   ```

4. Get your frontend URL: `https://your-app.vercel.app`

---

### **Step 3: Update CORS Settings**

1. Go back to Railway dashboard
2. Update `FRONTEND_URL` environment variable to your Vercel URL
3. Restart the backend service

---

### **Step 4: Test Production**

1. Visit your Vercel URL
2. Sign up with a new account
3. Create a medical card
4. Login from another device/browser
5. Verify cards sync across devices

---

## 📱 **INSTALL AS APP**

**Android:**
1. Open site in Chrome
2. Menu → "Install app"
3. Use like native app

**iPhone:**
1. Open site in Safari
2. Share → "Add to Home Screen"
3. Full-screen experience

---

## 🔐 **SECURITY CHECKLIST**

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens for authentication
- ✅ CORS restricted to your domain
- ✅ Database on Supabase (encrypted)
- ⚠️ Change JWT_SECRET before production
- ⚠️ Use HTTPS only in production

---

## 🎯 **CURRENT FEATURES**

- ✅ User authentication
- ✅ Cloud sync
- ✅ Multi-device support
- ✅ Rich text editor
- ✅ PDF export (single + bulk)
- ✅ Document upload (PDF/DOCX/images)
- ✅ AI card generation
- ✅ PWA offline support
- ✅ Mobile responsive

---

## 📞 **SUPPORT**

If you encounter issues:
1. Check Railway logs: `railway logs`
2. Check Vercel logs in dashboard
3. Verify environment variables
4. Ensure database migration ran successfully

---

**Both servers must be running for the app to work!**
- Backend: Handles authentication & data
- Frontend: User interface
- Database: Supabase PostgreSQL
