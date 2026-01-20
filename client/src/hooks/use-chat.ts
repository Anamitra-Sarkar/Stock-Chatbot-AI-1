import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type Message } from "@shared/schema";
import { getSessionId } from "@/lib/session";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function useChatHistory() {
  const sessionId = getSessionId();
  return useQuery({
    queryKey: [api.chat.history.path, sessionId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}${api.chat.history.path}?sessionId=${sessionId}`);
      if (!res.ok) throw new Error("Failed to fetch chat history");
      return api.chat.history.responses[200].parse(await res.json()) as Message[];
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();
  
  return useMutation({
    mutationFn: async (message: string) => {
      const res = await fetch(`${API_BASE_URL}${api.chat.send.path}`, {
        method: api.chat.send.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
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
    // ✅ OPTIMISTIC UI: User message appears instantly
    onMutate: async (message: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [api.chat.history.path, sessionId] });

      // Get current messages
      const previousMessages = queryClient.getQueryData<Message[]>([api.chat.history.path, sessionId]);

      // Optimistically add user message
      const optimisticUserMessage: Message = {
        id: Date.now(), // Temporary ID
        sessionId,
        role: "user",
        content: message,
        createdAt: new Date(),
      };

      queryClient.setQueryData<Message[]>(
        [api.chat.history.path, sessionId],
        (old) => [...(old || []), optimisticUserMessage]
      );

      return { previousMessages };
    },
    // Update cache with real message from backend
    onSuccess: (aiMessage) => {
      queryClient.setQueryData<Message[]>([api.chat.history.path, sessionId], (old) => {
        return old ? [...old, aiMessage] : [aiMessage];
      });
    },
    // If mutation fails, rollback to previous state
    onError: (_err, _message, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData([api.chat.history.path, sessionId], context.previousMessages);
      }
    },
  });
}

export function useClearChat() {
  const queryClient = useQueryClient();
  const sessionId = getSessionId();
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_BASE_URL}${api.chat.clear.path}`, {
        method: api.chat.clear.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) throw new Error("Failed to clear chat");
    },
    onSuccess: () => {
      queryClient.setQueryData([api.chat.history.path, sessionId], []);
    },
  });
}
