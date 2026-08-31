import { z } from "zod";

export const chatbotQuerySchema = z.object({
  query: z
    .string()
    .min(1, "Please enter a question or keyword.")
    .max(500, "Query is too long."),
});

export type ChatbotQueryFormValues = z.infer<typeof chatbotQuerySchema>;
