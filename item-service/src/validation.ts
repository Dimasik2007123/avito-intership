import { z } from "zod";

export const ITEM_CATEGORIES = {
  AUTO: "auto",
  REAL_ESTATE: "real_estate",
  ELECTRONICS: "electronics",
} as const;

const AutoTransmissionSchema = z.enum(["automatic", "manual"]);

export const AutoItemParamsSchema = z.strictObject({
  brand: z.string().nonempty(),
  model: z.string().nonempty(),
  yearOfManufacture: z.number().int().positive(),
  transmission: AutoTransmissionSchema,
  mileage: z.number().positive(),
  enginePower: z.number().int().positive(),
});

const RealEstateTypeSchema = z.enum(["flat", "house", "room"]);

export const RealEstateItemParamsSchema = z.strictObject({
  type: RealEstateTypeSchema,
  address: z.string().nonempty(),
  area: z.number().positive(),
  floor: z.number().int().positive(),
});

const ElectronicsTypeSchema = z.enum(["phone", "laptop", "misc"]);
const ElectronicsConditionSchema = z.enum(["new", "used"]);

export const ElectronicsItemParamsSchema = z.strictObject({
  type: ElectronicsTypeSchema,
  brand: z.string().nonempty(),
  model: z.string().nonempty(),
  condition: ElectronicsConditionSchema,
  color: z.string().nonempty(),
});

const CategorySchema = z.enum(["auto", "real_estate", "electronics"]);

export const ItemsGetInQuerySchema = z.object({
  q: z.string().trim().optional().default(""),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().positive().optional().default(10)),
  skip: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined))
    .pipe(z.number().int().min(0).optional().default(0)),
  categories: z
    .string()
    .optional()
    .transform((v) => (v ? v.split(",").map((s) => s.trim()) : undefined))
    .pipe(z.array(CategorySchema).optional()),
  needsRevision: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1")
    .pipe(z.boolean().default(false)),
  mine: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0")
    .pipe(z.boolean().default(true)),
  sortColumn: z.enum(["title", "createdAt"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export const ItemUpdateInSchema = z
  .object({
    category: CategorySchema,
    title: z.string(),
    description: z.string().optional(),
    price: z.number().min(0),
  })
  .and(
    z.discriminatedUnion("category", [
      z.object({
        category: z.literal(ITEM_CATEGORIES.AUTO),
        params: AutoItemParamsSchema.partial(),
      }),
      z.object({
        category: z.literal(ITEM_CATEGORIES.REAL_ESTATE),
        params: RealEstateItemParamsSchema.partial(),
      }),
      z.object({
        category: z.literal(ITEM_CATEGORIES.ELECTRONICS),
        params: ElectronicsItemParamsSchema.partial(),
      }),
    ]),
  );
