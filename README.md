# HumanChain AI Safety Incident Log API

This project is a backend API service for logging and managing AI safety incidents, developed for the HumanChain Backend Intern Take-Home Assignment.

## 🛠 Tech Stack

- **Language:** JavaScript (Node.js)
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Sequelize

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

Change the env file accorrding to your system.

```env
DB_URL=mysql://<username>:<password>@localhost:3306/humanchain_db
PORT=5000
```


> **Note:** No password for MySQL `root` user? Just remove it like `root@localhost:3306/humanchain_db`.

### 4. Setup the Database
- Go to mySQL workbench -> New connection -> write username and password -> test connection to see if its working.
- Create a database named `humanchain_db` manually:
  

```sql
CREATE DATABASE humanchain_db;
```

- Sequelize will automatically create the required table when the project runs.

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

## 📦 API Endpoints

All responses are in JSON format.
I have used Postman to do all HTTPS requests. You can do the same by writing example codes i am giving below:
If endpoints is not a number that will also cause error cause you cannot log incidents/abc.
Also a logger file will contain all the logs of every command.

### 1. Retrieve all incidents

- **Endpoint:** `GET /incidents`
- **Code:** `[GET /incidents](http://localhost:5000/incidents)`
- **Description:** Fetch all logged incidents.

- **Response Example:**

```json
[
  {
    "id": 1,
    "title": "FIRST AI Incident",
    "description": "AI showed unexpected behavior.",
    "severity": "Low",
    "reported_at": "2025-04-26T10:15:33.000Z"
  },
]
```

---

### 2. Log a new incident

- **Endpoint:** `POST /incidents`
- **Code:** `[POST /incidents](http://localhost:5000/incidents)`
- **Description:** Create a new AI safety incident.
- **Request Body:**

```json
{
  "title": "New Incident Title",
  "description": "Detailed description here.",
  "severity": "Medium"
}
```

- **Response Example (201 Created):**

```json
{
  "id": 3,
  "title": "New Incident Title",
  "description": "Detailed description here.",
  "severity": "Medium",
  "reported_at": "2025-04-27T10:00:00Z"
}
```

- **Valid Severity Values:** `Low`, `Medium`, `High`
- **Error Handling:** Returns 400 Bad Request if required fields are missing or invalid,

---

### 3. Retrieve a specific incident

- **Endpoint:** `GET /incidents/:id`
- **Code:** `[GET /incidents](http://localhost:5000/incidents/1)`
- **Description:** Get an incident by ID 1.
- **Response Example:**

```json
{
  "id": 1,
  "title": "FIRST AI Incident",
  "description": "AI showed unexpected behavior.",
  "severity": "Low",
  "reported_at": "2025-04-26T10:15:33.000Z"
}
```

- **Error Handling:** Returns 404 Not Found if ID does not exist.

---

### 4. Delete an incident

- **Endpoint:** `DELETE /incidents/:id`
- **Code:** `[DELETE /incidents](http://localhost:5000/incidents/2)`
- **Description:** Delete an incident by ID.
- **Response Example (Success):**

```json
{
  "message": "Incident deleted successfully."
}
```

- **Error Handling:** Returns 404 Not Found if ID does not exist.

---

Sahi pakda bhai! PUT (update) endpoint bhi hona chahiye tha.  
Tu bola nahi tha pehle, lekin koi na — main complete kar deta hoon full professional style mein.

Yeh updated **README.md** ka extra part hai (sirf jo PUT ke liye hai):

---

### 5. Update an existing incident

- **Endpoint:** `PUT /incidents/:id`
- **Code:** `[PUT /incidents](http://localhost:5000/incidents/2)`
- **Description:** Update an incident's title, description, or severity by its ID.
- **Request Body:**

```json
{
  "title": "Updated Incident Title",
  "description": "Updated detailed description.",
  "severity": "High"
}
```

- **Response Example (200 OK):**

```json
{
  "id": 1,
  "title": "Updated Incident Title",
  "description": "Updated detailed description.",
  "severity": "High",
  "reported_at": "2025-04-26T10:15:33.000Z"
}
```

- **Error Handling:** 
  - 404 Not Found if ID does not exist.
  - 400 Bad Request if invalid fields are provided.

---

## 📚 Design Decisions & Challenges

- Used Sequelize ORM to handle MySQL database easily and avoid raw SQL.
- Added validation on `severity` field to ensure only allowed values are accepted.
- Chose `nodemon` for easier development auto-reloading.
- To keep up the logs i have used morgan middleware and keeping every log of HTTP requests for later use.
- To limit requests from a particular port and to refrain my server from flooding I have also used `express-rate-limit` middleware.

---

# ✅ Futurework

- Can add pagination if the number of incidents are so many then we actually give the data in chunks so the load in the server will be minimal.
- Soft delete : Rather than permanently deleting records, we can implement a soft delete where the data remains in the database but is marked as deleted (e.g., a deleted_at timestamp).

---
