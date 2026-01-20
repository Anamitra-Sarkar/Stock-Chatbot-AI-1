import { useEffect, useRef } from "react";
import { useChatHistory, useSendMessage, useClearChat } from "@/hooks/use-chat";
import { ChatBubble } from "@/components/ChatBubble";
import { ChatInput } from "@/components/ChatInput";
import { Sidebar } from "@/components/Sidebar";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, Compass, Newspaper, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  {
    text: "Analyze the Indian stock market with today's key signals",
    icon: TrendingUp,
  },
  {
    text: "Analyse Conditions of Large, Mid and Small Cap in Indian Market",
    icon: Compass,
  },
  {
    text: "Track major stock market events shaping investor sentiment",
    icon: Newspaper,
  },
  {
    text: "How global news connects with Indian market movements",
    icon: Globe,
  },
];

export default function Chat() {
  const { data: messages, isLoading: isLoadingHistory } = useChatHistory();
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = (message: string) => {
    sendMessage(message, {
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Error sending message",
          description: error.message,
        });
      },
    });
  };

  const { mutate: clearChat } = useClearChat();
  const handleNewChat = () => {
    clearChat(undefined, {
      onSuccess: () => {
        toast({
          title: "New Chat Started",
          description: "Previous history has been cleared.",
        });
      }
    });
  };

  return (
    <div className="flex h-screen bg-transparent text-foreground overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-h-screen relative">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur z-10 sticky top-0 cursor-pointer" onClick={handleNewChat}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold font-display tracking-tight">StockAI</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          {isLoadingHistory ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p>Loading market data...</p>
            </div>
          ) : messages?.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full flex flex-col items-center justify-center p-4 md:p-8 text-center max-w-4xl mx-auto"
            >
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 shadow-xl border border-primary/20"
              >
                <TrendingUp className="w-10 h-10 text-primary" />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 font-display">Market Intelligence AI</h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-md mb-8 md:mb-12 px-4">
                Ask me about stock trends, market analysis, or financial concepts. I'm here to help you navigate the markets.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                {SUGGESTIONS.map((suggestion, index) => (
                  <motion.button
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    key={suggestion.text}
                    onClick={() => handleSend(suggestion.text)}
                    className="p-4 md:p-6 text-left rounded-xl bg-card/40 backdrop-blur-md border border-border/50 hover:border-primary/50 hover:bg-card/60 hover:shadow-xl transition-all duration-300 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-secondary/50 group-hover:bg-primary/20 transition-colors">
                        <suggestion.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium leading-relaxed">{suggestion.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="pb-32 pt-4 px-2 md:px-4 max-w-4xl mx-auto w-full">
              <AnimatePresence initial={false}>
                {messages?.map((msg: any) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChatBubble message={msg} />
                  </motion.div>
                ))}
              </AnimatePresence>
              {isSending && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex w-full gap-4 p-4 md:p-6 bg-card/50 backdrop-blur-sm rounded-xl"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                    <Loader2 className="w-5 h-5 text-primary-foreground animate-spin" />
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground animate-pulse">
                      Analyzing market data...
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 via-background/60 to-transparent pt-20 pb-6 z-10 px-4">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={handleSend} isLoading={isSending} />
          </div>
        </div>
      </main>
    </div>
  );
}
