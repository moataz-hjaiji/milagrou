import express from 'express';
import FileUploadHandler from '../../helpers/fileUpload';
import authentication from '../../authUtils/authentication';
import * as popupController from '../../controllers/popup.controller';
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
    // assignAction({ action: ACTIONS.create, entity: 'Popup' }),
    // authorization,
    fileUploadHandler.handleSingleFileUpload('image'),
    validator(schema.create),
    popupController.create
  )
  .get(popupController.getAll);

router.route('/mark-seen').post(popupController.markAsSeen);

router
  .route('/:id')
  .get(validator(schema.param, ValidationSource.PARAM), popupController.getOne)
  .put(
    authentication,
    // assignAction({ action: ACTIONS.update, entity: 'Popup' }),
    // authorization,
    fileUploadHandler.handleSingleFileUpload('image'),
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    popupController.update
  )
  .delete(
    authentication,
    // assignAction({ action: ACTIONS.delete, entity: 'Popup' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    popupController.remove
  );

export default router;
