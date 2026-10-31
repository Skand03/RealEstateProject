# 🚀 HaikyuuHeights - Quick Start Guide

Get your HaikyuuHeights real estate platform running in 5 minutes!

## ⚡ Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js v16+ installed ([Download](https://nodejs.org/))
- ✅ MongoDB Atlas account ([Sign up](https://www.mongodb.com/cloud/atlas))
- ✅ Cloudinary account ([Sign up](https://cloudinary.com/users/register/free))

---

## 🎯 5-Minute Setup

### Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
cd HaikyuuHeights

# Install backend dependencies
cd server
npm install

# Install frontend dependencies (in new terminal)
cd ../client
npm install
```

### Step 2: Configure Backend (2 minutes)

```bash
# In server directory
cd server
cp .env.example .env
```

**Edit server/.env with your credentials:**

```env
# Required - Get from MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/haikyuuheights

# Required - Generate random string
JWT_SECRET=your_super_secret_minimum_32_chars

# Required - Get from Cloudinary Dashboard
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional - defaults are fine for development
PORT=5000
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**🔑 Quick Credential Setup:**

**MongoDB Atlas:**
1. Go to https://cloud.mongodb.com
2. Create account → Create Cluster (free tier)
3. Click "Connect" → "Connect your application"
4. Copy connection string, replace `<username>` and `<password>`

**Cloudinary:**
1. Go to https://cloudinary.com/console
2. Dashboard shows: Cloud Name, API Key, API Secret
3. Copy all three values

**JWT Secret:**
```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Start Application (1 minute)

```bash
# Terminal 1 - Start Backend
cd server
npm run dev
# ✅ Backend running on http://localhost:5000

# Terminal 2 - Start Frontend
cd client
npm run dev
# ✅ Frontend running on http://localhost:5173
```

### Step 4: Access & Test

Open browser: **http://localhost:5173**

---

## 👤 Test Accounts

### Register New Users
1. Go to http://localhost:5173/register
2. Create accounts with different roles:
   - **Buyer**: Browse and book properties
   - **Seller**: List and manage properties (requires verification)
   - **Admin**: Full platform access

### First Admin User
After registration, you'll need to manually set admin role in MongoDB:

```javascript
// MongoDB Compass or Shell
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "ADMIN" } }
)
```

---

## 🎯 Quick Feature Test

### Test as Buyer
1. **Register** → Select "Buyer" role
2. **Browse Properties** → Use search and filters
3. **View Details** → Click any property
4. **Book Visit** → Schedule a viewing
5. **Add to Favorites** → Save properties
6. **Write Review** → After booking

### Test as Seller
1. **Register** → Select "Seller" role
2. **Complete Verification** → Upload documents
3. **Add Property** → Create new listing
4. **Manage Bookings** → Accept/reject requests
5. **View Commission** → Check earnings
6. **Message Buyers** → Chat feature

### Test as Admin
1. **Set admin role** (see above)
2. **User Management** → View all users
3. **Approve Verification** → Review sellers
4. **Moderate Properties** → Check listings
5. **View Analytics** → Platform stats

---

## 🐛 Common Issues & Fixes

### Issue: Backend won't start
```bash
# Check if MongoDB URI is correct
# Ensure all env variables are set
# Check if port 5000 is available
```

### Issue: Frontend won't connect to backend
```bash
# Verify backend is running on port 5000
# Check VITE_API_URL in client/.env
# Default: http://localhost:5000/api
```

### Issue: Images won't upload
```bash
# Verify Cloudinary credentials in server/.env
# Check file size (max 5MB per image)
# Ensure file type is JPG, PNG, or WEBP
```

### Issue: "Scripts disabled" error (Windows)
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📱 Project Structure Overview

```
HaikyuuHeights/
├── client/              # React Frontend
│   ├── src/
│   │   ├── pages/      # All page components
│   │   ├── components/ # Reusable components
│   │   ├── features/   # Redux slices
│   │   └── services/   # API calls
│   └── .env            # Frontend config
│
├── server/              # Node.js Backend
│   ├── models/         # MongoDB schemas
│   ├── controllers/    # Route handlers
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth, validation
│   └── .env            # Backend config
│
└── README.md           # Full documentation
```

---

## 🔗 Important URLs

| Service | URL | Notes |
|---------|-----|-------|
| Frontend | http://localhost:5173 | Main application |
| Backend API | http://localhost:5000/api | REST API |
| MongoDB Atlas | https://cloud.mongodb.com | Database |
| Cloudinary | https://cloudinary.com/console | Image hosting |

---

## 🛠️ Development Workflow

### Making Changes

**Frontend:**
```bash
cd client
# Changes auto-reload with Vite HMR
```

**Backend:**
```bash
cd server
# Changes auto-reload with nodemon
```

### Adding Dependencies

```bash
# Frontend
cd client
npm install package-name

# Backend
cd server
npm install package-name
```

### Stopping Servers

Press `Ctrl + C` in each terminal

---

## 📚 Learn More

- **Full Documentation**: See [README.md](README.md)
- **Project Summary**: See [PROJECT_COMPLETION_SUMMARY.md](PROJECT_COMPLETION_SUMMARY.md)
- **API Endpoints**: Check backend route files in `server/routes/`
- **Component Docs**: Browse `client/src/components/`

---

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] MongoDB Atlas account created
- [ ] Cloudinary account created
- [ ] Backend .env configured
- [ ] Dependencies installed (both client & server)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can register new user
- [ ] Can login successfully

---

## 🎉 Next Steps

1. **Customize Branding**: Update colors, logo, company info
2. **Add Content**: Create sample properties, users
3. **Test Features**: Try all user flows
4. **Configure Email**: Set up email service for notifications
5. **Deploy**: Follow deployment guide in README.md

---

## 💡 Pro Tips

- **Use MongoDB Compass**: Visual interface for database
- **Use Postman**: Test API endpoints directly
- **Use Redux DevTools**: Debug state management
- **Use React DevTools**: Inspect component hierarchy
- **Check Console**: Browser console for frontend errors
- **Check Terminal**: Backend terminal for API errors

---

## 🆘 Need Help?

1. **Check README.md**: Comprehensive documentation
2. **Review Code Comments**: Inline explanations
3. **Check .env.example**: Required environment variables
4. **Browser Console**: Frontend error messages
5. **Terminal Output**: Backend error messages

---

## 🎯 Platform Overview

**HaikyuuHeights** is a broker-free real estate platform featuring:

- 🏠 Property listings with advanced search
- 📅 Visit booking system
- 💬 Real-time messaging
- ⭐ Review and rating system
- ✓ Seller verification
- 💰 Commission tracking (2.5%)
- 👥 Multi-role system (Buyer, Seller, Admin)
- 📱 Fully responsive design
- 🔐 Secure authentication

---

**Ready to revolutionize real estate? Let's go! 🚀**

---
