import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const DOCUMENT_NAME = 'Discount';
export const COLLECTION_NAME = 'discounts';

export enum DiscountType {
  AMOUNT = 'AMOUNT',
  PERCENTAGE = 'PERCENTAGE',
}

interface ITarget {
  menuId?: ObjectId | string;
  categoryId?: ObjectId | string;
  subCategoryId?: ObjectId | string;
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
      menuId: {
        type: Schema.Types.ObjectId,
        ref: 'Menu',
      },
      categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
      subCategoryId: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
      },
      productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
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
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
