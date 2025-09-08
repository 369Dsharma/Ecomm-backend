import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import cartRoutes from './routes/cart.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
   origin: [
        process.env.FRONTEND_URL || "http://localhost:3000",
    ],
    credentials: true
}));
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
.then(()=>{
  console.log("DB connected");
})
.catch((err)=>{
  console.log(err);
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/cart', cartRoutes);

// Sample data insertion (run once)
const seedData = async () => {
  const { default: Item } = await import('./models/Item.js');
  const count = await Item.countDocuments();
  
  if (count === 0) {
    const sampleItems = [
  {
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=200&fit=crop'
  },
  {
     name: 'Wireless Headphones',
    description: 'Premium noise-cancelling headphones',
    price: 299.99,
    category: 'Electronics',
    image: 'https://plus.unsplash.com/premium_photo-1678099940967-73fe30680949?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0'
  },
  {
      name: 'Coffee Mug',
      description: 'Ceramic coffee mug with modern design',
      price: 19.99,
      category: 'Home',
      image: 'https://images.unsplash.com/photo-1650959858546-d09833d5317b?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0'
  },
  {
    name: 'Running Shoes',
    description: 'Comfortable running shoes for daily exercise',
    price: 129.99,
    category: 'Sports',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop'
  },
  {
    name: 'Smartphone',
    description: 'Latest smartphone with advanced features',
    price: 899.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=200&fit=crop'
  },
  {
    name: 'Backpack',
    description: 'Durable backpack for travel and work',
    price: 79.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0'
  }
];
    
    await Item.insertMany(sampleItems);
    console.log('Sample data inserted');
  }
};

// Start server
const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Backend is running 🚀" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  seedData();
});