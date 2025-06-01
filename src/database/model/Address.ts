import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IArea, { AREA_DOCUMENT_NAME } from './Area';
import IUser, { USER_DOCUMENT_NAME } from './User';

export const ADDRESS_DOCUMENT_NAME = 'Address';
const ADDRESS_COLLECTION_NAME = 'Addresses';

export default interface IAddress extends Document {
  userId: IUser | ObjectId;
  areaId: IArea | ObjectId;
  block: string;
  street: string;
  buildingNumber: number;
  specialDirection: string;
  deletedAt?: Date;
}

const schema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: () => USER_DOCUMENT_NAME,
    },
    areaId: {
      type: Schema.Types.ObjectId,
      ref: () => AREA_DOCUMENT_NAME,
    },
    block: {
      type: Schema.Types.String,
    },
    street: {
      type: Schema.Types.String,
    },
    buildingNumber: {
      type: Schema.Types.Number,
    },
    specialDirection: {
      type: Schema.Types.String,
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

export const AddressModel = model<IAddress, Pagination<IAddress>>(
  ADDRESS_DOCUMENT_NAME,
  schema,
  ADDRESS_COLLECTION_NAME
);
