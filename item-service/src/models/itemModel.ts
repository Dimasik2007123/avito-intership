import mongoose, { Schema, type Document } from "mongoose";
import type { Item } from "../types.js";

export interface ItemDocument extends Omit<Item, "id">, Document {
  id: number;
}

const ItemSchema = new Schema<ItemDocument>(
  {
    id: { type: Number, required: true, unique: true },
    ownerId: { type: String, required: true },
    category: {
      type: String,
      enum: ["auto", "real_estate", "electronics"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, default: null },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
    params: { type: Schema.Types.Mixed, default: {} },
    needsRevision: { type: Boolean, default: false },
  },
  { collection: "items" },
);

export const ItemModel = mongoose.model<ItemDocument>("Item", ItemSchema);
