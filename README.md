# HumanChain AI Safety Incident Log API

This project is a backend API service for logging and managing AI safety incidents with JWT authentication, developed for the HumanChain Backend Intern Take-Home Assignment.

## 🛠 Tech Stack

- **Language:** JavaScript (Node.js)
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Sequelize
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Security:** Rate limiting, Input validation

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-link>
cd humanchain-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file based on `.env.example`:

```env
DB_URL=mysql://<username>:<password>@localhost:3306/humanchain_db
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRES_IN=7d
```

> **Important:** 
> - Replace `<username>` and `<password>` with your MySQL credentials
> - Generate a strong JWT_SECRET (at least 32 characters)
> - No password for MySQL `root` user? Use `root@localhost:3306/humanchain_db`

### 4. Setup the Database

- Open MySQL Workbench → New connection → Enter username and password → Test connection
- Create a database named `humanchain_db`:

```sql
CREATE DATABASE humanchain_db;
```

- Sequelize will automatically create the required tables (`incidents` and `users`) when the project runs.

### 5. Run the server

```bash
npm run dev
```
or
```bash
nodemon server.js
```

Server will start at `http://localhost:5000`.

---

## 🔐 Authentication System

The API now includes JWT-based authentication with the following features:

- **User Registration & Login**
- **Password Hashing** (bcryptjs with salt rounds)
- **JWT Token Generation** (7-day expiration by default)
- **Role-based Access Control** (user/admin roles)
- **Protected Routes** for incident management
- **Rate Limiting** for security

### User Roles:
- **user**: Can create, read, and update incidents
- **admin**: Can perform all operations including deleting incidents

---

## 📦 API Endpoints

### 🔑 Authentication Endpoints

#### 1. Register a new user
- **Endpoint:** `POST /auth/register`
- **Description:** Create a new user account
- **Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user"
}
```
- **Response (201 Created):**
```json
{
  "message": "User registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "created_at": "2025-04-27T10:00:00Z"
  }
}
```

#### 2. Login
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticate user and get JWT token
- **Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```
- **Response (200 OK):**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 3. Get user profile
- **Endpoint:** `GET /auth/profile`
- **Description:** Get current user's profile information
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Response (200 OK):**
```json
{
  "message": "Profile retrieved successfully.",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

#### 4. Logout
- **Endpoint:** `POST /auth/logout`
- **Description:** Logout user (client should remove token)
- **Headers:** `Authorization: Bearer <your_jwt_token>`

---

### 📋 Incident Management Endpoints

#### 1. Get all incidents
- **Endpoint:** `GET /incidents`
- **Description:** Fetch all incidents (public access)
- **Headers (Optional):** `Authorization: Bearer <your_jwt_token>`
- **Response:**
```json
{
  "incidents": [...],
  "total": 3,
  "authenticated_user": "johndoe"
}
```

#### 2. Create new incident
- **Endpoint:** `POST /incidents`
- **Description:** Create a new incident (requires authentication)
- **Headers:** `Authorization: Bearer <your_jwt_token>`
- **Request Body:**
```json
{
  "title": "AI Model Bias Detected",
  "description": "The recommendation system showed biased results.",
  "severity": "High"
}
```

#### 3. Get specific incident
- **Endpoint:** `GET /incidents/:id`
- **Description:** Get incident by ID (public access)
- **Headers (Optional):** `Authorization: Bearer <your_jwt_token>`

#### 4. Update incident
- **Endpoint:** `PUT /incidents/:id`
- **Description:** Update incident (requires authentication)
- **Headers:** `Authorization: Bearer <your_jwt_token>`

#### 5. Delete incident
- **Endpoint:** `DELETE /incidents/:id`
- **Description:** Delete incident (requires admin role)
- **Headers:** `Authorization: Bearer <admin_jwt_token>`

---

## 🔒 Security Features

### Rate Limiting:
- **General API:** 100 requests per minute per IP
- **Authentication:** 5 attempts per 15 minutes per IP

### Password Security:
- Minimum 6 characters required
- Hashed using bcryptjs with salt rounds (cost factor 12)
- Passwords never returned in API responses

### JWT Security:
- Tokens expire after 7 days (configurable)
- Secure token verification on protected routes
- User context attached to requests

---

## 🧪 Testing the API

### Using Postman:

1. **Register a user:**
   ```
   POST http://localhost:5000/auth/register
   Content-Type: application/json
   
   {
     "username": "testuser",
     "email": "test@example.com",
     "password": "password123"
   }
   ```

2. **Login and get token:**
   ```
   POST http://localhost:5000/auth/login
   Content-Type: application/json
   
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Use token for protected routes:**
   ```
   POST http://localhost:5000/incidents
   Authorization: Bearer <your_jwt_token_here>
   Content-Type: application/json
   
   {
     "title": "Test Incident",
     "description": "Test description",
     "severity": "Medium"
   }
   ```

---

## 📁 Files Changed for Authentication

The following files were **created** or **modified** to implement JWT authentication:

### 📄 **New Files Created:**
1. **`models/User.js`** - User model with password hashing
2. **`middleware/auth.js`** - JWT authentication middleware
3. **`routes/auth.js`** - Authentication routes (register/login/profile)

### 📝 **Modified Files:**
1. **`package.json`** - Added JWT and bcryptjs dependencies
2. **`server.js`** - Enhanced with auth routes, error handling, and security
3. **`routes/incidents.js`** - Added authentication protection to routes
4. **`.env.example`** - Added JWT configuration variables
5. **`README.md`** - Updated with authentication documentation

### 🔧 **Key Changes Made:**

#### In `server.js`:
- Added JWT secret validation
- Integrated authentication routes
- Enhanced error handling and logging
- Added CORS support
- Implemented graceful shutdown

#### In `routes/incidents.js`:
- Protected POST, PUT, DELETE routes with authentication
- Added admin-only access for DELETE operations
- Enhanced responses with user context
- Improved error handling and validation

#### In `middleware/auth.js`:
- JWT token verification
- User authentication and authorization
- Role-based access control
- Optional authentication for public routes

---

## 🚀 Future Enhancements

- **Email Verification:** Verify email addresses during registration
- **Password Reset:** Implement forgot password functionality
- **Refresh Tokens:** Add token refresh mechanism
- **Audit Logging:** Track who created/modified incidents
- **API Documentation:** Add Swagger/OpenAPI documentation
- **Input Sanitization:** Enhanced XSS protection
- **Database Migrations:** Proper database versioning

---

## 💡 Contributing

Contributions are welcome! Please ensure all authentication flows are properly tested before submitting PRs.