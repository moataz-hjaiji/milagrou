import express from 'express';
import FileUploadHandler from '../../helpers/fileUpload';
import authentication from '../../authUtils/authentication';
import * as productController from '../../controllers/product.controller';
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
    // assignAction({ action: ACTIONS.create, entity: 'Product' }),
    // authorization,
    fileUploadHandler.handleCustomFileUpload([
      { name: 'images' },
      { name: 'coverImage' },
    ]),
    validator(schema.create),
    productController.create
  )
  .get(productController.getAll);

router
  .route('/position')
  .put(
    authentication,
    validator(schema.updatePosition),
    productController.updatePosition
  );

router
  .route('/:id')
  .get(
    validator(schema.param, ValidationSource.PARAM),
    productController.getOne
  )
  .put(
    authentication,
    // assignAction({ action: ACTIONS.update, entity: 'Product' }),
    // authorization,
    fileUploadHandler.handleCustomFileUpload([
      { name: 'images' },
      { name: 'coverImage' },
    ]),
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    productController.update
  )
  .delete(
    authentication,
    // assignAction({ action: ACTIONS.delete, entity: 'Product' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    productController.remove
  );

export default router;
