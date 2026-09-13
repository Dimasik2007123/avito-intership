import type { ItemForAI } from "../types.js";

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const MODEL = process.env.OLLAMA_MODEL ?? "llama3";

type OllamaResponse = {
  response: string;
};

export const generateDescription = async (item: ItemForAI): Promise<string> => {
  const prompt = `Напиши на русском языке. Нужно очень кратко. Улучши текущее описание товара:
Название: ${item.title}
Категория: ${item.category}
Характеристики: ${JSON.stringify(item.params)}
${item.description ? `Текущее описание: ${item.description}` : ""}. В описании - не более 20 слов. В формате связного текста, без списков`;

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = (await response.json()) as OllamaResponse;
  return data.response;
};

export const suggestPrice = async (item: ItemForAI): Promise<string> => {
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

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.7 },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = (await response.json()) as OllamaResponse;
  return data.response;
};
