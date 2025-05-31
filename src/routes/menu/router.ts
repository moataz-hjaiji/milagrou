import express from 'express';
import FileUploadHandler from '../../helpers/fileUpload';
import authentication from '../../authUtils/authentication';
import * as menuController from '../../controllers/menu.controller';
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
    assignAction({ action: ACTIONS.create, entity: 'Menu' }),
    authorization,
    fileUploadHandler.handleSingleFileUpload('picture'),
    validator(schema.create),
    menuController.create
  )
  .get(menuController.getAll);

router.route('/home').get(menuController.getMenusForHome);

router
  .route('/:id')
  .get(validator(schema.param, ValidationSource.PARAM), menuController.getOne)
  .put(
    authentication,
    assignAction({ action: ACTIONS.update, entity: 'Menu' }),
    authorization,
    fileUploadHandler.handleSingleFileUpload('picture'),
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    menuController.update
  )
  .delete(
    authentication,
    assignAction({ action: ACTIONS.delete, entity: 'Menu' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    menuController.remove
  );

export default router;
