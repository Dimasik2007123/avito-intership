import { ItemRepository } from "../repositories/itemRepository.js";
import { doesItemNeedRevision } from "../utils.js";
import type { Item } from "../types.js";

const repo = new ItemRepository();
const CURRENT_USER_ID = "user-1";

export class ItemService {
  async getItems(params: {
    q: string;
    limit: number;
    skip: number;
    categories?: string[];
    needsRevision?: boolean;
    mine: boolean;
    sortColumn?: string;
    sortDirection?: "asc" | "desc";
  }) {
    const filter: Record<string, unknown> = {};

    if (params.q) filter.title = { $regex: params.q, $options: "i" };
    if (params.mine) filter.ownerId = CURRENT_USER_ID;
    if (params.categories?.length) filter.category = { $in: params.categories };

    if (params.needsRevision) {
      filter.needsRevision = true;
      filter.ownerId = CURRENT_USER_ID;
    }

    const sort: Record<string, 1 | -1> = {};
    if (params.sortColumn && params.sortDirection) {
      sort[params.sortColumn] = params.sortDirection === "desc" ? -1 : 1;
    }

    const items = await repo.findAll(filter, sort, params.skip, params.limit);
    const total = await repo.count(filter);

    const mapped = items.map((item) => ({
      id: item.id,
      category: item.category,
      title: item.title,
      price: item.price,
      isMine: item.ownerId === CURRENT_USER_ID,
      needsRevision: item.needsRevision ?? false,
    }));

    return { items: mapped, total };
  }

  async getItem(id: number) {
    const item = await repo.findById(id);
    if (!item) return null;
    return {
      ...item,
      isMine: item.ownerId === CURRENT_USER_ID,
      needsRevision: item.needsRevision ?? false,
    };
  }

  async createItem(
    data: Omit<Item, "id" | "createdAt" | "updatedAt" | "ownerId">,
  ) {
    const now = new Date().toISOString();
    const maxId = await repo.getMaxId();

    const needsRevision = doesItemNeedRevision({
      ...data,
      id: maxId + 1,
      ownerId: CURRENT_USER_ID,
      createdAt: now,
      updatedAt: now,
    } as Item);

    return repo.create({
      ...data,
      id: maxId + 1,
      ownerId: CURRENT_USER_ID,
      createdAt: now,
      updatedAt: now,
      needsRevision,
    } as never);
  }

  async updateItem(id: number, data: Partial<Item>) {
    const item = await repo.findById(id);
    if (!item) return { error: "not_found" as const };
    if (item.ownerId !== CURRENT_USER_ID)
      return { error: "forbidden" as const };

    const merged = {
      ...item,
      ...data,
      updatedAt: new Date().toISOString(),
    } as Item;

    const needsRevision = doesItemNeedRevision(merged);

    const updated = await repo.update(id, {
      ...data,
      updatedAt: merged.updatedAt,
      needsRevision,
    } as never);
    return { item: updated };
  }

  async deleteItem(id: number) {
    const item = await repo.findById(id);
    if (!item) return { error: "not_found" as const };
    if (item.ownerId !== CURRENT_USER_ID)
      return { error: "forbidden" as const };

    await repo.delete(id);
    return { success: true };
  }
}
