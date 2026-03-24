import axios from "axios";
import type { Item } from "../types";

const OLLAMA_URL = "http://localhost:11434/api/generate";

export const generateDescription = async (
  item: Partial<Item>,
): Promise<string> => {
  const prompt = `Напиши на русском языке. Нужно очень кратко. Улучши текущее описание товара:
Название: ${item.title}
Категория: ${item.category}
Характеристики: ${JSON.stringify(item.params)}
${item.description ? `Текущее описание: ${item.description}` : ""}. В описании - не более 20 слов. В формате связного текста, без списков`;
  const response = await axios.post(OLLAMA_URL, {
    model: "llama3",
    prompt: prompt,
    stream: false,
    options: { temperature: 0.7 },
  });

  return response.data.response;
};

export const suggestPrice = async (item: Partial<Item>): Promise<string> => {
  const prompt = `Ты эксперт по оценке техники. Определи рыночную цену для:
Товар: ${item.title}
Категория: ${item.category}
Характеристики: ${JSON.stringify(item.params)}

ОТВЕТЬ СТРОГО В ФОРМАТЕ:

ЦЕНЫ:
- [диапазон] ₽ — [состояние]
- [диапазон] ₽ — [состояние]
- [диапазон] ₽ — [состояние]

Например:
ЦЕНЫ:
- 115000 – 135000 ₽ — отличное состояние
- 140000 – 160000 ₽ — идеал, малый износ
- 90000 – 110000 ₽ — срочно или с дефектами`;
  const response = await axios.post(OLLAMA_URL, {
    model: "llama3",
    prompt: prompt,
    stream: false,
    options: { temperature: 0.7 },
  });

  return response.data.response;
};
