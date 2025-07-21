import { Router } from 'express';
import { 
  getUser, 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser,
  getAllProducts,
  getProductById,
  createProduct,
  getDashboardStats
} from '../controllers/controller';

const router = Router();

// Health check route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Business Inventory API is running successfully! 🚀',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      users: [
        'GET /api/users - Get all users',
        'GET /api/user/:id - Get user by ID',
        'POST /api/user - Create new user',
        'PUT /api/user/:id - Update user',
        'DELETE /api/user/:id - Delete user'
      ],
      products: [
        'GET /api/products - Get all products',
        'GET /api/product/:id - Get product by ID',
        'POST /api/product - Create new product'
      ],
      dashboard: [
        'GET /api/dashboard/stats - Get dashboard statistics'
      ]
    }
  });
});

// User routes
router.get('/user/:id', getUser);
router.get('/users', getAllUsers);
router.post('/user', createUser);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);

// Product routes
router.get('/products', getAllProducts);
router.get('/product/:id', getProductById);
router.post('/product', createProduct);

// Dashboard routes
router.get('/dashboard/stats', getDashboardStats);

export default router;
