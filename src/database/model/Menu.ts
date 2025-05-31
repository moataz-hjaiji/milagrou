import { model, Schema, Document } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';

export const DOCUMENT_NAME = 'Menu';
export const COLLECTION_NAME = 'menus';

export default interface IMenu extends Document {
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  picture: string;
  deletedAt?: Date;
}

const schema = new Schema<IMenu>(
  {
    nameFr: {
      type: Schema.Types.String,
      trim: true,
    },
    nameAr: {
      type: Schema.Types.String,
      trim: true,
    },
    descriptionFr: {
      type: Schema.Types.String,
      trim: true,
    },
    descriptionAr: {
      type: Schema.Types.String,
      trim: true,
    },
    picture: {
      type: Schema.Types.String,
      trim: true,
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

export const MenuModel = model<IMenu, Pagination<IMenu>>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
