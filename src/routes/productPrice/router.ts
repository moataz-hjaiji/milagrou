import express from 'express';
import authentication from '../../authUtils/authentication';
import * as productPriceController from '../../controllers/productPrice.controller';
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
    assignAction({ action: ACTIONS.create, entity: 'ProductPrice' }),
    authorization,
    validator(schema.create),
    productPriceController.create
  )
  .get(productPriceController.getAll);

router
  .route('/:id')
  .get(
    validator(schema.param, ValidationSource.PARAM),
    productPriceController.getOne
  )
  .put(
    authentication,
    assignAction({ action: ACTIONS.update, entity: 'ProductPrice' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    productPriceController.update
  )
  .delete(
    authentication,
    assignAction({ action: ACTIONS.delete, entity: 'ProductPrice' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    productPriceController.remove
  );

export default router;
