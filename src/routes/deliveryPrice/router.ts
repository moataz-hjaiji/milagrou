import express from 'express';
import authentication from '../../authUtils/authentication';
import * as deliveryPriceController from '../../controllers/deliveryPrice.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const router = express.Router();

router.use('/', authentication);

router
  .route('/')
  .post(
    // assignAction({ action: ACTIONS.create, entity: 'DeliveryPrice' }),
    // authorization,
    validator(schema.create),
    deliveryPriceController.create
  )
  .get(
    // assignAction({ action: ACTIONS.list, entity: 'DeliveryPrice' }),
    // authorization,
    deliveryPriceController.getAll
  );

router
  .route('/:id')
  .get(
    // assignAction({ action: ACTIONS.read, entity: 'DeliveryPrice' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    deliveryPriceController.getOne
  )
  .put(
    // assignAction({ action: ACTIONS.update, entity: 'DeliveryPrice' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    deliveryPriceController.update
  )
  .delete(
    // assignAction({ action: ACTIONS.delete, entity: 'DeliveryPrice' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    deliveryPriceController.remove
  );

export default router;
