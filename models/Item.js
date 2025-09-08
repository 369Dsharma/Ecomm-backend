import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: 'https://plus.unsplash.com/premium_photo-1678099940967-73fe30680949?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 100
  }
}, {
  timestamps: true
});

// Add indexes for better query performance
itemSchema.index({ category: 1 });
itemSchema.index({ price: 1 });
itemSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Item', itemSchema);