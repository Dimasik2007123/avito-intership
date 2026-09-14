import Fastify from "fastify";
import cors from "@fastify/cors";
import { aiController } from "./controllers/aiController.js";

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: "*" });
await fastify.register(aiController);

const port = Number(process.env.PORT) ?? 3002;

fastify.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`AI Service ready at http://localhost:${port}`);
});
