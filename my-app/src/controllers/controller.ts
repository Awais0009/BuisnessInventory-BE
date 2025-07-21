import { Request, Response } from 'express';

// Get User Controller
export const getUser = (req: Request, res: Response) => {
  try {
    // Sample user data - replace with actual database logic
    const user = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      createdAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get All Users Controller
export const getAllUsers = (req: Request, res: Response) => {
  try {
    // Sample users data - replace with actual database logic
    const users = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving users',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create User Controller
export const createUser = (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    
    // Validate input
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }
    
    // Sample created user - replace with actual database logic
    const newUser = {
      id: Math.floor(Math.random() * 1000),
      name,
      email,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: newUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update User Controller
export const updateUser = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    // Validate input
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: 'At least name or email is required for update'
      });
    }
    
    // Sample updated user - replace with actual database logic
    const updatedUser = {
      id: parseInt(id),
      name: name || 'Updated Name',
      email: email || 'updated@example.com',
      updatedAt: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete User Controller
export const deleteUser = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Sample deletion - replace with actual database logic
    res.status(200).json({
      success: true,
      message: `User with ID ${id} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Business Inventory Controllers

// Get All Products Controller
export const getAllProducts = (req: Request, res: Response) => {
  try {
    const products = [
      {
        id: 1,
        name: 'Laptop Dell XPS 13',
        category: 'Electronics',
        price: 999.99,
        quantity: 15,
        sku: 'DELL-XPS13-001',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        name: 'Office Chair Ergonomic',
        category: 'Furniture',
        price: 299.99,
        quantity: 8,
        sku: 'CHAIR-ERG-002',
        createdAt: new Date().toISOString()
      },
      {
        id: 3,
        name: 'Wireless Mouse',
        category: 'Electronics',
        price: 49.99,
        quantity: 25,
        sku: 'MOUSE-WL-003',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: products,
      total: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving products',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Product by ID Controller
export const getProductById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Sample product - replace with actual database logic
    const product = {
      id: parseInt(id),
      name: 'Laptop Dell XPS 13',
      category: 'Electronics',
      price: 999.99,
      quantity: 15,
      sku: 'DELL-XPS13-001',
      description: 'High-performance ultrabook with 13-inch display',
      supplier: 'Dell Inc.',
      lastUpdated: new Date().toISOString()
    };
    
    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create Product Controller
export const createProduct = (req: Request, res: Response) => {
  try {
    const { name, category, price, quantity, sku } = req.body;
    
    // Validate input
    if (!name || !category || !price || !quantity || !sku) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, price, quantity, and SKU are required'
      });
    }
    
    // Sample created product - replace with actual database logic
    const newProduct = {
      id: Math.floor(Math.random() * 1000),
      name,
      category,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      sku,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Dashboard Stats Controller
export const getDashboardStats = (req: Request, res: Response) => {
  try {
    const stats = {
      totalProducts: 156,
      totalValue: 45000.50,
      lowStockItems: 12,
      categories: 8,
      recentActivity: [
        {
          id: 1,
          action: 'Product Added',
          item: 'Wireless Headphones',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          action: 'Stock Updated',
          item: 'Office Desk',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 3,
          action: 'Product Sold',
          item: 'Smartphone',
          timestamp: new Date(Date.now() - 7200000).toISOString()
        }
      ],
      monthlyStats: {
        currentMonth: {
          sales: 28500.75,
          purchases: 15200.00,
          profit: 13300.75
        },
        lastMonth: {
          sales: 32100.50,
          purchases: 18800.00,
          profit: 13300.50
        }
      }
    };
    
    res.status(200).json({
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving dashboard stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};