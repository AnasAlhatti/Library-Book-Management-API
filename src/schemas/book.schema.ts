import { z } from "zod";

export const createBookSchema = z.strictObject({
  title: z.string().trim().min(1),
  author: z.string().trim().min(1),
  genre: z.string().trim().min(1),
  available: z.boolean().default(true),
});

export const updateBookSchema = createBookSchema
  .omit({ available: true })
  .extend({ available: z.boolean() })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one field to update",
  });

export const bookIdSchema = z.string()
  .regex(/^[1-9]\d*$/, "Book ID must be a positive integer")
  .transform(Number)
  .pipe(z.int().positive());

export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
