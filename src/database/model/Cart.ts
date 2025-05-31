import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IUser, { USER_DOCUMENT_NAME } from './User';
import IProduct, { PRODUCT_DOCUMENT_NAME } from './Product';

export const CART_DOCUMENT_NAME = 'Cart';
const CART_COLLECTION_NAME = 'Carts';

export enum CartAction {
  PLUS = 'PLUS',
  MINUS = 'MINUS',
}

export interface ICartItem {
  _id: ObjectId;
  product: ObjectId | IProduct;
  quantity: number;
  notes?: string;
}

export default interface ICart extends Document {
  userId: IUser | ObjectId;
  items: ICartItem[];
  deletedAt?: Date;
}

const schema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: () => USER_DOCUMENT_NAME,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: () => PRODUCT_DOCUMENT_NAME,
        },
        quantity: {
          type: Number,
        },
        notes: {
          type: Schema.Types.String,
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
