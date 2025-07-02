import express from 'express';
import authentication from '../../authUtils/authentication';
import * as siteSettingController from '../../controllers/siteSetting.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';
import FileUploadHandler from '../../helpers/fileUpload';

const fileUploadHandler = new FileUploadHandler();

const router = express.Router();

// router.use('/', authentication);

router
  .route('/')
  .post(
    // assignAction({ action: ACTIONS.create, entity: 'SiteSetting' }),
    // authorization,
    authentication,
    fileUploadHandler.handleCustomFileUpload([
      { name: 'logo' },
      { name: 'url' },
    ]),
    validator(schema.create),
    siteSettingController.create
  )
  .get(
    // assignAction({ action: ACTIONS.list, entity: 'SiteSetting' }),
    // authorization,
    siteSettingController.getAll
  );

router
  .route('/:id')
  .get(
    // assignAction({ action: ACTIONS.read, entity: 'SiteSetting' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    siteSettingController.getOne
  )
  .put(
    // assignAction({ action: ACTIONS.update, entity: 'SiteSetting' }),
    // authorization,
    authentication,
    fileUploadHandler.handleCustomFileUpload([
      { name: 'logo' },
      { name: 'url' },
    ]),
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.create),
    siteSettingController.update
  )
  .delete(
    // assignAction({ action: ACTIONS.delete, entity: 'SiteSetting' }),
    // authorization,
    authentication,
    validator(schema.param, ValidationSource.PARAM),
    siteSettingController.remove
  );

export default router;
