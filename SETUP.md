# 🚀 Grub Club Setup Guide

This guide will help you set up the Grub Club food delivery platform on your local machine.

## 📋 Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **MongoDB** (local or MongoDB Atlas)

## 🛠️ Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd grub-club
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

#### Option A: Automatic Setup (Recommended)
```bash
pnpm setup
```

This will automatically create a `.env.local` file with secure secrets and proper configuration.

#### Option B: Manual Setup
1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and update the following variables:
   ```env
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   MONGODB_URI=mongodb://localhost:27017/grubclub
   ```

### 4. Set Up MongoDB

#### Local MongoDB Setup

**macOS (using Homebrew):**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Windows:**
1. Download MongoDB from [mongodb.com](https://mongodb.com)
2. Install and start the MongoDB service

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

#### MongoDB Atlas Setup (Cloud Option)
1. Create an account at [mongodb.com](https://mongodb.com)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grubclub
   ```

### 5. Seed the Database

```bash
pnpm seed
```

This will create:
- 3 test users (student, restaurant owner, admin)
- 6 restaurants with full details
- Menu items for Spice Garden and Pizza Corner

### 6. Start Development Server

```bash
pnpm dev
```

Your application will be available at `http://localhost:3000`

## 🧪 Test Users

After seeding the database, you can use these test accounts:

| Role | Email | Password |
|------|-------|----------|
| Student | `rahul@thapar.edu` | `123456` |
| Restaurant Owner | `amit@spicegarden.com` | `123456` |
| Admin | `admin@grubclub.com` | `123456` |

## 📁 Project Structure

```
grub-club/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API Routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Role-based dashboards
│   └── ...
├── components/            # Reusable UI components
├── lib/                   # Utility functions
│   ├── db.ts             # MongoDB connection
│   └── seed.ts           # Database seeder
├── models/               # MongoDB models
├── scripts/              # Setup scripts
└── ...
```

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm seed` | Seed database with test data |
| `pnpm setup` | Set up environment variables |
| `pnpm lint` | Run ESLint |

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Restaurants
- `GET /api/restaurants` - List restaurants
- `GET /api/restaurants/[id]` - Get restaurant details

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `PATCH /api/orders/[id]` - Update order status

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

### Dashboards
- `GET /api/admin/dashboard` - Admin statistics
- `GET /api/restaurant/dashboard` - Restaurant owner analytics

## 🔒 Environment Variables

### Required Variables
- `JWT_SECRET` - Secret key for JWT tokens
- `MONGODB_URI` - MongoDB connection string

### Optional Variables (for future features)
- `AWS_*` - AWS S3 for file uploads
- `SMTP_*` - Email service configuration
- `RAZORPAY_*` - Payment gateway
- `GOOGLE_MAPS_API_KEY` - Maps integration
- `FIREBASE_*` - Push notifications
- `REDIS_URL` - Caching and sessions

## 🚀 Deployment

### Vercel (Recommended)
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard

### Other Platforms
- **Netlify**: Connect your GitHub repository
- **Railway**: Deploy with MongoDB Atlas
- **Heroku**: Add MongoDB add-on

## 🐛 Troubleshooting

### MongoDB Connection Issues
1. Ensure MongoDB is running:
   ```bash
   brew services list | grep mongodb
   ```

2. Check connection string format:
   ```env
   MONGODB_URI=mongodb://localhost:27017/grubclub
   ```

### Port Already in Use
If port 3000 is busy, Next.js will automatically use the next available port.

### Database Seeding Issues
1. Ensure MongoDB is running
2. Check your connection string
3. Clear existing data:
   ```bash
   # Connect to MongoDB shell
   mongosh
   use grubclub
   db.dropDatabase()
   ```

## 📞 Support

If you encounter any issues:

1. Check the [README.md](./README.md) for detailed documentation
2. Review the troubleshooting section above
3. Create an issue in the repository
4. Contact the development team

## 🎉 You're All Set!

Your Grub Club development environment is now ready! You can:

- Browse restaurants at `http://localhost:3000`
- Test user authentication
- Create and manage orders
- Access role-based dashboards
- Explore the API endpoints

Happy coding! 🚀 