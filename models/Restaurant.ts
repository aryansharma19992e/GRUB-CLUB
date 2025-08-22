import mongoose, { Document, Schema } from 'mongoose'

export interface IRestaurant extends Document {
  name: string
  description: string
  cuisine: string
  address: string
  phone: string
  email: string
  image: string
  rating: number
  totalReviews: number
  deliveryTime: string
  distance: string
  priceRange: string
  tags: string[]
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  ownerId: mongoose.Types.ObjectId
  openingHours: string
  isOpen: boolean
  minimumOrder: number
  deliveryFee: number
  coordinates: {
    latitude: number
    longitude: number
  }
  createdAt: Date
  updatedAt: Date
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: {
      type: String,
      required: [true, 'Restaurant name is required'],
      trim: true,
      minlength: [2, 'Restaurant name must be at least 2 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    cuisine: {
      type: String,
      required: [true, 'Cuisine type is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    image: {
      type: String,
      default: '/placeholder.svg?height=200&width=300',
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    deliveryTime: {
      type: String,
      required: [true, 'Delivery time is required'],
    },
    distance: {
      type: String,
      required: [true, 'Distance is required'],
    },
    priceRange: {
      type: String,
      required: [true, 'Price range is required'],
      enum: ['₹', '₹₹', '₹₹₹', '₹₹₹₹'],
    },
    tags: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner ID is required'],
    },
    openingHours: {
      type: String,
      required: [true, 'Opening hours are required'],
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    minimumOrder: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
      },
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
restaurantSchema.index({ name: 1 })
restaurantSchema.index({ cuisine: 1 })
restaurantSchema.index({ status: 1 })
restaurantSchema.index({ ownerId: 1 })
restaurantSchema.index({ rating: -1 })
restaurantSchema.index({ coordinates: '2dsphere' })

// Pre-save middleware to validate ownerId reference
restaurantSchema.pre('save', async function(next) {
  if (this.isModified('ownerId')) {
    try {
      const User = mongoose.model('User')
      const owner = await User.findById(this.ownerId)
      if (!owner) {
        return next(new Error('Owner ID does not reference a valid user'))
      }
    } catch (error) {
      return next(error)
    }
  }
  next()
})

// Static method to safely delete restaurant and clean up related data
restaurantSchema.statics.safeDelete = async function(restaurantId: string) {
  try {
    const restaurant = await this.findById(restaurantId)
    if (!restaurant) {
      throw new Error('Restaurant not found')
    }

    // Delete related menu items
    const MenuItem = mongoose.model('MenuItem')
    await MenuItem.deleteMany({ restaurantId: restaurant._id })

    // Delete related orders (if any)
    const Order = mongoose.model('Order')
    if (Order) {
      await Order.deleteMany({ restaurantId: restaurant._id })
    }

    // Delete the restaurant
    await this.findByIdAndDelete(restaurantId)
    
    return { success: true, message: 'Restaurant and related data deleted successfully' }
  } catch (error) {
    throw new Error(`Failed to delete restaurant: ${error.message}`)
  }
}

export default mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', restaurantSchema) 