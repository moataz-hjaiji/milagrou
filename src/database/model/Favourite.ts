import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IProduct from './Product';
import IUser from './User';

export const DOCUMENT_NAME = 'Favourite';
export const COLLECTION_NAME = 'favourites';

export default interface IFavourite extends Document {
  userId: IUser | ObjectId | string;
  product: IProduct | ObjectId | string;
  deletedAt?: Date;
}

const schema = new Schema<IFavourite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
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
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
