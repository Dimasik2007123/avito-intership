import { ItemModel, type ItemDocument } from "../models/itemModel.js";

export class ItemRepository {
  async findAll(
    filter: Record<string, unknown>,
    sort: Record<string, 1 | -1>,
    skip: number,
    limit: number,
  ) {
    return ItemModel.find(filter).sort(sort).skip(skip).limit(limit).lean();
  }

  async count(filter: Record<string, unknown>) {
    return ItemModel.countDocuments(filter);
  }

  async findById(id: number) {
    return ItemModel.findOne({ id }).lean();
  }

  async create(data: ItemDocument) {
    return ItemModel.create(data);
  }

  async update(id: number, data: Partial<ItemDocument>) {
    return ItemModel.findOneAndUpdate({ id }, data, { new: true }).lean();
  }

  async delete(id: number) {
    return ItemModel.findOneAndDelete({ id }).lean();
  }

  async getMaxId(): Promise<number> {
    const item = await ItemModel.findOne().sort({ id: -1 }).lean();
    return item?.id ?? 0;
  }
}
