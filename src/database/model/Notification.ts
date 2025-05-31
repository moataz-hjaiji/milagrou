import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IUser from './User';

export const DOCUMENT_NAME = 'Notification';
export const COLLECTION_NAME = 'notifications';

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
      ref: 'User',
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
        ref: 'Order',
      },
      menuId: {
        type: Schema.Types.ObjectId,
        ref: 'Menu',
      },
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
      subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
      },
      ProductId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
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
>(DOCUMENT_NAME, schema, COLLECTION_NAME);
