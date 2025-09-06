# Namma Kadai API Mock Data Guide

## Authentication APIs

### 1. Register User
```http
URL: /auth/register
Method: POST
Content-Type: application/json

Request Payload:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123!",
  "phone": "+91-9876543210"
}

Success Response (201):
{
  "message": "Account created successfully! Welcome!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65123b4c89a7e3c12d4f5e21",
    "name": "John Doe",
    "email": "john@example.com"
  }
}

Error Response (400):
{
  "message": "Email already registered"
}
```

### 2. Login
```http
URL: /auth/login
Method: POST
Content-Type: application/json

Request Payload:
{
  "email": "john@example.com",
  "password": "Password123!"
}

Success Response (200):
{
  "message": "Login successful! Welcome back!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "65123b4c89a7e3c12d4f5e21",
    "name": "John Doe",
    "email": "john@example.com"
  }
}

Error Response (401):
{
  "message": "Invalid email or password"
}
```

## Vendor APIs

### 1. Create Vendor Profile
```http
URL: /vendors
Method: POST
Content-Type: application/json
Authorization: Bearer <token>

Request Payload:
{
  "name": "Fresh Groceries",
  "ownerName": "John Doe",
  "phone": "+91-9876543210",
  "email": "shop@freshgroceries.com",
  "address": {
    "street": "123 Main Street",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600001",
    "location": {
      "lat": 13.0827,
      "lng": 80.2707
    }
  },
  "shopDetails": {
    "logoUrl": "https://example.com/logo.png",
    "description": "Fresh groceries and daily essentials",
    "openingHours": {
      "monday": {
        "open": "09:00",
        "close": "21:00",
        "isOpen": true
      },
      "tuesday": {
        "open": "09:00",
        "close": "21:00",
        "isOpen": true
      },
      "wednesday": {
        "open": "09:00",
        "close": "21:00",
        "isOpen": true
      },
      "thursday": {
        "open": "09:00",
        "close": "21:00",
        "isOpen": true
      },
      "friday": {
        "open": "09:00",
        "close": "21:00",
        "isOpen": true
      },
      "saturday": {
        "open": "09:00",
        "close": "20:00",
        "isOpen": true
      },
      "sunday": {
        "open": "10:00",
        "close": "18:00",
        "isOpen": false
      }
    },
    "categories": ["Groceries", "Fresh Vegetables", "Fruits"],
    "surroundingAreas": ["Anna Nagar", "Kilpauk", "Aminjikarai"],
    "minOrderValue": 200
  },
  "serviceTypes": {
    "delivery": true,
    "takeaway": true
  },
  "deliverySettings": {
    "radius": 5,
    "areas": ["Anna Nagar", "Kilpauk", "Aminjikarai"],
    "minDeliveryAmount": 200,
    "freeDeliveryAbove": 500,
    "deliveryCharge": 40
  }
}

Success Response (201):
{
  "message": "Vendor profile created successfully",
  "vendor": {
    "id": "65123b4c89a7e3c12d4f5e22",
    ... // all vendor details
  }
}
```

### 2. Add Product
```http
URL: /vendors/products
Method: POST
Content-Type: application/json
Authorization: Bearer <token>

Request Payload:
{
  "name": "Fresh Tomatoes",
  "description": "Farm fresh tomatoes",
  "price": 40,
  "stock": 100,
  "unit": "kg",
  "images": [
    "https://example.com/tomatoes1.jpg",
    "https://example.com/tomatoes2.jpg"
  ]
}

Success Response (201):
{
  "message": "Product added successfully",
  "product": {
    "id": "65123b4c89a7e3c12d4f5e23",
    "name": "Fresh Tomatoes",
    "description": "Farm fresh tomatoes",
    "price": 40,
    "stock": 100,
    "unit": "kg",
    "images": [...],
    "isActive": true,
    "vendorId": "65123b4c89a7e3c12d4f5e22",
    "createdAt": "2025-09-07T10:00:00.000Z"
  }
}
```

## Customer APIs

### 1. Get Nearby Vendors
```http
URL: /vendors/nearby?lat=13.0827&lng=80.2707&radius=5
Method: GET
Authorization: Bearer <token>

Success Response (200):
{
  "vendors": [
    {
      "id": "65123b4c89a7e3c12d4f5e22",
      "name": "Fresh Groceries",
      "address": {
        "street": "123 Main Street",
        "city": "Chennai",
        "location": {
          "lat": 13.0827,
          "lng": 80.2707
        }
      },
      "shopDetails": {
        "logoUrl": "https://example.com/logo.png",
        "description": "Fresh groceries and daily essentials",
        "openingHours": {...},
        "categories": [...]
      },
      "serviceTypes": {...},
      "deliverySettings": {...}
    }
  ]
}
```

### 2. Add to Cart
```http
URL: /cart/add
Method: POST
Content-Type: application/json
Authorization: Bearer <token>

Request Payload:
{
  "productId": "65123b4c89a7e3c12d4f5e23",
  "quantity": 2
}

Success Response (200):
{
  "message": "Product added to cart",
  "cart": [
    {
      "productId": {
        "id": "65123b4c89a7e3c12d4f5e23",
        "name": "Fresh Tomatoes",
        "price": 40,
        "unit": "kg",
        "images": [...]
      },
      "quantity": 2
    }
  ]
}
```

### 3. Create Order
```http
URL: /orders
Method: POST
Content-Type: application/json
Authorization: Bearer <token>

Request Payload:
{
  "vendorId": "65123b4c89a7e3c12d4f5e22",
  "items": [
    {
      "productId": "65123b4c89a7e3c12d4f5e23",
      "quantity": 2
    }
  ],
  "orderType": "delivery",
  "deliveryAddress": {
    "street": "456 Park Road",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600002",
    "location": {
      "lat": 13.0827,
      "lng": 80.2707
    }
  }
}

Success Response (201):
{
  "message": "Order placed successfully",
  "order": {
    "id": "65123b4c89a7e3c12d4f5e24",
    "userId": "65123b4c89a7e3c12d4f5e21",
    "vendorId": "65123b4c89a7e3c12d4f5e22",
    "items": [
      {
        "productId": "65123b4c89a7e3c12d4f5e23",
        "name": "Fresh Tomatoes",
        "price": 40,
        "quantity": 2
      }
    ],
    "totalAmount": 80,
    "deliveryCharge": 40,
    "orderType": "delivery",
    "deliveryAddress": {...},
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2025-09-07T10:30:00.000Z"
  }
}
```

### 4. Create Payment (COD Only)
```http
URL: /payments
Method: POST
Content-Type: application/json
Authorization: Bearer <token>

Request Payload:
{
  "orderId": "65123b4c89a7e3c12d4f5e24",
  "method": "COD"
}

Success Response (201):
{
  "message": "Payment request created successfully",
  "payment": {
    "id": "65123b4c89a7e3c12d4f5e25",
    "orderId": "65123b4c89a7e3c12d4f5e24",
    "method": "COD",
    "amount": 120,
    "status": "pending",
    "createdAt": "2025-09-07T10:31:00.000Z"
  }
}
```

### 5. Get User Orders
```http
URL: /orders/user/:userId
Method: GET
Authorization: Bearer <token>

Success Response (200):
{
  "orders": [
    {
      "id": "65123b4c89a7e3c12d4f5e24",
      "vendorId": {
        "name": "Fresh Groceries"
      },
      "items": [
        {
          "productId": {
            "name": "Fresh Tomatoes",
            "images": [...]
          },
          "quantity": 2,
          "price": 40
        }
      ],
      "totalAmount": 120,
      "status": "pending",
      "paymentStatus": "pending",
      "orderType": "delivery",
      "createdAt": "2025-09-07T10:30:00.000Z"
    }
  ]
}
```

### 6. Get Cart
```http
URL: /cart
Method: GET
Authorization: Bearer <token>

Success Response (200):
{
  "cart": [
    {
      "productId": {
        "id": "65123b4c89a7e3c12d4f5e23",
        "name": "Fresh Tomatoes",
        "price": 40,
        "stock": 98,
        "unit": "kg",
        "images": [...]
      },
      "quantity": 2
    }
  ]
}
```

## Reviews APIs

### 1. Add Review
```http
URL: /reviews
Method: POST
Content-Type: application/json
Authorization: Bearer <token>

Request Payload:
{
  "vendorId": "65123b4c89a7e3c12d4f5e22",
  "orderId": "65123b4c89a7e3c12d4f5e24",
  "rating": 5,
  "comment": "Great service and fresh products!"
}

Success Response (201):
{
  "message": "Review added successfully",
  "review": {
    "id": "65123b4c89a7e3c12d4f5e26",
    "userId": "65123b4c89a7e3c12d4f5e21",
    "vendorId": "65123b4c89a7e3c12d4f5e22",
    "orderId": "65123b4c89a7e3c12d4f5e24",
    "rating": 5,
    "comment": "Great service and fresh products!",
    "createdAt": "2025-09-07T11:00:00.000Z"
  }
}
```

### 2. Get Vendor Reviews
```http
URL: /reviews/vendor/:vendorId
Method: GET
Authorization: Bearer <token>

Success Response (200):
{
  "reviews": [
    {
      "id": "65123b4c89a7e3c12d4f5e26",
      "userId": {
        "name": "John Doe"
      },
      "rating": 5,
      "comment": "Great service and fresh products!",
      "createdAt": "2025-09-07T11:00:00.000Z"
    }
  ],
  "averageRating": 5,
  "totalReviews": 1
}
```

## Error Responses

All API endpoints may return these common error responses:

### 401 Unauthorized
```json
{
  "message": "Please authenticate."
}
```

### 403 Forbidden
```json
{
  "message": "Not authorized"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Something went wrong!"
}
```

## Notes

1. All timestamps are in ISO format
2. All IDs are MongoDB ObjectIDs (24 characters)
3. Authorization header format: `Bearer <token>`
4. Images should be valid URLs
5. Coordinates (lat/lng) should be valid decimal degrees
6. All monetary values are in INR
7. All weights/quantities should specify units
