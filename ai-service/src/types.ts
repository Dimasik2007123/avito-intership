export type ItemForAI = {
  title: string;
  category: string;
  description?: string;
  params: Record<string, unknown>;
};

export type AIRequest = {
  item: ItemForAI;
};

export type AIResponse = {
  response: string;
};
