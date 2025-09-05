# Namma Kadai API Documentation

## Base URL
**Production:** `https://api-namma-kadai.vercel.app`

## Authentication
All protected routes require a JWT token in the Authorization header:
```http
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Authentication APIs

#### Register User
```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "name": "string",
  "email": "string",
  "password": "string"
}

Response: 201 Created
{
  "message": "Account created successfully! Welcome!",
  "token": "jwt_token_here",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "string",
  "password": "string"
}

Response: 200 OK
{
  "message": "Login successful! Welcome back!",
  "token": "jwt_token_here",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

#### Forgot Password
```http
POST /auth/forgot-password
Content-Type: application/json

Request Body:
{
  "email": "string"
}

Response: 200 OK
{
  "message": "You will receive password reset instructions."
}
```

#### Verify Email
```http
POST /auth/verify-email
Content-Type: application/json

Request Body:
{
  "email": "string",
  "otp": "string"
}

Response: 200 OK
{
  "message": "Email verified successfully"
}
```

### 2. User APIs

#### Get Profile
```http
GET /user/profile
Authorization: Bearer <token>

Response: 200 OK
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "phone": "string",
    "addresses": [
      {
        "label": "string",
        "street": "string",
        "city": "string",
        "state": "string",
        "pincode": "string",
        "location": {
          "lat": number,
          "lng": number
        }
      }
    ]
  }
}
```

#### Update Details
```http
POST /user/update-details
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "string",
  "phone": "string",
  "addresses": [
    {
      "label": "string",
      "street": "string",
      "city": "string",
      "state": "string",
      "pincode": "string",
      "location": {
        "lat": number,
        "lng": number
      }
    }
  ]
}

Response: 200 OK
{
  "message": "Profile updated successfully",
  "user": {
    // Updated user object
  }
}
```

### 3. Vendor APIs

#### Get All Vendors
```http
GET /vendors
Query Parameters:
- city (optional): string
- isActive (optional): boolean

Response: 200 OK
{
  "vendors": [
    {
      "id": "string",
      "name": "string",
      "ownerName": "string",
      "phone": "string",
      "email": "string",
      "address": {
        "street": "string",
        "city": "string",
        "state": "string",
        "pincode": "string",
        "location": {
          "lat": number,
          "lng": number
        }
      },
      "shopDetails": {
        "logoUrl": "string",
        "description": "string",
        "openingHours": "string"
      },
      "isActive": boolean,
      "providesDelivery": boolean
    }
  ]
}
```

#### Get Vendor Details
```http
GET /vendors/:id

Response: 200 OK
{
  "vendor": {
    // Vendor object
  }
}
```

### 4. Product APIs

#### Add Product
```http
POST /vendors/products
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "string",
  "description": "string",
  "price": number,
  "stock": number,
  "unit": "string",
  "images": ["string"]
}

Response: 201 Created
{
  "message": "Product added successfully",
  "product": {
    // Product object
  }
}
```

#### Update Product
```http
PATCH /vendors/products/:id
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "name": "string",
  "description": "string",
  "price": number,
  "stock": number,
  "unit": "string",
  "images": ["string"]
}

Response: 200 OK
{
  "message": "Product updated successfully",
  "product": {
    // Updated product object
  }
}
```

### 5. Cart APIs

#### Add to Cart
```http
POST /cart/add
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "productId": "string",
  "quantity": number
}

Response: 200 OK
{
  "message": "Product added to cart",
  "cart": [
    {
      "productId": "string",
      "quantity": number
    }
  ]
}
```

#### Get Cart
```http
GET /cart
Authorization: Bearer <token>

Response: 200 OK
{
  "cart": [
    {
      "productId": {
        "id": "string",
        "name": "string",
        "price": number,
        "unit": "string",
        "images": ["string"]
      },
      "quantity": number
    }
  ]
}
```

### 6. Order APIs

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "vendorId": "string",
  "items": [
    {
      "productId": "string",
      "quantity": number
    }
  ],
  "deliveryAddress": {
    "street": "string",
    "city": "string",
    "state": "string",
    "pincode": "string",
    "location": {
      "lat": number,
      "lng": number
    }
  }
}

Response: 201 Created
{
  "message": "Order placed successfully",
  "order": {
    // Order object
  }
}
```

### 7. Payment APIs

#### Create Payment
```http
POST /payments
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "orderId": "string",
  "method": "COD" | "UPI" | "Card"
}

Response: 201 Created
{
  "message": "Payment request created successfully",
  "payment": {
    // Payment object
  }
}
```

### 8. Review APIs

#### Add Review
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "vendorId": "string",
  "orderId": "string",
  "rating": number,
  "comment": "string"
}

Response: 201 Created
{
  "message": "Review added successfully",
  "review": {
    // Review object
  }
}
```

### Error Responses

All endpoints may return the following error responses:

#### 400 Bad Request
```json
{
  "message": "Error description"
}
```

#### 401 Unauthorized
```json
{
  "error": "Please authenticate."
}
```

#### 403 Forbidden
```json
{
  "message": "Not authorized"
}
```

#### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

#### 500 Internal Server Error
```json
{
  "message": "Error description"
}
```
