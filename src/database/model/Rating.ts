import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import { ORDER_DOCUMENT_NAME } from './Order';
import IProduct from './Product';
import IUser, { USER_DOCUMENT_NAME } from './User';

export const RATING_DOCUMENT_NAME = 'Rating';
const RATING_COLLECTION_NAME = 'Ratings';

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
      ref: () => USER_DOCUMENT_NAME,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: () => ORDER_DOCUMENT_NAME,
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
  RATING_DOCUMENT_NAME,
  schema,
  RATING_COLLECTION_NAME
);
