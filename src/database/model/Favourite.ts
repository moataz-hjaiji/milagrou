import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IProduct, { PRODUCT_DOCUMENT_NAME } from './Product';
import IUser, { USER_DOCUMENT_NAME } from './User';

export const FAVOURITE_DOCUMENT_NAME = 'Favourite';
const FAVOURITE_COLLECTION_NAME = 'Favourites';

export default interface IFavourite extends Document {
  userId: IUser | ObjectId | string;
  product: IProduct | ObjectId | string;
  deletedAt?: Date;
}

const schema = new Schema<IFavourite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: () => USER_DOCUMENT_NAME,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: () => PRODUCT_DOCUMENT_NAME,
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

export const FavouriteModel = model<IFavourite, Pagination<IFavourite>>(
  FAVOURITE_DOCUMENT_NAME,
  schema,
  FAVOURITE_COLLECTION_NAME
);
