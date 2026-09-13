import mongoose from "mongoose";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { ItemModel } from "./models/itemModel.js";
import { doesItemNeedRevision } from "./utils.js";
import type { Item } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CURRENT_USER_ID = "user-1";

const seed = async () => {
  const uri = process.env.MONGODB_URI ?? "mongodb://localhost:27017/avito";
  await mongoose.connect(uri);

  const filePath = join(__dirname, "../data/items.json");
  const raw = await readFile(filePath, "utf-8");
  const items = JSON.parse(raw) as Item[];

  for (const item of items) {
    if (!item.ownerId) {
      item.ownerId = item.id % 2 === 0 ? "user-2" : CURRENT_USER_ID;
    }
    (item as Item & { needsRevision: boolean }).needsRevision =
      item.ownerId === CURRENT_USER_ID ? doesItemNeedRevision(item) : false;
  }

  await ItemModel.deleteMany({});
  await ItemModel.insertMany(items);

  console.log(`Залито ${items.length} объявлений`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("Ошибка seed:", err);
  process.exit(1);
});
