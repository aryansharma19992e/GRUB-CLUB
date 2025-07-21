import mongoose, { Schema } from 'mongoose';

const restaurantOwnerInviteSchema = new Schema({
  code: { type: String, required: true, unique: true },
  restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  used: { type: Boolean, default: false },
  usedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.RestaurantOwnerInvite ||
  mongoose.model('RestaurantOwnerInvite', restaurantOwnerInviteSchema); 