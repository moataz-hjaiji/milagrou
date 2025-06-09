import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IAddress, { ADDRESS_DOCUMENT_NAME } from './Address';
import IPaymentMethod, { PAYMENT_METHOD_DOCUMENT_NAME } from './PaymentMethod';
import IUser, { USER_DOCUMENT_NAME } from './User';
import IPromoCode, { PROMO_CODE_DOCUMENT_NAME } from './PromoCode';

export const ORDER_DOCUMENT_NAME = 'Order';
const ORDER_COLLECTION_NAME = 'Orders';

export const enum OrderStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
}

export const enum PaymentStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export const enum OrderType {
  NORMAL = 'NORMAL',
  GIFT = 'GIFT',
  RESERVATION = 'RESERVATION',
}

export const enum DeliveryType {
  DELIVERY = 'DELIVERY',
  PICKUP = 'PICKUP',
}

export default interface IOrder extends Document {
  userId: IUser | ObjectId;
  browserId: string;
  deliveryType: DeliveryType;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  status: OrderStatus;
  paymentMethodId: IPaymentMethod | ObjectId;
  addressId?: IAddress | ObjectId;
  promoCodeId?: IPromoCode | ObjectId;
  items: any;
  orderPrice: number;
  orderPriceWithoutDeliveryPrice: number;
  newId: number;
  reservationDate?: Date;
  deletedAt?: Date;
}

const schema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: () => USER_DOCUMENT_NAME,
    },
    browserId: {
      type: Schema.Types.String,
    },
    deliveryType: {
      type: Schema.Types.String,
    },
    paymentStatus: {
      type: Schema.Types.String,
      default: PaymentStatus.UNPAID,
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
        _id: false,
        product: {
          _id: { type: Schema.Types.ObjectId },
          nameAng: { type: String },
          nameAr: { type: String },
          descriptionAng: { type: String },
          descriptionAr: { type: String },
          price: { type: Number },
          images: [{ type: String }],
        },
        supplements: [
          {
            _id: { type: Schema.Types.ObjectId },
            nameAng: { type: String },
            nameAr: { type: String },
            price: { type: Number },
          },
        ],
        quantity: {
          type: Number,
        },
        itemPrice: {
          type: Number,
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
    reservationDate: {
      type: Date,
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

export const OrderModel = model<IOrder, Pagination<IOrder>>(
  ORDER_DOCUMENT_NAME,
  schema,
  ORDER_COLLECTION_NAME
);
