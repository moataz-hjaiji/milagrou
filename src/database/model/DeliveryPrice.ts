import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const DOCUMENT_NAME = 'DeliveryPrice';
export const COLLECTION_NAME = 'deliveryPrices';

export default interface IDeliveryPrice extends Document {
  price: number;
  isActive: boolean;
  freeDeliveryOption: boolean;
  freeAfter?: number;
  deletedAt?: Date;
}

const schema = new Schema<IDeliveryPrice>(
  {
    price: {
      type: Schema.Types.Number,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    freeDeliveryOption: {
      type: Boolean,
      default: false,
    },
    freeAfter: {
      type: Number,
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

export const DeliveryPriceModel = model<
  IDeliveryPrice,
  Pagination<IDeliveryPrice>
>(DOCUMENT_NAME, schema, COLLECTION_NAME);
