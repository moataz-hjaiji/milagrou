import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IProduct from './Product';
import IUser from './User';

export const DOCUMENT_NAME = 'Rating';
export const COLLECTION_NAME = 'ratings';

export default interface IRating extends Document {
  userId: IUser | ObjectId | string;
  orderId: IProduct | ObjectId | string;
  foodRating: number;
  foodComment: string;
  deliveryRating: number;
  deliveryComment: string;
  deletedAt?: Date;
}

const schema = new Schema<IRating>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    foodRating: {
      type: Schema.Types.Number,
    },
    foodComment: {
      type: Schema.Types.String,
    },
    deliveryRating: {
      type: Schema.Types.Number,
    },
    deliveryComment: {
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

export const RatingModel = model<IRating, Pagination<IRating>>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
