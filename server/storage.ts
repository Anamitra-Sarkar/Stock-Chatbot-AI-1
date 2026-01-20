import { type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearMessages(): Promise<void>;
}

// In-memory storage implementation (no database required)
export class InMemoryStorage implements IStorage {
  private messages: Message[] = [];
  private nextId = 1;

  async getMessages(): Promise<Message[]> {
    return [...this.messages];
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.nextId++,
      role: insertMessage.role,
      content: insertMessage.content,
      createdAt: new Date(),
    };
    this.messages.push(message);
    return message;
  }

  async clearMessages(): Promise<void> {
    this.messages = [];
  }
}

// Use in-memory storage by default (no database required)
export const storage = new InMemoryStorage();
