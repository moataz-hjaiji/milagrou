import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IUser, { USER_DOCUMENT_NAME } from './User';

export const FEEDBACK_DOCUMENT_NAME = 'Feedback';
const FEEDBACK_COLLECTION_NAME = 'Feedbacks';

export default interface IFeedback extends Document {
  userId: IUser | ObjectId;
  message: string;
  deletedAt?: Date;
}

const schema = new Schema<IFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: () => USER_DOCUMENT_NAME,
    },
    message: {
      type: Schema.Types.String,
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

preFindHook(schema);
schema.plugin(mongoosePagination);

export const FeedbackModel = model<IFeedback, Pagination<IFeedback>>(
  FEEDBACK_DOCUMENT_NAME,
  schema,
  FEEDBACK_COLLECTION_NAME
);
