import Fastify from "fastify";
import cors from "@fastify/cors";
import proxy from "@fastify/http-proxy";

const gateway = Fastify({ logger: true });

await gateway.register(cors, { origin: "*" });

const ITEM_SERVICE = process.env.ITEM_SERVICE_URL ?? "http://localhost:3001";
const AI_SERVICE = process.env.AI_SERVICE_URL ?? "http://localhost:3002";

// /api/items/* -> Item Service
await gateway.register(proxy, {
  upstream: ITEM_SERVICE,
  prefix: "/api/items",
  rewritePrefix: "/items",
});

// /api/ai/* -> AI Service
await gateway.register(proxy, {
  upstream: AI_SERVICE,
  prefix: "/api/ai",
  rewritePrefix: "/ai",
});

const port = Number(process.env.PORT) ?? 8080;

gateway.listen({ port, host: "0.0.0.0" }, (err) => {
  if (err) {
    gateway.log.error(err);
    process.exit(1);
  }
  console.log(`API Gateway ready at http://localhost:${port}`);
});
