import express from 'express';
import Cart from '../models/Cart.js';

const router = express.Router();

// Get cart (works for both authenticated and guest users)
router.get('/', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const sessionId = req.header('Session-Id');
    
    let cart;
    
    if (token) {
      // Authenticated user
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        cart = await Cart.findOne({ user: decoded.userId }).populate('items.item');
      } catch (error) {
        // Invalid token, fall back to session
        if (sessionId) {
          cart = await Cart.findOne({ sessionId }).populate('items.item');
        }
      }
    } else if (sessionId) {
      // Guest user
      cart = await Cart.findOne({ sessionId }).populate('items.item');
    }
    
    if (!cart) {
      return res.json({ items: [], totalAmount: 0 });
    }
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add item to cart
router.post('/add', async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const sessionId = req.header('Session-Id');
    
    let userId = null;
    
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        userId = decoded.userId;
      } catch (error) {
        // Invalid token, continue as guest
      }
    }
    
    // Find existing cart
    let cart;
    if (userId) {
      cart = await Cart.findOne({ user: userId });
      // If user has a session cart, merge it
      if (!cart && sessionId) {
        const sessionCart = await Cart.findOne({ sessionId });
        if (sessionCart) {
          sessionCart.user = userId;
          sessionCart.sessionId = undefined;
          cart = sessionCart;
        }
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      // Create new cart
      cart = new Cart({
        user: userId,
        sessionId: userId ? undefined : sessionId,
        items: []
      });
    }
    
    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.item.toString() === itemId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({ item: itemId, quantity });
    }
    
    await cart.save();
    await cart.populate('items.item');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update item quantity in cart
router.put('/update', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const sessionId = req.header('Session-Id');
    
    let cart;
    
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        cart = await Cart.findOne({ user: decoded.userId });
      } catch (error) {
        if (sessionId) {
          cart = await Cart.findOne({ sessionId });
        }
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    const itemIndex = cart.items.findIndex(
      item => item.item.toString() === itemId
    );
    
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }
    
    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }
    
    await cart.save();
    await cart.populate('items.item');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const sessionId = req.header('Session-Id');
    
    let cart;
    
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        cart = await Cart.findOne({ user: decoded.userId });
      } catch (error) {
        if (sessionId) {
          cart = await Cart.findOne({ sessionId });
        }
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(
      item => item.item.toString() !== itemId
    );
    
    await cart.save();
    await cart.populate('items.item');
    
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear cart
router.delete('/clear', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const sessionId = req.header('Session-Id');
    
    let cart;
    
    if (token) {
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        cart = await Cart.findOne({ user: decoded.userId });
      } catch (error) {
        if (sessionId) {
          cart = await Cart.findOne({ sessionId });
        }
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
    }
    
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;