import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IUser, { USER_DOCUMENT_NAME } from './User';
import IProduct, { PRODUCT_DOCUMENT_NAME } from './Product';
import ISupplement, { SUPPLEMENT_DOCUMENT_NAME } from './Supplement';

export const CART_DOCUMENT_NAME = 'Cart';
const CART_COLLECTION_NAME = 'Carts';

export enum CartAction {
  PLUS = 'PLUS',
  MINUS = 'MINUS',
}

export interface ICartItem {
  _id: ObjectId;
  product: ObjectId | IProduct;
  supplements: ObjectId[] | ISupplement[];
  quantity: number;
}

export default interface ICart extends Document {
  userId: IUser | String;
  browserId: string;
  items: ICartItem[];
  deletedAt?: Date;
}

const schema = new Schema<ICart>(
  {
    browserId: {
      type: Schema.Types.String,
    },
    userId: {
      type: Schema.Types.String,
      ref: () => USER_DOCUMENT_NAME,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: () => PRODUCT_DOCUMENT_NAME,
        },
        supplements: [
          {
            type: Schema.Types.ObjectId,
            ref: () => SUPPLEMENT_DOCUMENT_NAME,
          },
        ],
        quantity: {
          type: Number,
        },
      },
    ],
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

export const CartModel = model<ICart, Pagination<ICart>>(
  CART_DOCUMENT_NAME,
  schema,
  CART_COLLECTION_NAME
);
