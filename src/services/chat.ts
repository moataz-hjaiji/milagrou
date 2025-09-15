import OpenAI from 'openai';
import { Types } from 'mongoose';
import ConversationRepo from '../database/repository/ConversationRepo';
import { IMessage } from '../database/model/Conversation';
import { BadRequestError, InternalError } from '../core/ApiError';
import Logger from '../core/Logger';

export interface ChatRequest {
  message: string;
  userId: Types.ObjectId;
}

export interface ChatResponse {
  reply: string;
  conversationId: string;
  timestamp: Date;
}

class ChatService {
  private openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new InternalError('OpenAI API key is not configured');
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Process a chat message from user
   */
  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const { message, userId } = request;

      if (!message || !message.trim()) {
        throw new BadRequestError('Message cannot be empty');
      }

      // Get or create conversation
      let conversation = await ConversationRepo.findByUserId(userId);
      if (!conversation) {
        Logger.info(`Creating new conversation for user: ${userId}`);
        conversation = await ConversationRepo.create(userId);
      }

      // Add user message to conversation
      const userMessage: Omit<IMessage, 'timestamp'> = {
        role: 'user',
        content: message.trim(),
      };

      await ConversationRepo.addMessage(conversation._id, userMessage);
      Logger.info(`User message added to conversation: ${conversation._id}`);

      // Get all messages for context
      const messages = await ConversationRepo.getMessages(conversation._id);
      
      // Prepare messages for OpenAI (convert to OpenAI format)
      const openaiMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Add system message for context
      const systemMessage = {
        role: 'system' as const,
        content: `You are a helpful AI assistant for an e-commerce platform. 
                 You can help users with product recommendations, order inquiries, 
                 general shopping questions, and customer support. 
                 Be friendly, helpful, and concise in your responses.`,
      };

      // Call OpenAI API
      Logger.info('Calling OpenAI API for chat completion');
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...openaiMessages],
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const assistantReply = completion.choices[0]?.message?.content;
      if (!assistantReply) {
        throw new InternalError('Failed to get response from OpenAI');
      }

      // Add assistant message to conversation
      const assistantMessage: Omit<IMessage, 'timestamp'> = {
        role: 'assistant',
        content: assistantReply,
      };

      await ConversationRepo.addMessage(conversation._id, assistantMessage);
      Logger.info(`Assistant reply added to conversation: ${conversation._id}`);

      return {
        reply: assistantReply,
        conversationId: conversation._id.toString(),
        timestamp: new Date(),
      };
    } catch (error) {
      Logger.error('Error in chat service:', error);
      
      if (error instanceof BadRequestError || error instanceof InternalError) {
        throw error;
      }
      
      // Handle OpenAI specific errors
      if (error instanceof OpenAI.APIError) {
        Logger.error('OpenAI API Error:', error);
        throw new InternalError('Chat service temporarily unavailable');
      }
      
      throw new InternalError('An unexpected error occurred');
    }
  }

  /**
   * Get conversation history for a user
   */
  async getConversationHistory(userId: Types.ObjectId): Promise<IMessage[]> {
    try {
      const conversation = await ConversationRepo.findByUserId(userId);
      if (!conversation) {
        return [];
      }

      return await ConversationRepo.getMessages(conversation._id);
    } catch (error) {
      Logger.error('Error getting conversation history:', error);
      throw new InternalError('Failed to retrieve conversation history');
    }
  }

  /**
   * Clear conversation history for a user
   */
  async clearConversation(userId: Types.ObjectId): Promise<boolean> {
    try {
      const conversation = await ConversationRepo.findByUserId(userId);
      if (!conversation) {
        return true; // Nothing to clear
      }

      return await ConversationRepo.deleteConversation(conversation._id);
    } catch (error) {
      Logger.error('Error clearing conversation:', error);
      throw new InternalError('Failed to clear conversation');
    }
  }
}

export default new ChatService();
