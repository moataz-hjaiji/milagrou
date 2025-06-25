import express from 'express';
import authentication from '../../authUtils/authentication';
import * as taxRateController from '../../controllers/taxRate.controller';
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
    // assignAction({ action: ACTIONS.create, entity: 'TaxRate' }),
    // authorization,
    validator(schema.create),
    taxRateController.create
  )
  .get(taxRateController.getAll);

router
  .route('/:id')
  .get(
    validator(schema.param, ValidationSource.PARAM),
    taxRateController.getOne
  )
  .put(
    authentication,
    // assignAction({ action: ACTIONS.update, entity: 'TaxRate' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    taxRateController.update
  )
  .delete(
    authentication,
    // assignAction({ action: ACTIONS.delete, entity: 'TaxRate' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    taxRateController.remove
  );

export default router;
