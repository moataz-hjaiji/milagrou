import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IAddress, { ADDRESS_DOCUMENT_NAME } from './Address';
import IPaymentMethod, { PAYMENT_METHOD_DOCUMENT_NAME } from './PaymentMethod';
import IProduct, { PRODUCT_DOCUMENT_NAME } from './Product';
import IUser, { USER_DOCUMENT_NAME } from './User';
import IPromoCode, { PROMO_CODE_DOCUMENT_NAME } from './PromoCode';

export const ORDER_DOCUMENT_NAME = 'Order';
const ORDER_COLLECTION_NAME = 'Orders';

export const enum OrderStatus {
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
  ACCEPTED = 'ACCEPTED',
  PREPARING = 'PREPARING',
  PREPARED = 'PREPARED',
  DELIVERING = 'DELIVERING',
  DELIVERED = 'DELIVERED',
}

export const enum DeliveryType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

export interface IOrderItem {
  _id: ObjectId;
  product: ObjectId | IProduct;
  quantity: number;
  itemPrice: number;
  notes?: string;
}

export default interface IOrder extends Document {
  userId: IUser | ObjectId;
  deliveryType: DeliveryType;
  paymentMethodId: IPaymentMethod | ObjectId;
  addressId?: IAddress | ObjectId;
  promoCodeId?: IPromoCode | ObjectId;
  status: string;
  items: IOrderItem[];
  orderPrice: number;
  orderPriceWithoutDeliveryPrice: number;
  newId: number;
  deletedAt?: Date;
}

const schema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: () => USER_DOCUMENT_NAME,
    },
    deliveryType: {
      type: Schema.Types.String,
    },
    paymentMethodId: {
      type: Schema.Types.ObjectId,
      ref: () => PAYMENT_METHOD_DOCUMENT_NAME,
    },
    addressId: {
      type: Schema.Types.ObjectId,
      ref: () => ADDRESS_DOCUMENT_NAME,
    },
    promoCodeId: {
      type: Schema.Types.ObjectId,
      ref: () => PROMO_CODE_DOCUMENT_NAME,
    },
    status: {
      type: Schema.Types.String,
      default: OrderStatus.PENDING,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: () => PRODUCT_DOCUMENT_NAME,
        },
        quantity: {
          type: Number,
        },
        itemPrice: {
          type: Number,
        },
        notes: {
          type: Schema.Types.String,
        },
      },
    ],
    orderPrice: {
      type: Number,
    },
    orderPriceWithoutDeliveryPrice: {
      type: Number,
    },
    newId: {
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

schema.index({ location: '2dsphere' });

preFindHook(schema);
schema.plugin(mongoosePagination);

export const OrderModel = model<IOrder, Pagination<IOrder>>(
  ORDER_DOCUMENT_NAME,
  schema,
  ORDER_COLLECTION_NAME
);
