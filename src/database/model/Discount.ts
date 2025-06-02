import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import { CATEGORY_DOCUMENT_NAME } from './Category';
import { PRODUCT_DOCUMENT_NAME } from './Product';

export const DISCOUNT_DOCUMENT_NAME = 'Discount';
const DISCOUNT_COLLECTION_NAME = 'Discounts';

export enum DiscountType {
  AMOUNT = 'AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
}

interface ITarget {
  categoryId?: ObjectId | string;
  productId?: ObjectId | string;
}

export default interface IDiscount extends Document {
  target: ITarget;
  startDate: Date;
  endDate: Date;
  amount: number;
  type: DiscountType;
  isActive: Boolean;
  deletedAt?: Date;
}

const schema = new Schema<IDiscount>(
  {
    target: {
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: () => CATEGORY_DOCUMENT_NAME,
      },
      productId: {
        type: Schema.Types.ObjectId,
        ref: () => PRODUCT_DOCUMENT_NAME,
      },
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    amount: {
      type: Number,
    },
    type: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
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

export const DiscountModel = model<IDiscount, Pagination<IDiscount>>(
  DISCOUNT_DOCUMENT_NAME,
  schema,
  DISCOUNT_COLLECTION_NAME
);
