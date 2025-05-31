import express from 'express';
import authentication from '../../authUtils/authentication';
import * as addressController from '../../controllers/address.controller';
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
    assignAction({ action: ACTIONS.create, entity: 'Address' }),
    authorization,
    validator(schema.create),
    addressController.create
  )
  .get(
    assignAction({ action: ACTIONS.list, entity: 'Address' }),
    authorization,
    addressController.getAll
  );

router
  .route('/lookup')
  .post(
    assignAction({ action: ACTIONS.list, entity: 'Address' }),
    authorization,
    validator(schema.lookup),
    addressController.findAdressesSortedByLocation
  );

router
  .route('/:id')
  .get(
    assignAction({ action: ACTIONS.read, entity: 'Address' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    addressController.getOne
  )
  .put(
    assignAction({ action: ACTIONS.update, entity: 'Address' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    addressController.update
  )
  .delete(
    assignAction({ action: ACTIONS.delete, entity: 'Address' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    addressController.remove
  );

export default router;
