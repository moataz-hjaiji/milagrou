import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IUser, { USER_DOCUMENT_NAME } from './User';

export const ADDRESS_DOCUMENT_NAME = 'Address';
const ADDRESS_COLLECTION_NAME = 'Addresses';

interface Location {
  type: string;
  coordinates: [number, number];
}

export default interface IAddress extends Document {
  userId: IUser | ObjectId;
  street: string;
  city: string;
  location: Location;
  isHome?: boolean;
  isWork?: boolean;
  deletedAt?: Date;
}

const schema = new Schema<IAddress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: () => USER_DOCUMENT_NAME,
    },
    street: {
      type: Schema.Types.String,
    },
    city: {
      type: Schema.Types.String,
    },
    location: {
      type: {
        type: Schema.Types.String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Schema.Types.Number],
      },
    },
    isHome: {
      type: Schema.Types.Boolean,
      default: false,
    },
    isWork: {
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

export const AddressModel = model<IAddress, Pagination<IAddress>>(
  ADDRESS_DOCUMENT_NAME,
  schema,
  ADDRESS_COLLECTION_NAME
);
