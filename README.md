# Grub Club - Food Delivery Platform

A comprehensive food delivery platform built for Thapar University using Next.js 15 with file-based API routing.

## 🚀 Features

- **Multi-role Authentication**: Students, Restaurant Owners, and Admins
- **Restaurant Management**: Browse, search, and filter restaurants
- **Order Management**: Real-time order tracking and status updates
- **Menu Management**: Dynamic menu items with categories
- **Admin Dashboard**: Platform analytics and restaurant approvals
- **Restaurant Dashboard**: Order management and analytics
- **User Profiles**: Profile management and order history

## 🏗️ Architecture

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **React Hook Form** with Zod validation

### Backend (API Routes)
- **Next.js API Routes** with file-based routing
- **JWT Authentication** with role-based access control
- **Zod** for request validation
- **bcryptjs** for password hashing
- **MongoDB** with Mongoose ODM
- **Database Seeding** for initial data

## 📁 Project Structure

```
grub-club/
├── app/
│   ├── api/                    # Backend API Routes
│   │   ├── auth/              # Authentication endpoints
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── restaurants/       # Restaurant management
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   ├── orders/           # Order management
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   ├── admin/            # Admin endpoints
│   │   │   └── dashboard/
│   │   ├── restaurant/       # Restaurant owner endpoints
│   │   │   └── dashboard/
│   │   └── user/             # User endpoints
│   │       └── profile/
│   ├── auth/                 # Frontend auth pages
│   ├── dashboard/            # Role-based dashboards
│   ├── restaurant/           # Restaurant pages
│   └── restaurants/          # Restaurant listing
├── components/               # Reusable UI components
├── lib/                      # Utility functions
│   └── auth.ts              # Authentication utilities
└── public/                   # Static assets
```

## 🔐 Authentication

### User Roles
- **user**: Students who can order food
- **restaurant_owner**: Restaurant owners who manage their restaurants
- **admin**: Platform administrators

### JWT Token Structure
```json
{
  "userId": "string",
  "email": "string",
  "role": "user|restaurant_owner|admin",
  "iat": "number",
  "exp": "number"
}
```

## 📡 API Endpoints

### Authentication
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
```

### Restaurants
```
GET  /api/restaurants       # Get all restaurants (with filters)
GET  /api/restaurants/[id]  # Get restaurant details and menu
```

### Orders
```
GET  /api/orders            # Get user orders (authenticated)
POST /api/orders            # Create new order (authenticated)
GET  /api/orders/[id]       # Get order details (authenticated)
PATCH /api/orders/[id]      # Update order status (restaurant owner/admin)
```

### User Management
```
GET  /api/user/profile      # Get user profile (authenticated)
PUT  /api/user/profile      # Update user profile (authenticated)
```

### Admin Dashboard
```
GET  /api/admin/dashboard   # Get platform statistics (admin only)
```

### Restaurant Dashboard
```
GET  /api/restaurant/dashboard  # Get restaurant statistics (restaurant owner only)
```

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd grub-club

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables
```env
# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# MongoDB Database
MONGODB_URI=mongodb://localhost:27017/grubclub
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/grubclub

# File Storage (for future implementation)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=grubclub-uploads
```

### Development
```bash
# Start development server
pnpm dev

# Seed database with initial data
pnpm seed

# Build for production
pnpm build

# Start production server
pnpm start
```

## 🧪 Testing the API

### Test Users
The system includes mock users for testing:

1. **Student User**
   - Email: `rahul@thapar.edu`
   - Password: `123456`
   - Role: `user`

2. **Restaurant Owner**
   - Email: `amit@spicegarden.com`
   - Password: `123456`
   - Role: `restaurant_owner`

3. **Admin User**
   - Email: `admin@grubclub.com`
   - Password: `123456`
   - Role: `admin`

### API Testing Examples

#### Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "123456",
    "phone": "+91 98765 43210",
    "role": "user"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahul@thapar.edu",
    "password": "123456"
  }'
```

#### Get restaurants (with authentication)
```bash
curl -X GET http://localhost:3000/api/restaurants \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Create an order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "restaurantId": "1",
    "items": [
      {
        "menuItemId": "1",
        "quantity": 2,
        "price": 280
      }
    ],
    "deliveryAddress": "Hostel Block A, Room 101",
    "specialInstructions": "Less spicy please"
  }'
```

## 🔄 Database Integration

The project uses MongoDB with Mongoose ODM. The database is already integrated and ready to use:

### MongoDB Setup

1. **Install MongoDB** locally or use MongoDB Atlas
   ```bash
   # For local MongoDB (macOS with Homebrew)
   brew install mongodb-community
   brew services start mongodb-community
   
   # For Windows, download from mongodb.com
   # For Linux: sudo apt install mongodb
   ```

2. **Set up MongoDB Atlas** (cloud option)
   - Create account at [mongodb.com](https://mongodb.com)
   - Create a new cluster
   - Get connection string and add to `.env.local`

3. **Database Models** are defined in `models/` directory:
   - `User.ts` - User accounts and authentication
   - `Restaurant.ts` - Restaurant information
   - `MenuItem.ts` - Menu items for restaurants
   - `Order.ts` - Order management
   - `Review.ts` - Restaurant reviews and ratings

4. **Seed the database** with initial data:
   ```bash
   pnpm seed
   ```

### Database Schema

The MongoDB collections include:
- **users** - User accounts with role-based access
- **restaurants** - Restaurant profiles and details
- **menuitems** - Menu items with categories and pricing
- **orders** - Order tracking and management
- **reviews** - Restaurant reviews and ratings

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables for Production
- Set `JWT_SECRET` to a strong, unique secret
- Configure database connection string
- Set up file storage credentials

## 🔒 Security Features

- **JWT Authentication** with role-based access control
- **Password Hashing** using bcryptjs
- **Input Validation** with Zod schemas
- **CORS Protection** (configured for frontend domain)
- **Rate Limiting** (can be added with express-rate-limit)

## 📈 Future Enhancements

- [ ] Real-time notifications with Socket.io
- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] File upload for restaurant/menu images
- [ ] Push notifications
- [ ] Advanced analytics and reporting
- [ ] Mobile app API
- [ ] Delivery tracking
- [ ] Loyalty program
- [ ] Review and rating system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ for Thapar University** 