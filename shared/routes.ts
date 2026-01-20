import { z } from "zod";
import { messages } from "./schema";

export const api = {
  chat: {
    send: {
      method: "POST" as const,
      path: "/api/chat",
      input: z.object({
        message: z.string(),
      }),
      responses: {
        200: z.custom<typeof messages.$inferSelect>(), // Returns the assistant's response message
        500: z.object({ message: z.string() }),
      },
    },
    history: {
      method: "GET" as const,
      path: "/api/messages",
      responses: {
        200: z.array(z.custom<typeof messages.$inferSelect>()),
      },
    },
    clear: {
      method: "POST" as const,
      path: "/api/chat/clear",
      responses: {
        204: z.void(),
      },
    }
  },
};
