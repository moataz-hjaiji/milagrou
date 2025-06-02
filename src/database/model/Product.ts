import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import ICategory, { CATEGORY_DOCUMENT_NAME } from './Category';
import IStore, { STORE_DOCUMENT_NAME } from './Store';
import ISupplement, { SUPPLEMENT_DOCUMENT_NAME } from './Supplement';

export const PRODUCT_DOCUMENT_NAME = 'Product';
const PRODUCT_COLLECTION_NAME = 'Products';

interface IStoreQuantity {
  store: IStore | ObjectId;
  quantity: number;
}

interface ISupplementPrice {
  supplement: ISupplement | ObjectId;
  price: number;
}

export default interface IProduct extends Document {
  name: string;
  description: string;
  images: string[];
  price: number;
  category: ICategory | ObjectId;
  position?: number;
  stores: IStoreQuantity[];
  supplements: ISupplementPrice[];
  deletedAt?: Date;
}

const schema = new Schema<IProduct>(
  {
    name: {
      type: Schema.Types.String,
      trim: true,
    },
    description: {
      type: Schema.Types.String,
      trim: true,
    },
    images: [
      {
        type: Schema.Types.String,
        trim: true,
      },
    ],
    position: {
      type: Schema.Types.Number,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: () => CATEGORY_DOCUMENT_NAME,
    },
    price: {
      type: Schema.Types.Number,
    },
    stores: [
      {
        store: {
          type: Schema.Types.ObjectId,
          ref: () => STORE_DOCUMENT_NAME,
        },
        quantity: {
          type: Schema.Types.Number,
        },
      },
    ],
    supplements: [
      {
        supplement: {
          type: Schema.Types.ObjectId,
          ref: () => SUPPLEMENT_DOCUMENT_NAME,
        },
        price: {
          type: Schema.Types.Number,
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

export const ProductModel = model<IProduct, Pagination<IProduct>>(
  PRODUCT_DOCUMENT_NAME,
  schema,
  PRODUCT_COLLECTION_NAME
);
