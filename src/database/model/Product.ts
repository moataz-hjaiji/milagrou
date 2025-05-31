import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IProductPrice from './ProductPrice';
import ISubCategory from './SubCategory';
import ICategory from './Category';

export const DOCUMENT_NAME = 'Product';
export const COLLECTION_NAME = 'products';

interface ISupplement {
  supplement: ObjectId;
  price: number;
}

interface ISupplementArrayItem {
  supplementCategory: ObjectId;
  min: number;
  max: number;
  supplements: ISupplement[];
}

interface ISupplementArray extends Array<ISupplementArrayItem> {}

export default interface IProduct extends Document {
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  images: string[];
  isAvailable: boolean;
  isRecommended: boolean;
  productPrice?: IProductPrice | ObjectId;
  subCategory?: ISubCategory | ObjectId;
  category?: ICategory | ObjectId;
  supplementArray?: ISupplementArray;
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
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: 'SubCategory',
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
    productPrice: {
      type: Schema.Types.ObjectId,
      ref: 'ProductPrice',
    },

    supplementArray: [
      {
        _id: false,
        supplementCategory: {
          type: Schema.Types.ObjectId,
          ref: 'SupplementCategory',
        },
        min: {
          type: Schema.Types.Number,
        },
        max: {
          type: Schema.Types.Number,
        },
        supplements: [
          {
            _id: false,
            supplement: {
              type: Schema.Types.ObjectId,
              ref: 'Supplement',
            },
            price: {
              type: Schema.Types.Number,
            },
          },
        ],
      },
    ],
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
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
