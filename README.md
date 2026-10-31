# HaikyuuHeights - Broker-Free Real Estate Platform

A modern, full-stack MERN application that connects property buyers and sellers directly, eliminating broker fees and making real estate transactions transparent and affordable.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

## 🌟 Features

### For Buyers
- **Browse Properties**: Advanced search with filters (type, price, location, amenities)
- **Property Details**: High-quality images, detailed specifications, interactive maps
- **Book Visits**: Schedule property viewings directly with sellers
- **Favorites**: Save properties for later viewing
- **Messaging**: Direct communication with property owners
- **Reviews**: Read and write property reviews
- **Dashboard**: Track bookings, favorites, and reviews in one place

### For Sellers
- **List Properties**: Easy-to-use property listing with image uploads
- **Verification System**: Secure seller verification process
- **Manage Listings**: Edit, update, or remove properties
- **Booking Management**: Accept/reject visit requests
- **Commission Tracking**: Transparent 2.5% commission structure
- **Analytics**: View property performance and earnings
- **Messaging**: Respond to buyer inquiries

### For Admins
- **User Management**: Monitor and manage all users
- **Verification Control**: Approve/reject seller verification requests
- **Property Moderation**: Review and moderate property listings
- **Booking Oversight**: Monitor all booking transactions
- **Review Management**: Moderate user reviews
- **Commission Tracking**: Track platform earnings
- **Analytics Dashboard**: Platform-wide statistics and insights

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Hot Toast** - Toast notifications
- **React Leaflet** - Interactive maps
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Cloudinary** - Image hosting
- **Multer** - File upload handling
- **express-validator** - Input validation

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Cloudinary Account** - [Sign up](https://cloudinary.com/users/register/free) for image hosting

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/haikyuuheights.git
cd haikyuuheights
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# IMPORTANT: Update the following variables
```

**Required Environment Variables (server/.env):**

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.net/haikyuuheights?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_minimum_32_characters
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**How to get credentials:**

1. **MongoDB URI**: 
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a cluster
   - Click "Connect" → "Connect your application"
   - Copy the connection string and replace `<username>` and `<password>`

2. **Cloudinary Credentials**:
   - Sign up at [Cloudinary](https://cloudinary.com/users/register/free)
   - Go to Dashboard
   - Copy Cloud Name, API Key, and API Secret

3. **JWT Secret**:
   - Generate a strong random string (minimum 32 characters)
   - Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

```bash
# Start the backend server
npm run dev

# Server will run on http://localhost:5000
```

### 3. Frontend Setup

```bash
# Open a new terminal
# Navigate to client directory
cd client

# Install dependencies
npm install

# Create .env file (optional, defaults are fine for local development)
cp .env.example .env
```

**Optional Environment Variables (client/.env):**

```env
VITE_API_URL=http://localhost:5000/api
```

```bash
# Start the development server
npm run dev

# Client will run on http://localhost:5173
```

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **API Documentation**: http://localhost:5000/api-docs (if implemented)

## 👤 Default Admin Account

After seeding the database (if seeds are implemented), use:

```
Email: admin@haikyuuheights.com
Password: admin123
```

**⚠️ IMPORTANT**: Change the admin password immediately in production!

## 📁 Project Structure

```
haikyuuheights/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── assets/        # Images, fonts, etc.
│   │   ├── components/    # Reusable components
│   │   │   ├── booking/   # Booking related components
│   │   │   ├── common/    # Shared components (Badge, Modal, etc.)
│   │   │   ├── messaging/ # Chat components
│   │   │   ├── property/  # Property components
│   │   │   └── review/    # Review components
│   │   ├── features/      # Redux slices
│   │   │   ├── auth/
│   │   │   ├── booking/
│   │   │   ├── property/
│   │   │   └── ...
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   │   ├── admin/     # Admin pages
│   │   │   ├── buyer/     # Buyer pages
│   │   │   ├── public/    # Public pages
│   │   │   └── seller/    # Seller pages
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── .env.example       # Environment variables template
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Node.js backend
│   ├── config/           # Configuration files
│   │   ├── cloudinary.js
│   │   └── database.js
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── propertyController.js
│   │   ├── bookingController.js
│   │   └── ...
│   ├── middleware/       # Express middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── upload.js
│   │   └── validation.js
│   ├── models/           # Mongoose models
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── Booking.js
│   │   └── ...
│   ├── routes/           # API routes
│   │   ├── authRoutes.js
│   │   ├── propertyRoutes.js
│   │   └── ...
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── .env.example      # Environment variables template
│   ├── package.json
│   └── server.js         # Entry point
│
└── README.md             # This file
```

## 🔑 User Roles & Permissions

### Buyer
- Browse and search properties
- View property details
- Book property visits
- Favorite properties
- Message sellers
- Write reviews
- Manage profile

### Seller
- All buyer permissions
- List properties (after verification)
- Edit/delete own properties
- Manage booking requests
- View commission summary
- Seller verification required

### Admin
- Full platform access
- User management
- Property moderation
- Verification management
- Commission tracking
- Platform analytics

## 💰 Commission Structure

- **Platform Commission**: 2.5% on successful transactions
- **Charged To**: Both buyer and seller (2.5% each)
- **Payment Processing**: 7-10 business days
- **Transparency**: Full commission breakdown visible to users

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Protected routes and API endpoints
- Role-based access control (RBAC)
- Secure file upload handling
- CORS configuration
- Environment variable protection

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Properties
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create property (seller only)
- `PUT /api/properties/:id` - Update property (seller only)
- `DELETE /api/properties/:id` - Delete property (seller only)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/confirm` - Confirm booking (seller)
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Reviews
- `GET /api/reviews/property/:id` - Get property reviews
- `POST /api/reviews` - Create review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversation/:id` - Get messages
- `POST /api/messages` - Send message

### Seller Verification
- `POST /api/verification` - Submit verification
- `GET /api/verification/status` - Get verification status
- `PUT /api/verification/:id/approve` - Approve (admin only)

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get platform statistics
- `PUT /api/admin/users/:id/status` - Update user status

*For complete API documentation, refer to the backend route files.*

## 🧪 Testing

### Backend Testing
```bash
cd server
npm test
```

### Frontend Testing
```bash
cd client
npm test
```

## 🏗️ Building for Production

### Frontend Build
```bash
cd client
npm run build
# Build output will be in client/dist/
```

### Backend Setup
```bash
cd server
# Update .env with production values
NODE_ENV=production
# Use PM2 or similar for process management
pm2 start server.js --name haikyuuheights-api
```

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)

**Vercel:**
```bash
cd client
vercel --prod
```

**Netlify:**
```bash
cd client
npm run build
netlify deploy --prod --dir=dist
```

### Backend Deployment (Render/Railway/Heroku)

**Environment Variables Required:**
- Set all variables from `.env.example`
- Update `CLIENT_URL` to your frontend URL
- Set `NODE_ENV=production`

**Render:**
1. Create new Web Service
2. Connect repository
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables

### Database (MongoDB Atlas)
1. Whitelist deployment server IP
2. Update connection string in environment variables

## 🐛 Troubleshooting

### Common Issues

**Issue**: MongoDB connection failed
- **Solution**: Check MongoDB URI in `.env`, verify network access in Atlas

**Issue**: Images not uploading
- **Solution**: Verify Cloudinary credentials, check file size limits

**Issue**: CORS errors
- **Solution**: Update `CLIENT_URL` in backend `.env`

**Issue**: JWT authentication failing
- **Solution**: Ensure JWT_SECRET is set and consistent

**Issue**: Port already in use
- **Solution**: Change PORT in `.env` or kill existing process

### Clear Cache
```bash
# Frontend
cd client
rm -rf node_modules package-lock.json
npm install

# Backend
cd server
rm -rf node_modules package-lock.json
npm install
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Inspiration from modern real estate platforms
- Built with modern web technologies
- Community feedback and contributions

## 📞 Support

For support, email support@haikyuuheights.com or join our Slack channel.

## 🔮 Future Enhancements

- [ ] Virtual property tours (360° images)
- [ ] AI-powered property recommendations
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration
- [ ] Document verification automation
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Property comparison feature
- [ ] Mortgage calculator

## 📊 Project Status

**Current Version**: 1.0.0

**Status**: ✅ Production Ready

---

**Made with ❤️ by the HaikyuuHeights Team**
