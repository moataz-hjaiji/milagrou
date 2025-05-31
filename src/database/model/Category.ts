import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IMenu from './Menu';

export const DOCUMENT_NAME = 'Category';
export const COLLECTION_NAME = 'categorys';

export enum IconsTypes {
  IcSausage = 'ic-sausage',
  IcApple = 'ic-apple',
  IcPizza = 'ic-pizza',
  IcSandwich = 'ic-sandwich',
  IcBanana = 'ic-banana',
  IcLemon = 'ic-lemon',
  IcCake = 'ic-cake',
  IcAvocado = 'ic-avocado',
  IcChef = 'ic-chef',
  IcBerry = 'ic-berry',
  IcCheesecake = 'ic-cheesecake',
  IcJuice = 'ic-juice',
  IcBall = 'ic-ball',
  IcChickenThighBite = 'ic-chicken-thigh-bite',
  IcFish = 'ic-fish',
  IcSoup = 'ic-soup',
  IcChicken = 'ic-chicken',
  IcWaterGlass = 'ic-water-glass',
  IcIceCream = 'ic-ice-cream',
  IcIceCreamCone = 'ic-ice-cream-cone',
  IcWine = 'ic-wine',
  IcChickenThigh = 'ic-chicken-thigh',
  IcLollipop = 'ic-lollipop',
  IcFastFood = 'ic-fast-food',
  IcToast = 'ic-toast',
  IcCoffee = 'ic-coffee',
  IcPizzaSlice = 'ic-pizza-slice',
  IcPopcorn = 'ic-popcorn',
  IcHotSoup = 'ic-hot-soup',
  IcSalad = 'ic-salad',
  IcCutlery = 'ic-cutlery',
  IcCutlerySet = 'ic-cutlery-set',
  IcGlass = 'ic-glass',
  icBrunch = 'ic-brunch',
}

export default interface ICategory extends Document {
  nameFr: string;
  nameAr: string;
  descriptionFr: string;
  descriptionAr: string;
  picture: string;
  icon: IconsTypes;
  menu: IMenu | ObjectId;
  hasNoSubCategory: boolean;
  deletedAt?: Date;
}

const schema = new Schema<ICategory>(
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
    icon: {
      type: Schema.Types.String,
      trim: true,
    },
    menu: {
      type: Schema.Types.ObjectId,
      ref: 'Menu',
    },
    hasNoSubCategory: {
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

preFindHook(schema);
schema.plugin(mongoosePagination);

export const CategoryModel = model<ICategory, Pagination<ICategory>>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
