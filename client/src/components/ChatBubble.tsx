import { type Message } from "@shared/schema";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full gap-4 p-4 md:p-6 transition-colors duration-200",
        isAssistant ? "bg-card/50" : "bg-transparent"
      )}
    >
      <div className="shrink-0 flex flex-col items-center gap-2">
        <div
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shadow-lg",
            isAssistant
              ? "bg-primary text-primary-foreground shadow-primary/20"
              : "bg-secondary text-secondary-foreground"
          )}
        >
          {isAssistant ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
        </div>
      </div>

      <div className="flex-1 min-w-0 space-y-1 w-full box-border overflow-hidden px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground font-display">
            {isAssistant ? "Stock AI" : "You"}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.createdAt && format(new Date(message.createdAt), "h:mm a")}
          </span>
        </div>
        
        <div className="prose prose-invert prose-sm w-full max-w-full leading-relaxed text-foreground/90 font-body break-words overflow-hidden">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto w-full my-4">
                  <table className="border-collapse border border-border min-w-full" {...props} />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th className="border border-border bg-secondary/50 p-2 text-xs md:text-sm whitespace-nowrap" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-border p-2 text-xs md:text-sm whitespace-nowrap" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="break-words w-full max-w-full" {...props} />
              ),
              code: ({ node, inline, className, children, ...props }: {
                node?: any;
                inline?: boolean;
                className?: string;
                children?: React.ReactNode;
              }) => (
                inline ? (
                  <code className="break-words" {...props}>{children}</code>
                ) : (
                  <code className="block overflow-x-auto" {...props}>{children}</code>
                )
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
