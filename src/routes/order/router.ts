import express from 'express';
import authentication from '../../authUtils/authentication';
import * as orderController from '../../controllers/order.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const router = express.Router();

// router.use('/', authentication);

router.route('/').get(
  // assignAction({ action: ACTIONS.list, entity: 'Order' }),
  // authorization,
  orderController.getAll
);

router
  .route('/export')
  .post(validator(schema.exportData), orderController.exportData);

router.post('/checkout', validator(schema.checkout), orderController.checkout);
router.post(
  '/checkout-admin',
  authentication,
  validator(schema.checkoutAdmin),
  orderController.checkoutAdmin
);

router.post(
  '/accept/:id',
  // authentication,
  validator(schema.acceptOrder),
  orderController.acceptOrder
);

router
  .route('/:id')
  .get(
    // assignAction({ action: ACTIONS.read, entity: 'Order' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    orderController.getOne
  )
  .put(
    // assignAction({ action: ACTIONS.update, entity: 'Order' }),
    // authorization,
    authentication,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    orderController.update
  )
  .delete(
    // assignAction({ action: ACTIONS.delete, entity: 'Order' }),
    // authorization,
    authentication,
    validator(schema.param, ValidationSource.PARAM),
    orderController.remove
  );

export default router;
