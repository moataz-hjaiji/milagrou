import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import bcrypt from 'bcryptjs';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IRole, { ROLE_DOCUMENT_NAME } from './Role';

export const USER_DOCUMENT_NAME = 'User';
const USER_COLLECTION_NAME = 'Users';

export default interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  password: string;
  verified: boolean;
  emailIsVerified: boolean;
  registerConfirmationCode: number | null;
  forgetConfirmationCode: number | null;
  roles: IRole[];
  lastLogin?: Date;
  deletedAt?: Date;
}

const schema = new Schema<IUser>(
  {
    firstName: {
      type: Schema.Types.String,
      trim: true,
    },
    lastName: {
      type: Schema.Types.String,
      trim: true,
    },
    email: {
      type: Schema.Types.String,
      trim: true,
      set: (value: string) => value.toLocaleLowerCase(),
    },
    password: {
      type: Schema.Types.String,
      select: false,
    },
    phoneNumber: {
      type: Schema.Types.String,
      trim: true,
    },
    avatar: {
      type: Schema.Types.String,
      default: 'public/avatar-default-icon.png',
    },
    verified: {
      type: Schema.Types.Boolean,
      default: false,
    },
    emailIsVerified: {
      type: Schema.Types.Boolean,
      default: false,
    },
    registerConfirmationCode: {
      type: Schema.Types.Number,
      select: false,
    },
    forgetConfirmationCode: {
      type: Schema.Types.Number,
      select: false,
    },
    roles: [
      {
        type: Schema.Types.ObjectId,
        ref: () => ROLE_DOCUMENT_NAME,
        select: false,
      },
    ],
    lastLogin: {
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

schema.pre('save', async function (this: IUser, next) {
  if (this.isModified('email')) this.email = this.email?.toLocaleLowerCase();
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

schema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

export const UserModel = model<IUser, Pagination<IUser>>(
  USER_DOCUMENT_NAME,
  schema,
  USER_COLLECTION_NAME
);
