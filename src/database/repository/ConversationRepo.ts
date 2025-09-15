import { Types } from 'mongoose';
import IConversation, { ConversationModel, IMessage } from '../model/Conversation';

export default class ConversationRepo {
  public static async findByUserId(userId: Types.ObjectId): Promise<IConversation | null> {
    return ConversationModel.findOne({ userId }).exec();
  }

  public static async create(userId: Types.ObjectId): Promise<IConversation> {
    const conversation = new ConversationModel({
      userId,
      messages: [],
      lastActivity: new Date(),
    });
    
    return conversation.save();
  }

  public static async addMessage(
    conversationId: Types.ObjectId,
    message: Omit<IMessage, 'timestamp'>
  ): Promise<IConversation | null> {
    const messageWithTimestamp: IMessage = {
      ...message,
      timestamp: new Date(),
    };

    return ConversationModel.findByIdAndUpdate(
      conversationId,
      {
        $push: { messages: messageWithTimestamp },
        $set: { lastActivity: new Date() }
      },
      { new: true }
    ).exec();
  }

  public static async getMessages(conversationId: Types.ObjectId): Promise<IMessage[]> {
    const conversation = await ConversationModel.findById(conversationId).exec();
    return conversation?.messages || [];
  }

  public static async updateLastActivity(conversationId: Types.ObjectId): Promise<void> {
    await ConversationModel.findByIdAndUpdate(
      conversationId,
      { lastActivity: new Date() }
    ).exec();
  }

  public static async deleteConversation(conversationId: Types.ObjectId): Promise<boolean> {
    const result = await ConversationModel.findByIdAndUpdate(
      conversationId,
      { deletedAt: new Date() }
    ).exec();
    
    return !!result;
  }

  public static async getUserConversations(
    userId: Types.ObjectId,
    limit: number = 10,
    skip: number = 0
  ): Promise<IConversation[]> {
    return ConversationModel.find({ userId })
      .sort({ lastActivity: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }
}
