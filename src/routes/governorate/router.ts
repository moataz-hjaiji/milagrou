import express from 'express';
import authentication from '../../authUtils/authentication';
import * as governorateController from '../../controllers/governorate.controller';
import validator, { ValidationSource } from '../../helpers/utils/validator';
import schema from './schema';
import authorization from '../../authUtils/authorization';
import assignAction from '../../authUtils/assignAction';
import { ACTIONS } from '../../helpers/seeder/seed.permission';

const router = express.Router();

// router.use('/', authentication);

router
  .route('/')
  .post(
    // assignAction({ action: ACTIONS.create, entity: 'Governorate' }),
    // authorization,
    authentication,
    validator(schema.create),
    governorateController.create
  )
  .get(
    // assignAction({ action: ACTIONS.list, entity: 'Governorate' }),
    // authorization,
    governorateController.getAll
  );

router
  .route('/:id')
  .get(
    // assignAction({ action: ACTIONS.read, entity: 'Governorate' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    governorateController.getOne
  )
  .put(
    // assignAction({ action: ACTIONS.update, entity: 'Governorate' }),
    // authorization,
    authentication,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    governorateController.update
  )
  .delete(
    // assignAction({ action: ACTIONS.delete, entity: 'Governorate' }),
    // authorization,
    authentication,
    validator(schema.param, ValidationSource.PARAM),
    governorateController.remove
  );

export default router;
