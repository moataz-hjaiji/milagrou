import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IUser from './User';
import IProduct from './Product';
import ISupplementCategory from './SupplementCategory';
import ISupplement from './Supplement';

export const DOCUMENT_NAME = 'Cart';
export const COLLECTION_NAME = 'carts';

export enum CartAction {
  PLUS = 'PLUS',
  MINUS = 'MINUS',
}

export interface ISelectedSupplements {
  supplementCategory: ObjectId | ISupplementCategory;
  supplements: {
    supplement: ObjectId | ISupplement;
  }[];
}

export interface ICartItem {
  _id: ObjectId;
  product: ObjectId | IProduct;
  quantity: number;
  selectedSupplements?: ISelectedSupplements[];
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
      ref: 'User',
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
        },
        selectedSupplements: [
          {
            supplementCategory: {
              type: Schema.Types.ObjectId,
              ref: 'SupplementCategory',
            },
            supplements: [
              {
                supplement: {
                  type: Schema.Types.ObjectId,
                  ref: 'Supplement',
                },
              },
            ],
          },
        ],
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
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
