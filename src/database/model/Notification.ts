import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import { CATEGORY_DOCUMENT_NAME } from './Category';
import { ORDER_DOCUMENT_NAME } from './Order';
import { PRODUCT_DOCUMENT_NAME } from './Product';
import IUser, { USER_DOCUMENT_NAME } from './User';

export const NOTIFICATION_DOCUMENT_NAME = 'Notification';
const NOTIFICATION_COLLECTION_NAME = 'Notifications';

export default interface INotification extends Document {
  userId: IUser | ObjectId | string;
  title: string;
  body: string;
  data: object;
  isRead: boolean;
  isSeen: boolean;
  deletedAt?: Date;
}

const schema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: () => USER_DOCUMENT_NAME,
    },
    title: {
      type: Schema.Types.String,
      trim: true,
    },
    body: {
      type: Schema.Types.String,
      trim: true,
    },
    data: {
      orderId: {
        type: Schema.Types.ObjectId,
        ref: () => ORDER_DOCUMENT_NAME,
      },
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: () => CATEGORY_DOCUMENT_NAME,
      },
      ProductId: {
        type: Schema.Types.ObjectId,
        ref: () => PRODUCT_DOCUMENT_NAME,
      },
    },
    isRead: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isSeen: {
      type: Schema.Types.Boolean,
      default: false,
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

export const NotificationModel = model<
  INotification,
  Pagination<INotification>
>(NOTIFICATION_DOCUMENT_NAME, schema, NOTIFICATION_COLLECTION_NAME);
