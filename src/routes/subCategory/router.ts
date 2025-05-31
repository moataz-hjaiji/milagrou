import express from 'express';
import FileUploadHandler from '../../helpers/fileUpload';
import authentication from '../../authUtils/authentication';
import * as subCategoryController from '../../controllers/subCategory.controller';
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
    assignAction({ action: ACTIONS.create, entity: 'SubCategory' }),
    authorization,
    fileUploadHandler.handleCustomFileUpload([
      { name: 'picture' },
      { name: 'icon' },
    ]),
    validator(schema.create),
    subCategoryController.create
  )
  .get(subCategoryController.getAll);

router
  .route('/:id')
  .get(
    validator(schema.param, ValidationSource.PARAM),
    subCategoryController.getOne
  )
  .put(
    authentication,
    assignAction({ action: ACTIONS.update, entity: 'SubCategory' }),
    authorization,
    fileUploadHandler.handleCustomFileUpload([
      { name: 'picture' },
      { name: 'icon' },
    ]),
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    subCategoryController.update
  )
  .delete(
    authentication,
    assignAction({ action: ACTIONS.delete, entity: 'SubCategory' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    subCategoryController.remove
  );

export default router;
