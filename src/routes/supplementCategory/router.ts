import express from 'express';
import FileUploadHandler from '../../helpers/fileUpload';
import authentication from '../../authUtils/authentication';
import * as supplementCategoryController from '../../controllers/supplementCategory.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const router = express.Router();

router
  .route('/')
  .post(
    authentication,
    assignAction({ action: ACTIONS.create, entity: 'SupplementCategory' }),
    authorization,
    validator(schema.create),
    supplementCategoryController.create
  )
  .get(supplementCategoryController.getAll);

router
  .route('/:id')
  .get(
    validator(schema.param, ValidationSource.PARAM),
    supplementCategoryController.getOne
  )
  .put(
    authentication,
    assignAction({ action: ACTIONS.update, entity: 'SupplementCategory' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    supplementCategoryController.update
  )
  .delete(
    authentication,
    assignAction({ action: ACTIONS.delete, entity: 'SupplementCategory' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    supplementCategoryController.remove
  );

export default router;
