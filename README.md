# Library Book Management API

Session 4 assignment built with Express 5, TypeScript, and Zod. Books are stored in a process-local Map. Restarting the server clears all books.

## Run locally

Requires Node.js 22.13+ and npm.

```powershell
cd "D:\coding\Core Istanbul\Backend\Library Book Management API"
npm ci
Copy-Item .env.example .env
npm run dev
```

The server uses `http://localhost:3001`. Set `PORT` in `.env` to change the port and restart the server. Both `dev` and `start` load `.env` using Node's built-in environment file support. An existing shell `PORT` takes precedence. If `.env` is absent, the default port is 3001. `.env` is ignored by Git and `.env.example` provides the configuration template.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Run TypeScript with automatic restart on changes |
| `npm run typecheck` | Check strict TypeScript types |
| `npm run build` | Compile ESM JavaScript into `dist` |
| `npm start` | Run the compiled server after building |

## Structure

```text
src/
  app.ts                       Middleware and route registration
  server.ts                    Port validation and server startup
  models/book.ts               Book interface
  schemas/book.schema.ts       Zod request schemas
  routes/book.routes.ts        Five endpoint definitions
  controllers/book.controller.ts  Parse requests and send responses
  services/book.service.ts     In-memory storage and CRUD operations
  errors/http-error.ts         HTTP error type
  middleware/error-handler.ts  JSON error responses
```

## Layered architecture

The request flow follows Routes → Controllers → Services. Routes connect endpoints to controllers. Controllers validate HTTP input, call services, and send successful responses. Services execute business logic and in-memory data operations.

All HTTP error responses are produced by `middleware/error-handler.ts`. Controllers let validation errors propagate to Express. Services throw errors for missing books. The unmatched-route middleware forwards a 404 error to the same handler. The handler formats validation, JSON parsing, payload size, missing resource, and unexpected errors. When headers have already been sent, it delegates to Express to close the response safely.

Server startup errors are logged by `server.ts` because they occur outside the HTTP request lifecycle.

## Book model

| Field | Type | Rules |
| --- | --- | --- |
| `id` | number | Server-generated positive integer (1, 2, 3...), immutable |
| `title` | string | Required, trimmed, nonempty |
| `author` | string | Required, trimmed, nonempty |
| `genre` | string | Required, trimmed, nonempty |
| `available` | boolean | Defaults to `true` when creating a book |

IDs start at 1 and increase for each new book. Deleting a book does not reuse its ID or change other IDs. Restarting the server clears the books and resets the counter to 1. For example, the first book is accessible at `/books/1`.

## Endpoints

| Method | Path | Success response |
| --- | --- | --- |
| GET | `/books` | 200, array of books |
| GET | `/books/:id` | 200, one book |
| POST | `/books` | 201, created book and Location header |
| PATCH | `/books/:id` | 200, updated book |
| DELETE | `/books/:id` | 204, empty body |

Send `Content-Type: application/json` for POST and PATCH.

Example POST body

```json
{
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": "Fantasy",
  "available": true
}
```

Example PATCH body

```json
{ "available": false }
```

PATCH accepts any nonempty subset of title, author, genre, and available. Omitted fields preserve their previous values. POST and PATCH reject unknown fields, including client-supplied IDs.

## Errors and logging

- 400 for validation failures, malformed JSON, and invalid integer IDs.
- 404 for missing books and unknown routes.
- 413 for JSON bodies larger than Express's default 100 KB limit.
- 500 for unexpected errors, with details logged on the server.

Validation errors include field details.

```json
{
  "error": "Validation failed",
  "details": [
    { "field": "title", "message": "Too small: expected string to have >=1 characters" }
  ]
}
```

Logging middleware runs before the JSON parser and routes. It prints the request method and path, then calls `next()`.

```text
GET /books
POST /books
PATCH /books/<book-id>
```

## Test with Postman

1. Start the server with `npm run dev` and keep the terminal open.
2. Open the Postman desktop app and import `library-books.postman_collection.json` from this folder.
3. The collection variable `baseUrl` defaults to `http://localhost:3001`. Update it if you changed the port.
4. Run the collection in order using the collection runner. The Create book request saves its ID into the collection variable `bookId` for subsequent requests.
5. Check the request responses, test results, and server terminal logs.

The collection creates and deletes its own test book. It checks the CRUD flow, availability defaults, partial updates, trimming, validation failures, malformed JSON, invalid IDs, missing books, unknown routes, and repeated deletion.

For individual requests, choose GET and enter `http://localhost:3001/books`. For POST or PATCH, choose Body, raw, JSON and enter one of the examples above. Run Create book before requests that use `{{bookId}}`.

Postman web users can select the Desktop Agent for localhost access. See the [official request guide](https://learning.postman.com/docs/getting-started/quick-start) and [agent guide](https://learning.postman.com/docs/getting-started/basics/about-postman-agent).

## Verification results

Executed during project creation with Node.js 26.6.0 and npm 12.0.2.

| Check | Result |
| --- | --- |
| `npm install` | Installed dependencies and generated package-lock.json |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run dev` | Started successfully, GET /books returned 200 and [], request logged |
| `npm start` | Started successfully, GET /books returned 200 and [], request logged |
| Postman collection via Newman | 21 requests, 42 assertions, zero failures after centralizing error handling |
| Centralized 500 handling | Simulated a book storage failure during GET /books, verified HTTP 500 with a generic JSON error and a server-side error log |
| `.env` configuration | Both dev and start loaded PORT=3001 from .env and served GET /books successfully |
| Sequential numeric IDs | Created IDs 1, 2, 3, verified deletion preserves other IDs and does not reuse IDs, rejected invalid IDs with HTTP 400 |

The collection was executed using Newman, Postman's command-line collection runner. The desktop Postman interface was not used for automated verification. The 500 check used a separate temporary HTTP harness with a storage failure scoped to the books Map. The temporary fault was restored and the verification servers were stopped afterward.

To repeat the collection checks from another terminal while the app runs on port 3001

```powershell
npm exec --yes --package=newman -- newman run library-books.postman_collection.json
```

Newman is downloaded into the npm cache when needed. It is separate from the API's dependencies.

## AI use

OpenAI Codex generated the initial project, route/controller/service structure, Book interface, Zod schemas, error handling, logging middleware, Postman collection, and this README in response to the assignment requirements. AI also executed the verification commands and inspected their results.

Implementation choices made by AI include sequential numeric IDs, the `/books` resource path, port 3001, default availability of true, strict rejection of unknown input fields, and JSON error responses.
