import { HttpError } from "../errors/http-error.js";
import type { Book } from "../models/book.js";
import type { CreateBookInput, UpdateBookInput } from "../schemas/book.schema.js";

const books = new Map<number, Book>();
let nextBookId = 1;

export function listBooks(): Book[] {
  return Array.from(books.values());
}

export function getBook(id: number): Book {
  const book = books.get(id);
  if (!book) {
    throw new HttpError(404, "Book not found");
  }
  return book;
}

export function createBook(input: CreateBookInput): Book {
  const book: Book = { ...input, id: nextBookId++ };
  books.set(book.id, book);
  return book;
}

export function updateBook(id: number, input: UpdateBookInput): Book {
  const book = { ...getBook(id), ...input };
  books.set(id, book);
  return book;
}

export function deleteBook(id: number): void {
  getBook(id);
  books.delete(id);
}
