# Namma Kadai Backend

A modern, secure backend API for e-commerce applications built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Features

- **Authentication System**: JWT-based user registration and login
- **MongoDB Integration**: Using Mongoose for database operations
- **TypeScript Support**: Full TypeScript implementation for type safety
- **Security**: Password hashing with bcrypt, CORS enabled
- **Development Tools**: Hot reloading with nodemon, comprehensive logging
- **Production Ready**: Environment configuration, error handling

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MongoDB Atlas account or local MongoDB instance

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/namma-kadai-backend.git
   cd namma-kadai-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
   JWT_SECRET=your-super-secret-key-here
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:3000` with hot reloading enabled.

### Production Mode
```bash
npm run build
npm start
```

## 📖 API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Account created successfully! Welcome!",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "message": "Login successful! Welcome back!",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

## 🏗️ Project Structure

```
src/
├── controllers/     # Route controllers
│   └── auth.controller.ts
├── middleware/      # Custom middleware
│   └── auth.ts
├── models/          # Database models
│   └── User.ts
├── routes/          # API routes
│   └── auth.routes.ts
└── index.ts         # Application entry point
```

## 🛡️ Security Features

- **Password Hashing**: Using bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Request body validation
- **CORS Configuration**: Cross-origin resource sharing setup
- **Environment Variables**: Sensitive data protection

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📦 Building for Production

1. **Build the TypeScript code**:
   ```bash
   npm run build
   ```

2. **Start in production mode**:
   ```bash
   npm start
   ```

## 🚀 Deployment

### Environment Variables for Production
Make sure to set these environment variables in your production environment:

- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret (use a strong, random string)

### Docker Support (Optional)
Create a `Dockerfile` for containerized deployment:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [@yourusername](https://github.com/yourusername)

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- Mongoose team for MongoDB integration
- JWT.io for authentication standards
- The open-source community

## 📞 Support

For support, email your.email@example.com or create an issue in this repository.

---

Made with ❤️ for the developer community
