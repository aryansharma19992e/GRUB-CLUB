import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  password: string
  phone: string
  address?: string
  restaurantName?: string
  role: 'user' | 'restaurant_owner' | 'admin'
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    restaurantName: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'restaurant_owner', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
)

// Index for faster queries
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })

// Prevent password from being returned in queries
userSchema.methods.toJSON = function () {
  const user = this.toObject()
  delete user.password
  return user
}

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema) 