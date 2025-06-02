import { model, Schema, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const DELIVERY_PRICE_DOCUMENT_NAME = 'DeliveryPrice';
const DELIVERY_PRICE_COLLECTION_NAME = 'DeliveryPrices';

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
>(DELIVERY_PRICE_DOCUMENT_NAME, schema, DELIVERY_PRICE_COLLECTION_NAME);
