# Business Inventory Backend API

A TypeScript Express.js API for managing business inventory, customers, crops, and transactions with PostgreSQL database.

## Features

- **Authentication**: JWT-based authentication with user registration and login
- **Customer Management**: Full CRUD operations for customers/parties
- **Database**: PostgreSQL with Row Level Security (RLS)
- **TypeScript**: Full TypeScript support with proper type definitions
- **CORS**: Configured for PWA frontend communication
- **Security**: Bcrypt password hashing, JWT tokens, input validation

## Setup Instructions

### 1. Environment Configuration

Copy the environment file and configure your settings:

```bash
cp .env.example .env
```

Update the `.env` file with your PostgreSQL database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=business_inventory
DB_USER=postgres
DB_PASSWORD=your_actual_password
JWT_SECRET=your_very_long_and_secure_jwt_secret_key
```

### 2. Database Setup

Make sure you have PostgreSQL running and execute the complete schema from:
`e:\buisnessInventory\complete_supabase_schema.sql`

This creates all necessary tables, triggers, functions, and RLS policies.

### 3. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/verify-token` - Verify JWT token

### Parties/Customers
- `GET /api/parties` - Get all parties
- `GET /api/parties/search?q=term` - Search parties
- `GET /api/parties/:id` - Get party by ID
- `POST /api/parties` - Create new party
- `PUT /api/parties/:id` - Update party
- `DELETE /api/parties/:id` - Delete party
- `GET /api/parties/:id/balance` - Get party balance
- `GET /api/parties/:id/transactions` - Get party transactions

## Example Usage

### Register a new user:
```json
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "business_name": "ABC Trading"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "profile_id": "profile-uuid", 
    "email": "user@example.com",
    "full_name": "John Doe",
    "business_name": "ABC Trading",
    "role": "admin"
  },
  "token": "jwt-token-here"
}
```

### Login user:
```json
POST /api/auth/login
{
  "email": "user@example.com", 
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "profile_id": "profile-uuid",
    "email": "user@example.com", 
    "full_name": "John Doe",
    "business_name": "ABC Trading",
    "role": "admin",
    "is_active": true
  },
  "token": "jwt-token-here"
}

### Create a customer:
```json
POST /api/parties
Headers: { "Authorization": "Bearer your_jwt_token" }
{
  "name": "Local Farmer",
  "phone": "+92 300 1234567",
  "party_type": "seller",
  "credit_limit": 50000
}
```

### Search customers:
```
GET /api/parties/search?q=farmer
Headers: { "Authorization": "Bearer your_jwt_token" }
```

## Database Schema

The API uses a comprehensive PostgreSQL schema with:

- **Authentication**: Custom auth.users table with profiles
- **Companies**: Multi-tenant company support
- **Parties**: Customer/supplier management
- **Crops**: Inventory items with stock tracking
- **Transactions**: Buy/sell transactions with automatic stock updates
- **Balances**: Automated customer and crop-wise balance tracking

## Security Features

- **Row Level Security**: Data isolation per company
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Input Validation**: Request validation and sanitization
- **CORS Protection**: Configured for specific frontend origins

## Development

The server runs on port 3001 by default and includes:
- Request logging
- Error handling
- Hot reload with ts-node
- TypeScript compilation
- CORS configuration for PWA frontend

Visit `http://localhost:3001/api` for the API documentation endpoint.
