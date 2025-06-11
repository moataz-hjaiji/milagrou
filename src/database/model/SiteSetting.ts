import { model, Schema, Document, ObjectId } from 'mongoose';
import { mongoosePagination, Pagination } from 'mongoose-paginate-ts';
import { checkDuplicateKey } from '../../helpers/utils/checkDuplecateKey';
import { preFindHook } from '../../helpers/utils/databaseHooks';
import IProduct, { PRODUCT_DOCUMENT_NAME } from './Product';

export const SITE_SETTING_DOCUMENT_NAME = 'SiteSetting';
const SITE_SETTING_COLLECTION_NAME = 'SiteSettings';

export default interface ISiteSetting extends Document {
  branding: {
    logo: string; // image
    primaryColor: string;
    secondaryColor: string;
    themeColor: string;
    fontStyle: string;
    titleAng: string;
    titleAr: string;
    sloganAng: string;
    sloganAr: string;
  };
  contactInformation: {
    phone: string;
    email: string;
    addressAng: string;
    addressAr: string;
  };
  socialMediaLinks: {
    facebook: string;
    x: string;
    tictok: string;
    youtube: string;
    instagram: string;
  };
  homePageContent: {
    carouselImagesList: {
      titleAng: string;
      titleAr: string;
      products: IProduct[] | ObjectId[];
      isEnabled: boolean;
    };
    videoUrl: {
      titleAng: string;
      titleAr: string;
      url: string; //video
      isEnabled: true;
    };
    sectionTexts: {
      qualityAng: string;
      qualityAr: string;
      deliveryAng: string;
      deliveryAr: string;
      selectionAng: string;
      selectionAr: string;
      isEnabled: true;
    };
    bestSeller: {
      titleAng: string;
      titleAr: string;
      products: IProduct[] | ObjectId[];
      isEnabled: true;
    };
  };
  deletedAt?: Date;
}

const schema = new Schema<ISiteSetting>(
  {
    branding: {
      logo: {
        type: String,
      },
      primaryColor: {
        type: String,
      },
      secondaryColor: {
        type: String,
      },
      themeColor: {
        type: String,
      },
      fontStyle: {
        type: String,
      },
      titleAng: {
        type: String,
      },
      titleAr: {
        type: String,
      },
      sloganAng: {
        type: String,
      },
      sloganAr: {
        type: String,
      },
    },
    contactInformation: {
      phone: {
        type: String,
      },
      email: {
        type: String,
      },
      addressAng: {
        type: String,
      },
      addressAr: {
        type: String,
      },
    },
    socialMediaLinks: {
      facebook: {
        type: String,
      },
      x: {
        type: String,
      },
      tictok: {
        type: String,
      },
      youtube: {
        type: String,
      },
      instagram: {
        type: String,
      },
    },
    homePageContent: {
      carouselImagesList: {
        titleAng: {
          type: String,
        },
        titleAr: {
          type: String,
        },
        products: [
          {
            type: Schema.Types.ObjectId,
            ref: () => PRODUCT_DOCUMENT_NAME,
          },
        ],
        isEnabled: {
          type: Boolean,
        },
      },
      videoUrl: {
        titleAng: {
          type: String,
        },
        titleAr: {
          type: String,
        },
        url: {
          type: String,
        },
        isEnabled: {
          type: Boolean,
        },
      },
      sectionTexts: {
        qualityAng: {
          type: String,
        },
        qualityAr: {
          type: String,
        },
        deliveryAng: {
          type: String,
        },
        deliveryAr: {
          type: String,
        },
        selectionAng: {
          type: String,
        },
        selectionAr: {
          type: String,
        },
        isEnabled: {
          type: Boolean,
        },
      },
      bestSeller: {
        titleAng: {
          type: String,
        },
        titleAr: {
          type: String,
        },
        products: [
          {
            type: Schema.Types.ObjectId,
            ref: () => PRODUCT_DOCUMENT_NAME,
          },
        ],
        isEnabled: {
          type: Boolean,
          default: true,
        },
      },
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

export const SiteSettingModel = model<ISiteSetting, Pagination<ISiteSetting>>(
  SITE_SETTING_DOCUMENT_NAME,
  schema,
  SITE_SETTING_COLLECTION_NAME
);
