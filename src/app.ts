import express from "express";
import { bookRouter } from "./routes/book.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { HttpError } from "./errors/http-error.js";

export const app = express();

app.use((request, _response, next) => {
  console.log(`${request.method} ${request.path}`);
  next();
});
app.use(express.json());
app.use("/books", bookRouter);
app.use((_request, _response, next) => {
  next(new HttpError(404, "Route not found"));
});
app.use(errorHandler);
