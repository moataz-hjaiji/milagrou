import express from 'express';
import authentication from '../../authUtils/authentication';
import * as discountController from '../../controllers/discount.controller';
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
    assignAction({ action: ACTIONS.create, entity: 'Discount' }),
    authorization,
    validator(schema.create),
    discountController.create
  )
  .get(
    assignAction({ action: ACTIONS.list, entity: 'Discount' }),
    authorization,
    discountController.getAll
  );

router
  .route('/:id')
  .get(
    assignAction({ action: ACTIONS.read, entity: 'Discount' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    discountController.getOne
  )
  .put(
    assignAction({ action: ACTIONS.update, entity: 'Discount' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    discountController.update
  )
  .delete(
    assignAction({ action: ACTIONS.delete, entity: 'Discount' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    discountController.remove
  );

export default router;
