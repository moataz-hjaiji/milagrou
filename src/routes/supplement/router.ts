import express from 'express';
import FileUploadHandler from '../../helpers/fileUpload';
import authentication from '../../authUtils/authentication';
import * as supplementController from '../../controllers/supplement.controller';
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
    assignAction({ action: ACTIONS.create, entity: 'Supplement' }),
    authorization,
    fileUploadHandler.handleSingleFileUpload('image'),
    validator(schema.create),
    supplementController.create
  )
  .get(supplementController.getAll);

router
  .route('/:id')
  .get(
    validator(schema.param, ValidationSource.PARAM),
    supplementController.getOne
  )
  .put(
    authentication,
    assignAction({ action: ACTIONS.update, entity: 'Supplement' }),
    authorization,
    fileUploadHandler.handleSingleFileUpload('image'),
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    supplementController.update
  )
  .delete(
    authentication,
    assignAction({ action: ACTIONS.delete, entity: 'Supplement' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    supplementController.remove
  );

export default router;
