import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IProductPrice, { PRODUCT_PRICE_DOCUMENT_NAME } from './ProductPrice';
import ICategory, { CATEGORY_DOCUMENT_NAME } from './Category';

export const PRODUCT_DOCUMENT_NAME = 'Product';
const PRODUCT_COLLECTION_NAME = 'Products';

export default interface IProduct extends Document {
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  images: string[];
  isAvailable: boolean;
  isRecommended: boolean;
  productPrice?: IProductPrice | ObjectId;
  category?: ICategory | ObjectId;
  position?: number;
  deletedAt?: Date;
}

const schema = new Schema<IProduct>(
  {
    nameFr: {
      type: Schema.Types.String,
      trim: true,
    },
    nameAr: {
      type: Schema.Types.String,
      trim: true,
    },
    descriptionFr: {
      type: Schema.Types.String,
      trim: true,
    },
    descriptionAr: {
      type: Schema.Types.String,
      trim: true,
    },
    isAvailable: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isRecommended: {
      type: Schema.Types.Boolean,
      default: false,
    },
    images: [
      {
        type: Schema.Types.String,
        trim: true,
      },
    ],
    category: {
      type: Schema.Types.ObjectId,
      ref: () => CATEGORY_DOCUMENT_NAME,
    },
    productPrice: {
      type: Schema.Types.ObjectId,
      ref: () => PRODUCT_PRICE_DOCUMENT_NAME,
    },

    position: {
      type: Schema.Types.Number,
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

export const ProductModel = model<IProduct, Pagination<IProduct>>(
  PRODUCT_DOCUMENT_NAME,
  schema,
  PRODUCT_COLLECTION_NAME
);
