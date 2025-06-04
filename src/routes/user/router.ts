import express from 'express';
import FileUploadHandler from '../../helpers/fileUpload';
import authentication from '../../authUtils/authentication';
import * as userController from '../../controllers/user.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const fileUploadHandler = new FileUploadHandler();

const router = express.Router();

router.use('/', authentication);

router
  .route('/')
  .post(
    // assignAction({ action: ACTIONS.create, entity: 'User' }),
    // authorization,
    fileUploadHandler.handleSingleFileUpload('avatar'),
    validator(schema.create),
    userController.create
  )
  .get(
    // assignAction({ action: ACTIONS.list, entity: 'User' }),
    // authorization,
    userController.getAll
  );

router
  .route('/me')
  .get(userController.getMe)
  .put(
    fileUploadHandler.handleSingleFileUpload('avatar'),
    validator(schema.updateMe),
    userController.updateMe
  )
  .delete(userController.removeMe);

router
  .route('/:id')
  .get(
    // assignAction({ action: ACTIONS.read, entity: 'User' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    userController.getOne
  )
  .put(
    // assignAction({ action: ACTIONS.update, entity: 'User' }),
    // authorization,
    fileUploadHandler.handleSingleFileUpload('avatar'),
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    userController.update
  )
  .delete(
    // assignAction({ action: ACTIONS.delete, entity: 'User' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    userController.remove
  );

export default router;
