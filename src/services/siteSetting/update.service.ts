import SiteSettingRepo from '../../database/repository/SiteSettingRepo';
import { BadRequestError } from '../../core/ApiError';

interface updateParams {
  id: string;
  body: any;
  files?: Express.Request['files'];
}

export const update = async ({ id, body, files }: updateParams) => {
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
  const siteSetting = await SiteSettingRepo.update(id, body);
  if (!siteSetting) throw new BadRequestError('siteSetting not found');
  return siteSetting;
};
