# Task Management API

REST API for task and project management built as part of the Yapindo Jaya Abadi technical test.

The API provides authentication, project management, task management, AI-powered task commands, Redis caching, and audit logging.

## Tech Stack

* **Node.js**
* **Express.js**
* **PostgreSQL**
* **Sequelize ORM**
* **Redis**
* **JWT**
* **Google Gemini AI**
* **Zod**
* **Jest & Supertest**

## Features

* User registration and login
* JWT-based authentication
* Role-based authorization (`admin` and `user`)
* Project CRUD for admin users
* Retrieve tasks by project
* AI-powered task commands using natural language
* AI command validation using Zod
* Database transaction with rollback for multiple AI commands
* Audit logging for every AI command request
* Redis caching for project list
* Cache invalidation after project creation, update, and deletion
* Automated API tests

---

## Requirements

Make sure the following are installed:

* Node.js 18+
* PostgreSQL
* Redis
* Git
* Postman (optional, for API testing)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/raafidewanto/test-yapindo.git
cd test-yapindo
```

### 2. Install dependencies

```bash
npm install
```

---

## Database Setup

Create a PostgreSQL database named:

```text
task_management
```

Make sure PostgreSQL is running before starting the application.

The application uses Sequelize to connect to PostgreSQL.

---

## Redis Setup

Make sure Redis is installed and running.

To verify Redis:

```bash
redis-cli ping
```

Expected response:

```text
PONG
```

The application uses Redis to cache the project list endpoint.

---

## Environment Configuration

Create a `.env` file in the project root:

```text
.env
```

Use `.env.example` as a reference.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=task_management
DB_USER=your_database_user
DB_PASSWORD=your_database_password

JWT_SECRET=your_jwt_secret

GEMINI_API_KEY=your_gemini_api_key

REDIS_URL=redis://localhost:6379
```

### Environment Variables

| Variable         | Description                        |
| ---------------- | ---------------------------------- |
| `PORT`           | Port used by the API               |
| `DB_HOST`        | PostgreSQL host                    |
| `DB_PORT`        | PostgreSQL port                    |
| `DB_NAME`        | PostgreSQL database name           |
| `DB_USER`        | PostgreSQL username                |
| `DB_PASSWORD`    | PostgreSQL password                |
| `JWT_SECRET`     | Secret key used to sign JWT tokens |
| `GEMINI_API_KEY` | Google Gemini API key              |
| `REDIS_URL`      | Redis connection URL               |

---

## Running the Application

Start the application in development mode:

```bash
npm run dev
```

Or run normally:

```bash
npm start
```

If the application starts successfully, the server will run on:

```text
http://localhost:3000
```

Expected console output:

```text
Database connected successfully
Redis connected successfully
Server running on port 3000
```

---

## Running Tests

The project uses Jest and Supertest for automated testing.

Run all tests with:

```bash
npm test
```

The test suite covers:

* Authentication
* Project CRUD
* Task retrieval
* AI command execution
* AI validation and error handling
* Transaction rollback
* Audit logging
* Redis caching and cache invalidation

---

# API Endpoints

## Authentication

| Method | Endpoint    | Access |
| ------ | ----------- | ------ |
| POST   | `/register` | Public |
| POST   | `/login`    | Public |

## Projects

| Method | Endpoint        | Access     |
| ------ | --------------- | ---------- |
| POST   | `/projects`     | Admin      |
| GET    | `/projects`     | Admin/User |
| GET    | `/projects/:id` | Admin      |
| PUT    | `/projects/:id` | Admin      |
| DELETE | `/projects/:id` | Admin      |

## Tasks

| Method | Endpoint              | Access     |
| ------ | --------------------- | ---------- |
| GET    | `/projects/:id/tasks` | Admin/User |

## AI Command

| Method | Endpoint      | Access     |
| ------ | ------------- | ---------- |
| POST   | `/ai/command` | Admin/User |

---

# Authentication

After logging in, the API returns a JWT token.

Use the token for protected endpoints:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# AI Command

The API provides an AI endpoint that allows users to manage tasks using natural language.

Example request:

```json
{
  "command": "Create a high priority task called Prepare API documentation in project 1 and assign it to user 2"
}
```

The AI converts the natural language instruction into structured JSON commands.

Supported actions:

* `create_task`
* `update_task`
* `delete_task`

The AI is explicitly restricted from modifying or deleting users.

---

## AI Prompt Design

The AI prompt is designed to act as a controlled translation layer between natural language and the application's task operations.

The prompt contains several important rules:

1. **Restrict available actions**

   The AI is only allowed to return:

   * `create_task`
   * `update_task`
   * `delete_task`

2. **Enforce a structured JSON format**

   The AI must return JSON instead of natural language responses so that the application can process the result programmatically.

3. **Prevent User manipulation**

   The prompt explicitly instructs the AI that it must not create, update, or delete users.

4. **Return an empty command list for unsupported requests**

   If the user's request is unrelated to task management, the AI returns:

   ```json
   {
     "commands": []
   }
   ```

5. **Validate AI output before database operations**

   The AI response is first parsed using `JSON.parse()` and then validated against a Zod schema.

   Invalid JSON or invalid command structures result in a `400 Bad Request` response instead of causing the application to crash.

---

## AI Transaction & Rollback

Multiple AI commands are executed inside a single database transaction.

For example:

```text
Command 1 → Create Task
Command 2 → Update Task
Command 3 → Delete Task
```

If one command fails, the transaction is rolled back so that previously executed commands in the same request are also reverted.

This ensures database consistency.

Each AI endpoint request also creates exactly one audit log containing:

* User ID
* Action
* Request payload
* Response payload
* Success/failed status
* Failure reason when applicable

The audit log is stored separately from the task transaction so that failed AI operations are still recorded.

---

# Redis Caching

Redis is used to cache the result of:

```text
GET /projects
```

The project list is cached for 60 seconds.

The cache is invalidated when a project is:

* Created
* Updated
* Deleted

This prevents stale project data from remaining in Redis after write operations.

---

# Postman Collection

A Postman collection is included in the repository:

```text
Task Management API.postman_collection.json
```

To use it:

1. Open Postman.
2. Click **Import**.
3. Select `Task Management API.postman_collection.json`.
4. Set the collection variable `baseUrl` to:

```text
http://localhost:3000
```

5. Run the **Login** request.
6. The JWT token will automatically be stored in the collection variable `token`.
7. The authenticated endpoints can then be executed using the saved token.

---

## Project Structure

```text
task-management-api/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── redis.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── task.controller.js
│   │   └── ai-command.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   └── error.middleware.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── project.model.js
│   │   ├── task.model.js
│   │   ├── audit-log.model.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   ├── task.routes.js
│   │   └── ai-command.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── project.service.js
│   │   ├── task.service.js
│   │   ├── gemini.service.js
│   │   ├── ai-command.service.js
│   │   └── audit-log.service.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── project.validator.js
│   │   ├── task.validator.js
│   │   └── ai-command.validator.js
│   ├── app.js
│   └── server.js
│
├── test/
│   ├── setup.js
│   ├── auth.test.js
│   ├── project.test.js
│   ├── task.test.js
│   ├── ai-command.test.js
│   └── redis.test.js
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
├── README.md
└── Task Management API.postman_collection.json
```

---

## Security

* Passwords are hashed using bcrypt.
* JWT is used for authentication.
* Role-based authorization is implemented for protected resources.
* AI output is validated before database operations.
* Database transactions are used for AI command execution.
* Sensitive environment variables are excluded from Git using `.gitignore`.
* API keys, passwords, and JWT secrets must never be committed to the repository.

---

## License

This project was developed as part of the Yapindo Jaya Abadi technical test.
