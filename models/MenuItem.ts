import mongoose, { Document, Schema } from 'mongoose'

export interface IMenuItem extends Document {
  name: string
  description: string
  price: number
  category: string
  image: string
  isAvailable: boolean
  isVegetarian: boolean
  isVegan: boolean
  spiceLevel: 'Mild' | 'Medium' | 'Hot' | 'Extra Hot'
  preparationTime: string
  calories?: number
  allergens: string[]
  ingredients: string[]
  restaurantId: mongoose.Types.ObjectId
  order: number
  createdAt: Date
  updatedAt: Date
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [2, 'Item name must be at least 2 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    image: {
      type: String,
      default: '/placeholder.svg?height=150&width=150',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isVegetarian: {
      type: Boolean,
      default: false,
    },
    isVegan: {
      type: Boolean,
      default: false,
    },
    spiceLevel: {
      type: String,
      enum: ['Mild', 'Medium', 'Hot', 'Extra Hot'],
      default: 'Mild',
    },
    preparationTime: {
      type: String,
      required: [true, 'Preparation time is required'],
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
    },
    allergens: [{
      type: String,
      trim: true,
    }],
    ingredients: [{
      type: String,
      trim: true,
    }],
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required'],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes for faster queries
menuItemSchema.index({ restaurantId: 1 })
menuItemSchema.index({ category: 1 })
menuItemSchema.index({ isAvailable: 1 })
menuItemSchema.index({ isVegetarian: 1 })
menuItemSchema.index({ price: 1 })
menuItemSchema.index({ name: 'text', description: 'text' })

export default mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', menuItemSchema) 