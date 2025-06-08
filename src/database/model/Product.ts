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
  nameAng: string;
  nameAr: string;
  descriptionAng: string;
  descriptionAr: string;
  isRecommended: boolean;
  images: string[];
  coverImage: string;
  price: number;
  category: ICategory | ObjectId;
  position?: number;
  stores: IStoreQuantity[];
  supplements: ISupplementPrice[];
  deletedAt?: Date;
}

const schema = new Schema<IProduct>(
  {
    nameAng: {
      type: Schema.Types.String,
    },
    nameAr: {
      type: Schema.Types.String,
    },
    descriptionAng: {
      type: Schema.Types.String,
      trim: true,
    },
    descriptionAr: {
      type: Schema.Types.String,
      trim: true,
    },
    isRecommended: {
      type: Schema.Types.Boolean,
      default: false,
    },
    images: [
      {
        type: Schema.Types.String,
      },
    ],
    coverImage: {
      type: Schema.Types.String,
    },
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
        _id: false,
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
        _id: false,
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
