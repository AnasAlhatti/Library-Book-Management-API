import { z } from "zod";
import { app } from "./app.js";

const port = z.coerce.number().int().min(1).max(65535).parse(process.env.PORT ?? "3001");
const server = app.listen(port, () => {
  console.log(`Library Book Management API listening on http://localhost:${port}`);
});
server.on("error", (error) => {
  console.error("Failed to start server", error.message);
  process.exitCode = 1;
});
