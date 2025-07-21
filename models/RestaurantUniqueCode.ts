import mongoose, { Schema } from 'mongoose';

const restaurantUniqueCodeSchema = new Schema({
  restaurantName: { type: String, required: true, unique: true },
  uniqueCode: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.RestaurantUniqueCode ||
  mongoose.model('RestaurantUniqueCode', restaurantUniqueCodeSchema); 