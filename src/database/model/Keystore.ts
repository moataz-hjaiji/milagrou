/* eslint-disable prettier/prettier */
import { Schema, model, Document } from 'mongoose';
import User, { USER_DOCUMENT_NAME } from './User';

export const KEYSTORE_DOCUMENT_NAME = 'Keystore';
const KEYSTORE_COLLECTION_NAME = 'Keystores';

export default interface IKeystore extends Document {
  client: User;
  primaryKey: string;
  secondaryKey: string;
}

const schema = new Schema<IKeystore>(
  {
    client: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: () => USER_DOCUMENT_NAME,
    },
    primaryKey: {
      type: Schema.Types.String,
      required: true,
    },
    secondaryKey: {
      type: Schema.Types.String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

schema.index({ client: 1, primaryKey: 1 });
schema.index({ client: 1, primaryKey: 1, secondaryKey: 1 });

export const KeystoreModel = model<IKeystore>(
  KEYSTORE_DOCUMENT_NAME,
  schema,
  KEYSTORE_COLLECTION_NAME
);
