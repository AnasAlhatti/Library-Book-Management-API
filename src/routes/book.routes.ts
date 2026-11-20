import { Router } from "express";
import * as bookController from "../controllers/book.controller.js";

export const bookRouter = Router();

bookRouter.get("/", bookController.listBooks);
bookRouter.get("/:id", bookController.getBook);
bookRouter.post("/", bookController.createBook);
bookRouter.patch("/:id", bookController.updateBook);
bookRouter.delete("/:id", bookController.deleteBook);
