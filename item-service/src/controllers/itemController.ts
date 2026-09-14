import type { FastifyInstance } from "fastify";
import { ItemService } from "../services/itemService.js";
import { ItemsGetInQuerySchema, ItemUpdateInSchema } from "../validation.js";
import { ZodError } from "zod";

const service = new ItemService();

export const itemController = async (fastify: FastifyInstance) => {
  // GET /items
  fastify.get("/items", async (request) => {
    const params = ItemsGetInQuerySchema.parse(request.query);
    return service.getItems(params);
  });

  // GET /items/:id
  fastify.get<{ Params: { id: string } }>(
    "/items/:id",
    async (request, reply) => {
      const itemId = Number(request.params.id);
      if (!Number.isFinite(itemId)) {
        return reply.status(400).send({ error: "ID must be a number" });
      }
      const item = await service.getItem(itemId);
      if (!item) return reply.status(404).send({ error: "Item not found" });
      return item;
    },
  );

  // POST /items
  fastify.post("/items", async (request, reply) => {
    try {
      const data = ItemUpdateInSchema.parse(request.body);
      const item = await service.createItem(data as never);
      return reply.status(201).send({ id: item.id });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({ error: error.flatten() });
      }
      throw error;
    }
  });

  // PUT /items/:id
  fastify.put<{ Params: { id: string } }>(
    "/items/:id",
    async (request, reply) => {
      const itemId = Number(request.params.id);
      if (!Number.isFinite(itemId)) {
        return reply.status(400).send({ error: "ID must be a number" });
      }
      try {
        const data = ItemUpdateInSchema.parse(request.body);
        const result = await service.updateItem(itemId, data as never);
        if (result.error === "not_found")
          return reply.status(404).send({ error: "Item not found" });
        if (result.error === "forbidden")
          return reply.status(403).send({ error: "Forbidden" });
        return { success: true };
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.status(400).send({ error: error.flatten() });
        }
        throw error;
      }
    },
  );

  // DELETE /items/:id
  fastify.delete<{ Params: { id: string } }>(
    "/items/:id",
    async (request, reply) => {
      const itemId = Number(request.params.id);
      if (!Number.isFinite(itemId)) {
        return reply.status(400).send({ error: "ID must be a number" });
      }
      const result = await service.deleteItem(itemId);
      if (result.error === "not_found")
        return reply.status(404).send({ error: "Item not found" });
      if (result.error === "forbidden")
        return reply.status(403).send({ error: "Forbidden" });
      return { success: true };
    },
  );
};
