import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import { DiscountType } from './Discount';

export const DOCUMENT_NAME = 'PromoCode';
export const COLLECTION_NAME = 'promoCodes';

export default interface IPromoCode extends Document {
  code: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  type: DiscountType;
  isActive: Boolean;
  oneTimeUse?: Boolean;
  users: ObjectId[];
  maxUsage: number;
  actualUsage: number;
  deletedAt?: Date;
}

const schema = new Schema<IPromoCode>(
  {
    code: {
      type: Schema.Types.String,
      trim: true,
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
    oneTimeUse: {
      type: Boolean,
      default: false,
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxUsage: {
      type: Number,
    },
    actualUsage: {
      type: Number,
      default: 0,
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

export const PromoCodeModel = model<IPromoCode, Pagination<IPromoCode>>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
