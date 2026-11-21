# Library Book Management API

Session 4 assignment built with Express 5, TypeScript, and Zod. Books are stored in a process-local Map. Restarting the server clears all books.

## Run locally

Install Git and Node.js 22.13 or later, including npm. A database is not required.

Clone the repository and install its dependencies. These commands work in PowerShell, macOS Terminal, and Linux shells.

```sh
git clone https://github.com/AnasAlhatti/Library-Book-Management-API.git
cd Library-Book-Management-API
npm ci
```

Create your local configuration from the example file.

On Windows PowerShell

```powershell
Copy-Item .env.example .env
```

On macOS or Linux

```sh
cp .env.example .env
```

Start the development server from the repository directory.

```sh
npm run dev
```

Keep that terminal open. The server should print `Library Book Management API listening on http://localhost:3001`.

Open `http://localhost:3001/books` in a browser or send a GET request to it from Postman. A freshly started server returns HTTP 200 with `[]`. Book endpoints use the `/books` path. Opening `http://localhost:3001/` returns a JSON 404 error.

Press Ctrl+C in the server terminal to stop the app. Restarting, including automatic development restarts after source changes, clears the in-memory data.

The server uses `http://localhost:3001`. Set `PORT` in `.env` to change the port and restart the server. Both `dev` and `start` load `.env` using Node's built-in environment file support. An existing shell `PORT` takes precedence. If `.env` is absent, the default port is 3001. `.env` is ignored by Git and `.env.example` provides the configuration template.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Run TypeScript with automatic restart on changes |
| `npm run typecheck` | Check strict TypeScript types |
| `npm run build` | Compile ESM JavaScript into `dist` |
| `npm start` | Run the compiled server after building |

To check the project and run the compiled application, stop the development server first, then run these commands from the repository directory.

```sh
npm run typecheck
npm run build
npm start
```

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

In Postman, select POST, enter `http://localhost:3001/books`, then select Body → raw → JSON and send this body.

```json
{
  "title": "The Hobbit",
  "author": "J. R. R. Tolkien",
  "genre": "Fantasy",
  "available": true
}
```

Expect HTTP 201, a Location header such as `/books/1`, and a response containing `id`, `title`, `author`, `genre`, and `available`. The first book created after starting the server has ID 1.

Copy the returned ID and use it in subsequent URLs. For a book with ID 1, send GET `http://localhost:3001/books/1` to retrieve it. Send PATCH to that same URL with this body to update its availability.

```json
{ "available": false }
```

Expect HTTP 200 with the updated book. Send DELETE to that same URL to remove it. Successful deletion returns HTTP 204 with an empty body. A later GET for that ID returns HTTP 404.

PATCH accepts any nonempty subset of title, author, genre, and available. Omitted fields preserve their previous values. POST and PATCH reject unknown fields, including client-supplied IDs.

## Errors and logging

- 400 for validation failures, malformed JSON, and invalid integer IDs.
- 404 for missing books and unknown routes.
- 413 for JSON bodies larger than Express's default 100 KB limit.
- 500 for unexpected errors, with details logged on the server.

Validation errors include field details.

To check validation manually, POST `{"title":"Incomplete"}` to `/books` using a JSON body. Expect HTTP 400 with `"error": "Validation failed"` and details for the missing fields. The following response illustrates a blank-title validation error.

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
2. Open the Postman desktop app and import [library-books.postman_collection.json](library-books.postman_collection.json) from the repository directory.
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

Newman is downloaded into the npm cache when needed. It is separate from the API's dependencies. If you changed the server port to 4000, append `--env-var baseUrl=http://localhost:4000` to the Newman command.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| `node` or `npm` is not recognized | Install Node.js and reopen the terminal |
| Node reports an unknown environment-file option | Check `node --version` and use Node.js 22.13 or later |
| `npm start` cannot find `dist/server.js` | Run `npm run build` first |
| Server reports `EADDRINUSE` | Stop the other process using the port, or change PORT in .env and restart |
| Postman cannot connect | Start the server and match the request URL or collection baseUrl to the port printed in the server terminal |
| GET `/books/1` returns 404 | Create a book and use its returned ID, since restarting clears all books |

## AI use

OpenAI Codex generated the initial project, route/controller/service structure, Book interface, Zod schemas, error handling, logging middleware, Postman collection, and this README in response to the assignment requirements. AI also executed the verification commands and inspected their results.

Implementation choices made by AI include sequential numeric IDs, the `/books` resource path, port 3001, default availability of true, strict rejection of unknown input fields, and JSON error responses.
