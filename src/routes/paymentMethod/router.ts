import express from 'express';
import authentication from '../../authUtils/authentication';
import * as paymentMethodController from '../../controllers/paymentMethod.controller';
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
    assignAction({ action: ACTIONS.create, entity: 'PaymentMethod' }),
    authorization,
    validator(schema.create),
    paymentMethodController.create
  )
  .get(paymentMethodController.getAll);

router
  .route('/:id')
  .get(
    validator(schema.param, ValidationSource.PARAM),
    paymentMethodController.getOne
  )
  .put(
    authentication,
    assignAction({ action: ACTIONS.update, entity: 'PaymentMethod' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    paymentMethodController.update
  )
  .delete(
    authentication,
    assignAction({ action: ACTIONS.delete, entity: 'PaymentMethod' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    paymentMethodController.remove
  );

export default router;
