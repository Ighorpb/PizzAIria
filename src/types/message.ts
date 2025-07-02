export type ChatMessage = {
  id?: number;
  from: "user" | "bot";
  text: string;
  createdAt?: string;
};
