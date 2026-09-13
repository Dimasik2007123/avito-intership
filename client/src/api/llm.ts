import axios from "axios";
import type { Item } from "../types";

const API_URL = "/api/ai";

export const generateDescription = async (
  item: Partial<Item>,
): Promise<string> => {
  const { data } = await axios.post(`${API_URL}/description`, { item });
  return data.response;
};

export const suggestPrice = async (item: Partial<Item>): Promise<string> => {
  const { data } = await axios.post(`${API_URL}/price`, { item });
  return data.response;
};
