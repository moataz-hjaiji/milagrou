import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IUser, { USER_DOCUMENT_NAME } from './User';

export const CONVERSATION_DOCUMENT_NAME = 'Conversation';
const CONVERSATION_COLLECTION_NAME = 'Conversations';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default interface IConversation extends Document {
  userId: ObjectId | IUser;
  messages: IMessage[];
  lastActivity: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

const messageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const schema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: USER_DOCUMENT_NAME,
      required: true,
      index: true,
    },
    messages: [messageSchema],
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for efficient queries
schema.index({ userId: 1, lastActivity: -1 });
schema.index({ userId: 1, deletedAt: 1 });

// Add pagination plugin
schema.plugin(mongoosePagination);

// Add pre-find hooks
preFindHook(schema);

export const ConversationModel = model<IConversation & Pagination<IConversation>>(
  CONVERSATION_DOCUMENT_NAME,
  schema,
  CONVERSATION_COLLECTION_NAME
);
