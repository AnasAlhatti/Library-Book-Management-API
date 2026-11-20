import type { Request, Response } from "express";
import * as bookService from "../services/book.service.js";
import { bookIdSchema, createBookSchema, updateBookSchema } from "../schemas/book.schema.js";

export function listBooks(_request: Request, response: Response): void {
  response.json(bookService.listBooks());
}

export function getBook(request: Request, response: Response): void {
  const id = bookIdSchema.parse(request.params.id);
  response.json(bookService.getBook(id));
}

export function createBook(request: Request, response: Response): void {
  const input = createBookSchema.parse(request.body);
  const book = bookService.createBook(input);
  response.location(`/books/${book.id}`).status(201).json(book);
}

export function updateBook(request: Request, response: Response): void {
  const id = bookIdSchema.parse(request.params.id);
  const input = updateBookSchema.parse(request.body);
  response.json(bookService.updateBook(id, input));
}

export function deleteBook(request: Request, response: Response): void {
  const id = bookIdSchema.parse(request.params.id);
  bookService.deleteBook(id);
  response.status(204).end();
}
