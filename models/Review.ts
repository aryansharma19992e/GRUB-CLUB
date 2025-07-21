import mongoose, { Document, Schema } from 'mongoose'

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId
  restaurantId: mongoose.Types.ObjectId
  orderId: mongoose.Types.ObjectId
  rating: number
  review: string
  foodRating: number
  serviceRating: number
  deliveryRating: number
  valueRating: number
  images?: string[]
  isVerified: boolean
  helpfulCount: number
  reportedCount: number
  isReported: boolean
  reportedReason?: string
  createdAt: Date
  updatedAt: Date
}

const reviewSchema = new Schema<IReview>(
  {
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
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    review: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
    foodRating: {
      type: Number,
      required: [true, 'Food rating is required'],
      min: [1, 'Food rating must be at least 1'],
      max: [5, 'Food rating cannot exceed 5'],
    },
    serviceRating: {
      type: Number,
      required: [true, 'Service rating is required'],
      min: [1, 'Service rating must be at least 1'],
      max: [5, 'Service rating cannot exceed 5'],
    },
    deliveryRating: {
      type: Number,
      required: [true, 'Delivery rating is required'],
      min: [1, 'Delivery rating must be at least 1'],
      max: [5, 'Delivery rating cannot exceed 5'],
    },
    valueRating: {
      type: Number,
      required: [true, 'Value rating is required'],
      min: [1, 'Value rating must be at least 1'],
      max: [5, 'Value rating cannot exceed 5'],
    },
    images: [{
      type: String,
      trim: true,
    }],
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    reportedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reportedReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
reviewSchema.index({ restaurantId: 1 })
reviewSchema.index({ userId: 1 })
reviewSchema.index({ orderId: 1 })
reviewSchema.index({ rating: -1 })
reviewSchema.index({ createdAt: -1 })
reviewSchema.index({ isVerified: 1 })
reviewSchema.index({ isReported: 1 })

// Compound index for restaurant reviews
reviewSchema.index({ restaurantId: 1, rating: -1 })
reviewSchema.index({ restaurantId: 1, createdAt: -1 })

// Text index for search
reviewSchema.index({ review: 'text' })

// Ensure one review per order
reviewSchema.index({ orderId: 1 }, { unique: true })

export default mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema) 