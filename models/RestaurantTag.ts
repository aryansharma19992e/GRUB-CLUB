import mongoose, { Document, Schema } from 'mongoose'

export interface IRestaurantTag extends Document {
  name: string
  description: string
  category: 'cuisine' | 'dietary' | 'service' | 'atmosphere' | 'price' | 'location'
  icon?: string
  color?: string
  isActive: boolean
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

const restaurantTagSchema = new Schema<IRestaurantTag>(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      unique: true,
      minlength: [2, 'Tag name must be at least 2 characters'],
      maxlength: [50, 'Tag name cannot exceed 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Tag description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [200, 'Description cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Tag category is required'],
      enum: ['cuisine', 'dietary', 'service', 'atmosphere', 'price', 'location'],
    },
    icon: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
      match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
restaurantTagSchema.index({ name: 1 })
restaurantTagSchema.index({ category: 1 })
restaurantTagSchema.index({ isActive: 1 })
restaurantTagSchema.index({ usageCount: -1 })
restaurantTagSchema.index({ name: 'text', description: 'text' })

export default mongoose.models.RestaurantTag || mongoose.model<IRestaurantTag>('RestaurantTag', restaurantTagSchema) 