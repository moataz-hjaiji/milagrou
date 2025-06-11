import { BadRequestError } from '../../core/ApiError';
import SiteSettingRepo from '../../database/repository/SiteSettingRepo';

interface createParams {
  body: any;
  files?: Express.Request['files'];
}

export const create = async ({ body, files }: createParams) => {
  if (files) {
    if ('logo' in files) {
      const logo = (
        files as {
          [fieldname: string]: Express.Multer.File[];
        }
      )['logo'];
      body.branding.logo = logo[0].path;
    }
    if ('url' in files) {
      const url = (
        files as {
          [fieldname: string]: Express.Multer.File[];
        }
      )['url'];
      body.homePageContent.videoUrl.url = url[0].path;
    }
  }
  const siteSetting = await SiteSettingRepo.create(body);
  if (!siteSetting) throw new BadRequestError('error creating siteSetting');
  return siteSetting;
};
