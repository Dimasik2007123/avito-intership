export type Category = "auto" | "real_estate" | "electronics";
type Theme = "light" | "dark";
type Layout = "grid" | "list";

export type UiState = {
  theme: Theme;
};

export type AITooltipProps = {
  message: string;
  targetRef: React.RefObject<HTMLElement | null>;
  onApply: () => void;
  onClose: () => void;
};

export type AutoItemParams = {
  brand?: string;
  model?: string;
  yearOfManufacture?: number;
  transmission?: "automatic" | "manual";
  mileage?: number;
  enginePower?: number;
};

export type RealEstateItemParams = {
  type?: "flat" | "house" | "room";
  address?: string;
  area?: number;
  floor?: number;
};

export type ElectronicsItemParams = {
  type?: "phone" | "laptop" | "misc";
  brand?: string;
  model?: string;
  condition?: "new" | "used";
  color?: string;
};

export type MessageProps = {
  type: "success" | "error";
  onClose: () => void;
  duration?: number;
};

export type Item = {
  id: number;
  category: Category;
  title: string;
  description?: string;
  price: number;
  createdAt: string;
  updatedAt?: string;
  needsRevision: boolean;
  params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
};

export type ItemsGetOut = {
  items: Array<{
    id: number;
    category: Category;
    title: string;
    price: number;
    needsRevision: boolean;
  }>;
  total: number;
};

export type ItemUpdateIn = {
  category: "auto" | "real_estate" | "electronics";
  title: string;
  description?: string;
  price: number;
  params: AutoItemParams | RealEstateItemParams | ElectronicsItemParams;
};

export type GetItemsParams = {
  q?: string;
  limit?: number;
  skip?: number;
  needsRevision?: boolean;
  categories?: string;
  sortColumn?: "title" | "createdAt";
  sortDirection?: "asc" | "desc";
};

export type AdsState = {
  items: ItemsGetOut["items"];
  total: number;
  totalAll: number;
  currentItem: Item | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
};

export type FiltersState = {
  search: string;
  categories: Category[];
  needsRevisionOnly: boolean;
  sortColumn: "title" | "createdAt";
  sortDirection: "asc" | "desc";
  layout: Layout;
  page: number;
};

export type DraftState = {
  [key: string]: Partial<Item>;
};

export type AdCardProps = {
  id: number;
  title: string;
  layout: "grid" | "list";
  price: number;
  category: string;
  needsRevision: boolean;
};

export const categoryFields: Record<string, string[]> = {
  auto: [
    "brand",
    "model",
    "yearOfManufacture",
    "transmission",
    "mileage",
    "enginePower",
  ],
  real_estate: ["type", "address", "area", "floor"],
  electronics: ["type", "brand", "model", "condition", "color"],
};

export const paramLabels: Record<string, Record<string, string>> = {
  auto: {
    brand: "Бренд",
    model: "Модель",
    yearOfManufacture: "Год выпуска",
    transmission: "Коробка передач",
    mileage: "Пробег",
    enginePower: "Мощность двигателя",
  },
  real_estate: {
    type: "Тип",
    address: "Адрес",
    area: "Площадь",
    floor: "Этаж",
  },
  electronics: {
    type: "Тип",
    brand: "Бренд",
    model: "Модель",
    condition: "Состояние",
    color: "Цвет",
  },
};
