# Todo REST API

A Node.js / Express REST API for managing personal todos, with JWT authentication, bcrypt password hashing, input validation, rate limiting, and request logging.

## Features

- User registration and login (`POST /api/auth/register`, `POST /api/auth/login`)
- JWT-protected Todo CRUD
- Users can only access their own todos
- Zod input validation
- bcrypt password hashing
- Rate limiting and Helmet security headers
- Request logging and global error handling
- Todo search and filter by completion status

## Tech Stack

- Node.js + Express.js
- jsonwebtoken
- bcrypt
- zod
- express-rate-limit
- helmet
- cors
- dotenv

> Data is stored **in memory** (no external database package is installed). Data resets when the server restarts.

## Project Structure

```
src/
├── app.js
├── server.js
├── database.js
├── controllers/
│   ├── authController.js
│   └── todoController.js
├── middleware/
│   ├── authentication.js
│   ├── error.js
│   ├── logger.js
│   └── validate.js
├── routes/
│   ├── auth.routes.js
│   └── todo.routes.js
└── validators/
    ├── auth.validator.js
    └── todo.validator.js
```

## Setup

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment**

```bash
cp .env.example .env
```

Edit `.env` if needed:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret for signing JWTs | required |
| `JWT_EXPIRES_IN` | Token lifetime | `1h` |
| `SALT_ROUNDS` | bcrypt salt rounds | `10` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX` | Max requests per window (todos) | `100` |
| `AUTH_RATE_LIMIT_MAX` | Max auth attempts per window | `20` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |

3. **Start the server**

```bash
# development (auto-reload)
npm run dev

# production
npm start
```

Server runs at `http://localhost:3000`.

## API Endpoints

### Auth

#### Register

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**201** – user created (password is never returned).

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "secret123"
}
```

**200** – returns `{ user, token }`. Use the token as:

```http
Authorization: Bearer <token>
```

### Todos (all require Bearer token)

#### Create todo

```http
POST /api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false
}
```

#### List todos

```http
GET /api/todos
Authorization: Bearer <token>
```

Query params (bonus):

| Param | Example | Description |
|-------|---------|-------------|
| `search` | `?search=groceries` | Search title/description |
| `completed` | `?completed=true` | Filter by status |
| combined | `?search=milk&completed=false` | Both |

#### Get one todo

```http
GET /api/todos/:id
Authorization: Bearer <token>
```

#### Update todo

```http
PUT /api/todos/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Buy groceries",
  "completed": true
}
```

#### Delete todo

```http
DELETE /api/todos/:id
Authorization: Bearer <token>
```

## Todo Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique id |
| `title` | string | Required |
| `description` | string | Optional |
| `completed` | boolean | Default `false` |
| `userId` | number | Owner id |
| `createdAt` | string (ISO) | Creation timestamp |
| `updatedAt` | string (ISO) | Set on updates |

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Missing/invalid credentials or token |
| 403 | Accessing another user's todo |
| 404 | Resource not found |
| 409 | Email already registered |
| 429 | Rate limit exceeded |
| 500 | Server error |

## Testing with Postman / Thunder Client

1. Import `postman/Todo_API.postman_collection.json` into Postman or Thunder Client.
2. Run **Register**, then **Login** (token is saved to a collection variable automatically in Postman).
3. Use the Todo requests — they send `Authorization: Bearer {{token}}`.

### Manual curl example

```bash
# Register
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","password":"secret123"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"secret123"}' | jq -r '.data.token')

# Create todo
curl -s -X POST http://localhost:3000/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk","description":"2 liters"}'

# List todos
curl -s http://localhost:3000/api/todos \
  -H "Authorization: Bearer $TOKEN"
```

## Security Notes

- Passwords are hashed with bcrypt; never returned in responses.
- Todo routes require a valid JWT.
- Ownership checks prevent access to other users' todos.
- Sensitive config lives in `.env` (not committed).
- Request bodies are validated with Zod.
- Rate limiting protects auth and API routes.
# Todo-REST-API
