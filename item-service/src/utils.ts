import type { Item } from "./types.js";
import {
  AutoItemParamsSchema,
  ElectronicsItemParamsSchema,
  RealEstateItemParamsSchema,
} from "./validation.js";

export const doesItemNeedRevision = (item: Item): boolean =>
  !Boolean(item.description) ||
  !(() => {
    if (item.category === "auto")
      return AutoItemParamsSchema.safeParse(item.params).success;
    if (item.category === "real_estate")
      return RealEstateItemParamsSchema.safeParse(item.params).success;
    return ElectronicsItemParamsSchema.safeParse(item.params).success;
  })();
