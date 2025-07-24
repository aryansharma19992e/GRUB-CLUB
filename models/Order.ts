import mongoose, { Document, Schema } from 'mongoose'

export interface IOrderItem {
  menuItemId: mongoose.Types.ObjectId
  name: string
  price: number
  quantity: number
  specialInstructions?: string
  totalPrice: number
}

export interface IOrder extends Document {
  orderNumber: string
  userId: mongoose.Types.ObjectId
  restaurantId: mongoose.Types.ObjectId
  items: IOrderItem[]
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod: 'cash' | 'card' | 'upi' | 'wallet'
  customerName: string
  customerPhone: string
  deliveryAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    coordinates?: {
      latitude: number
      longitude: number
    }
  }
  deliveryInstructions?: string
  estimatedDeliveryTime: Date
  actualDeliveryTime?: Date
  orderTime: Date
  preparationTime?: Date
  readyTime?: Date
  outForDeliveryTime?: Date
  cancelledAt?: Date
  cancelledBy?: 'user' | 'restaurant' | 'admin'
  cancellationReason?: string
  rating?: number
  review?: string
  createdAt: Date
  updatedAt: Date
}

const orderItemSchema = new Schema<IOrderItem>({
  menuItemId: {
    type: Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  specialInstructions: {
    type: String,
    trim: true,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
})

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required'],
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'wallet'],
      required: [true, 'Payment method is required'],
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true,
    },
    deliveryAddress: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
      },
      city: {
        type: String,
        required: [true, 'City is required'],
      },
      state: {
        type: String,
        required: [true, 'State is required'],
      },
      zipCode: {
        type: String,
        required: [true, 'ZIP code is required'],
      },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    deliveryInstructions: {
      type: String,
      trim: true,
    },
    estimatedDeliveryTime: {
      type: Date,
      required: [true, 'Estimated delivery time is required'],
    },
    actualDeliveryTime: {
      type: Date,
    },
    orderTime: {
      type: Date,
      default: Date.now,
    },
    preparationTime: {
      type: Date,
    },
    readyTime: {
      type: Date,
    },
    outForDeliveryTime: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: String,
      enum: ['user', 'restaurant', 'admin'],
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
orderSchema.index({ userId: 1 })
orderSchema.index({ restaurantId: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ paymentStatus: 1 })
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ orderTime: -1 })
orderSchema.index({ estimatedDeliveryTime: 1 })

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    this.orderNumber = `GC${year}${month}${day}${random}`
  }
  next()
})

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema) 