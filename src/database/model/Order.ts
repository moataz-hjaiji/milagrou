import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IAddress from './Address';
import IPaymentMethod from './PaymentMethod';
import IProduct from './Product';
import ISupplement from './Supplement';
import ISupplementCategory from './SupplementCategory';
import IUser from './User';
import IPromoCode from './PromoCode';

export const DOCUMENT_NAME = 'Order';
export const COLLECTION_NAME = 'orders';

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

interface ISelectedSupplements {
  supplementCategory: ObjectId | ISupplementCategory;
  supplements: {
    supplement: ObjectId | ISupplement;
    price: number;
  }[];
}

export interface IOrderItem {
  _id: ObjectId;
  product: ObjectId | IProduct;
  quantity: number;
  itemPrice: number;
  selectedSupplements?: ISelectedSupplements[];
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
  deliveryGuyId: IUser | ObjectId;
  deliveryGuyacceptance: Boolean;
  deletedAt?: Date;
}

const schema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveryType: {
      type: Schema.Types.String,
    },
    paymentMethodId: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentMethod',
    },
    addressId: {
      type: Schema.Types.ObjectId,
      ref: 'Address',
    },
    promoCodeId: {
      type: Schema.Types.ObjectId,
      ref: 'PromoCode',
    },
    status: {
      type: Schema.Types.String,
      default: OrderStatus.PENDING,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
        },
        selectedSupplements: [
          {
            supplementCategory: {
              type: Schema.Types.ObjectId,
              ref: 'SupplementCategory',
            },
            supplements: [
              {
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
    deliveryGuyId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    deliveryGuyacceptance: {
      type: Schema.Types.Boolean,
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

schema.index({ location: '2dsphere' });

preFindHook(schema);
schema.plugin(mongoosePagination);

export const OrderModel = model<IOrder, Pagination<IOrder>>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
