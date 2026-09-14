import Fastify from "fastify";
import cors from "@fastify/cors";
import { connectDB } from "./config/database.js";
import { itemController } from "./controllers/itemController.js";

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: "*" });
await connectDB();
await fastify.register(itemController);

const port = Number(process.env.PORT) ?? 3001;

fastify.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Item Service ready at http://localhost:${port}`);
});
