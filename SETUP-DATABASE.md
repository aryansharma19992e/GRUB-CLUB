# Database Setup Guide for Grub Club

## Option 1: MongoDB Atlas (Cloud Database) - Recommended

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Choose "Free" tier (M0)
4. Select your preferred cloud provider and region
5. Click "Create Cluster"

### Step 2: Get Connection String
1. Once your cluster is created, click "Connect"
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `<dbname>` with `grub-club`

### Step 3: Update Environment Variables
1. Open `.env.local` file
2. Add your MongoDB URI:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grub-club?retryWrites=true&w=majority
```

### Step 4: Run Database Setup
```bash
node scripts/setup-db.js
```

## Option 2: Local MongoDB

### Step 1: Install MongoDB
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install it on your computer
3. Start MongoDB service

### Step 2: Run Database Setup
```bash
node scripts/setup-db.js
```

## Database Structure

The setup script will create the following collections:

### 1. Users Collection
- **Purpose**: Store user information with role-based access
- **Fields**: name, email, password, phone, role, address, restaurantName
- **Roles**: user, restaurant_owner, admin

### 2. Restaurants Collection
- **Purpose**: Restaurant details with approval workflow
- **Fields**: name, description, cuisine, address, phone, email, deliveryTime, distance, priceRange, tags, status, ownerId, openingHours, isOpen, minimumOrder, deliveryFee, coordinates, rating, totalReviews

### 3. Menu Items Collection
- **Purpose**: Organized menu structure
- **Fields**: name, description, price, category, isAvailable, isVegetarian, isVegan, spiceLevel, preparationTime, calories, allergens, ingredients, restaurantId, order

### 4. Orders Collection
- **Purpose**: Complete order management
- **Fields**: orderNumber, userId, restaurantId, items, subtotal, deliveryFee, tax, total, status, paymentStatus, paymentMethod, deliveryAddress, deliveryInstructions, estimatedDeliveryTime, actualDeliveryTime, orderTime, preparationTime, readyTime, outForDeliveryTime, cancelledAt, cancelledBy, cancellationReason, rating, review

### 5. Reviews Collection
- **Purpose**: User feedback system
- **Fields**: userId, restaurantId, orderId, rating, review, foodRating, serviceRating, deliveryRating, valueRating, images, isVerified, helpfulCount, reportedCount, isReported, reportedReason

### 6. Restaurant Tags Collection
- **Purpose**: Categorization system
- **Fields**: name, description, category, icon, color, isActive, usageCount

## Test Users Created

After running the setup script, you'll have these test users (password: 123456):

- **Students**: john@thapar.edu, jane@thapar.edu
- **Restaurant Owners**: amit@spicegarden.com, rohit@pizzacorner.com
- **Admin**: admin@grubclub.com

## API Endpoints Available

Once the database is set up, these API endpoints will be available:

- `GET/POST /api/restaurants` - Restaurant management
- `GET/POST /api/menu-items` - Menu item management
- `GET/POST /api/orders` - Order management
- `GET/POST /api/reviews` - Review management
- `GET/POST /api/restaurant-tags` - Tag management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Troubleshooting

### Connection Error
If you get "ECONNREFUSED" error:
1. Make sure MongoDB is running (if using local)
2. Check your connection string (if using Atlas)
3. Verify your IP is whitelisted (if using Atlas)

### Environment Variables
Make sure your `.env.local` file has:
```
MONGODB_URI=your_mongodb_connection_string
```

## Next Steps

After database setup:
1. Start the development server: `npm run dev`
2. Test the signup functionality
3. Browse restaurants and menu items
4. Test order creation and management 