import { type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  getMessages(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearMessages(sessionId: string): Promise<void>;
}

// In-memory storage implementation (no database required)
export class InMemoryStorage implements IStorage {
  private messages: Map<string, Message[]> = new Map();
  private nextId = 1;

  async getMessages(sessionId: string): Promise<Message[]> {
    const sessionMessages = this.messages.get(sessionId) || [];
    return [...sessionMessages];
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.nextId++,
      sessionId: insertMessage.sessionId,
      role: insertMessage.role,
      content: insertMessage.content,
      createdAt: new Date(),
    };
    
    const sessionMessages = this.messages.get(insertMessage.sessionId) || [];
    sessionMessages.push(message);
    this.messages.set(insertMessage.sessionId, sessionMessages);
    
    return message;
  }

  async clearMessages(sessionId: string): Promise<void> {
    this.messages.delete(sessionId);
  }
}

// Use in-memory storage by default (no database required)
export const storage = new InMemoryStorage();
