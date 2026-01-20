import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Message } from "@shared/schema";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function useChatHistory() {
  return useQuery({
    queryKey: [api.chat.history.path],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}${api.chat.history.path}`);
      if (!res.ok) throw new Error("Failed to fetch chat history");
      return api.chat.history.responses[200].parse(await res.json()) as Message[];
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(`${API_BASE_URL}${api.chat.send.path}`, {
        method: api.chat.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      
      if (!res.ok) {
        if (res.status === 500) {
          const error = api.chat.send.responses[500].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to send message");
      }
      return api.chat.send.responses[200].parse(await res.json());
    },
    // We update the cache optimistically or invalidate after
    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>([api.chat.history.path], (old) => {
        return old ? [...old, newMessage] : [newMessage];
      });
    },
  });
}

export function useClearChat() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}${api.chat.clear.path}`, {
        method: api.chat.clear.method,
      });
      if (!res.ok) throw new Error("Failed to clear chat");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.chat.history.path], []);
    },
  });
}
