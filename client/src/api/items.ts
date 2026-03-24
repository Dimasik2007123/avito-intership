import axios from "axios";
import type { ItemsGetOut, Item, ItemUpdateIn, GetItemsParams } from "../types";

const API_URL = "/api";
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export const getItems = async (
  params: GetItemsParams,
): Promise<ItemsGetOut> => {
  const { data } = await api.get("/items", { params });
  return data;
};

export const getItem = async (id: number): Promise<Item> => {
  const { data } = await api.get(`/items/${id}`);
  return data;
};

export const updateItem = async (
  id: number,
  payload: ItemUpdateIn,
): Promise<{ success: boolean }> => {
  const { data } = await api.put(`/items/${id}`, payload);
  return data;
};
