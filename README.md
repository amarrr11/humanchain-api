# 🔐 HumanChain AI Safety Incident Log API

This project is a secure backend API service for logging and managing AI safety incidents, built for the **HumanChain Backend Intern Assignment**.

It supports full **CRUD operations** for incidents with **JWT-based authentication** and **rate limiting** for enhanced security.

---

## 🛠 Tech Stack

* **Language:** JavaScript (Node.js)
* **Framework:** Express.js
* **Database:** MySQL
* **ORM:** Sequelize
* **Security:** JWT Authentication, Bcrypt password hashing, Rate Limiting, Input Validation, Secure Logging

---

## 🚀 Setup Instructions

### 1. Clone the Repository

git clone <your-repo-link>
cd humanchain-api

### 2. Install Dependencies

npm install

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```
DB_URL=mysql://<username>:<password>@localhost:3306/human_db
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
```

> ⚠️ Replace `<username>` and `<password>` with your MySQL credentials.

---

### 4. Setup the Database

1. Open MySQL Workbench or CLI.
2. Create the database:

CREATE DATABASE human_db;

> ✅ Sequelize will automatically create the required tables (`users`, `incidents`) on server start due to `sequelize.sync({ alter: true })`.

---

### 5. Run the Server

npm run dev

or

node server.js

> 🌐 Server starts at `http://localhost:5000`

---

## 🔐 Authentication Endpoints

### 📝 Register a New User

* **POST** `/register`
* **Request Body:**

```
{
  "name": "Shiv",
  "email": "shiv@gmail.com",
  "password": "123456"
}
```

### 🔑 Login and Get Token

* **POST** `/login`
* **Request Body:**

```
{
  "email": "shiv@gmail.com",
  "password": "123456"
}
```

* **Response:**

```
{
  "token": "JWT_TOKEN_HERE"
}
```

> 🔐 Use this token in `Authorization` header as: `Authorization: Bearer <token>`

---

## 📋 Incident Management Endpoints

> 🛡️ All endpoints below require a valid JWT token.

### 1. Get All Incidents

* **GET** `/incidents`

### 2. Create New Incident

* **POST** `/incidents`
* **Request Body:**

```
{
  "title": "AI Model Bias Detected",
  "description": "Recommendation system showed biased results",
  "severity": "High"
}
```

### 3. Get Specific Incident

* **GET** `/incidents/:id`

### 4. Update Incident

* **PUT** `/incidents/:id`
* **Request Body:**

```
{
  "title": "Updated Title",
  "severity": "Medium"
}
```

### 5. Delete Incident

* **DELETE** `/incidents/:id`

---

## 🧪 Postman Testing Guide

### 🔐 Auth Header (Required on All Incident Routes)

```
Key:    Authorization
Value:  Bearer <your_jwt_token>
```

---

### Sample Requests:

#### ✅ Register:

POST /register
Content-Type: application/json

```
{
  "name": "amarnath",
  "email": "shiv@gmail.com",
  "password": "123456"
}
```

#### ✅ Login:

POST /login
Content-Type: application/json

```
{
  "email": "shiv@gmail.com",
  "password": "123456"
}
```

#### ✅ Add Incident:

POST /incidents
Authorization: Bearer <token>
Content-Type: application/json

```
{
  "title": "Test Incident",
  "description": "Some test description",
  "severity": "Low"
}
```

## 🛡️ Security Features

* ✅ **JWT Authentication** for all protected routes
* ✅ **Bcrypt password hashing**
* ✅ **Rate Limiting:** 100 requests/min per IP
* ✅ **Request logging** using Morgan
* ✅ **Input validation** and error handling

---

## 💡 Contribution

Contributions are welcome! Feel free to open PRs or issues for bug reports, suggestions, or improvements. 