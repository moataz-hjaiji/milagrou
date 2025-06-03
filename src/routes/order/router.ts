import express from 'express';
import authentication from '../../authUtils/authentication';
import * as orderController from '../../controllers/order.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const router = express.Router();

router.use('/', authentication);

router
  .route('/')
  .get(
    assignAction({ action: ACTIONS.list, entity: 'Order' }),
    authorization,
    orderController.getAll
  );

router.post('/checkout', validator(schema.checkout), orderController.checkout);

router
  .route('/:id')
  .get(
    assignAction({ action: ACTIONS.read, entity: 'Order' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    orderController.getOne
  )
  .put(
    assignAction({ action: ACTIONS.update, entity: 'Order' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    orderController.update
  )
  .delete(
    assignAction({ action: ACTIONS.delete, entity: 'Order' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    orderController.remove
  );

export default router;
