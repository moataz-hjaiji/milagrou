import express from 'express';
import authentication from '../../authUtils/authentication';
import * as storeController from '../../controllers/store.controller';
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
    assignAction({ action: ACTIONS.create, entity: 'Store' }),
    authorization,
    validator(schema.create),
    storeController.create
  )
  .get(
    assignAction({ action: ACTIONS.list, entity: 'Store' }),
    authorization,
    storeController.getAll
  );

router
  .route('/:id')
  .get(
    assignAction({ action: ACTIONS.read, entity: 'Store' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    storeController.getOne
  )
  .put(
    assignAction({ action: ACTIONS.update, entity: 'Store' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    storeController.update
  )
  .delete(
    assignAction({ action: ACTIONS.delete, entity: 'Store' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    storeController.remove
  );

export default router;
