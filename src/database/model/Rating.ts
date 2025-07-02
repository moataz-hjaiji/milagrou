import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IProduct, { PRODUCT_DOCUMENT_NAME } from './Product';
import IUser, { USER_DOCUMENT_NAME } from './User';

export const RATING_DOCUMENT_NAME = 'Rating';
const RATING_COLLECTION_NAME = 'Ratings';

export default interface IRating extends Document {
  userId: IUser | ObjectId | string;
  productId: IProduct | ObjectId | string;
  rating: number;
  comment: string;
  isAccepted: boolean;
  deletedAt?: Date;
}

const schema = new Schema<IRating>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: () => USER_DOCUMENT_NAME,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: () => PRODUCT_DOCUMENT_NAME,
    },
    rating: {
      type: Schema.Types.Number,
    },
    comment: {
      type: Schema.Types.String,
    },
    isAccepted: {
      type: Schema.Types.Boolean,
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
