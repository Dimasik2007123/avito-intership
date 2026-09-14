import type { FastifyInstance } from "fastify";
import {
  generateDescription,
  suggestPrice,
} from "../services/ollamaService.js";
import type { AIRequest } from "../types.js";

export const aiController = async (fastify: FastifyInstance) => {
  // POST /ai/description
  fastify.post<{ Body: AIRequest }>(
    "/ai/description",
    async (request, reply) => {
      try {
        const { item } = request.body;
        const response = await generateDescription(item);
        return { response };
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ error: "AI service error" });
      }
    },
  );

  // POST /ai/price
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
};
