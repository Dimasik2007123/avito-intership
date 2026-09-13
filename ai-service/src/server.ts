import Fastify from "fastify";
import cors from "@fastify/cors";
import { generateDescription, suggestPrice } from "./services/ollamaService.js";
import type { AIRequest } from "./types.js";

const fastify = Fastify({ logger: true });

await fastify.register(cors, { origin: "*" });

fastify.post<{ Body: AIRequest }>("/ai/description", async (request, reply) => {
  try {
    const { item } = request.body;
    const response = await generateDescription(item);
    return { response };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "AI service error" });
  }
});

fastify.post<{ Body: AIRequest }>("/ai/price", async (request, reply) => {
  try {
    const { item } = request.body;
    const response = await suggestPrice(item);
    return { response };
  } catch (error) {
    fastify.log.error(error);
    reply.status(500).send({ error: "AI service error" });
  }
});

const port = Number(process.env.PORT) ?? 3002;

fastify.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`AI Service ready at http://localhost:${port}`);
});
