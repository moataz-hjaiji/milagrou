import express from 'express';
import FileUploadHandler from '../../helpers/fileUpload';
import authentication from '../../authUtils/authentication';
import * as bannerController from '../../controllers/banner.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const fileUploadHandler = new FileUploadHandler();

const router = express.Router();

router
  .route('/')
  .post(
    authentication,
    assignAction({ action: ACTIONS.create, entity: 'Banner' }),
    authorization,
    fileUploadHandler.handleSingleFileUpload('picture'),
    validator(schema.create),
    bannerController.create
  )
  .get(bannerController.getAll);

router
  .route('/:id')
  .get(validator(schema.param, ValidationSource.PARAM), bannerController.getOne)
  .put(
    authentication,
    assignAction({ action: ACTIONS.read, entity: 'Banner' }),
    authorization,
    fileUploadHandler.handleSingleFileUpload('picture'),
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    bannerController.update
  )
  .delete(
    authentication,
    assignAction({ action: ACTIONS.delete, entity: 'Banner' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    bannerController.remove
  );

export default router;
