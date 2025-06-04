import express from 'express';
import authentication from '../../authUtils/authentication';
import * as areaController from '../../controllers/area.controller';
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
    // assignAction({ action: ACTIONS.create, entity: 'Area' }),
    // authorization,
    validator(schema.create),
    areaController.create
  )
  .get(
    // assignAction({ action: ACTIONS.list, entity: 'Area' }),
    // authorization,
    areaController.getAll
  );

router
  .route('/:id')
  .get(
    // assignAction({ action: ACTIONS.read, entity: 'Area' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    areaController.getOne
  )
  .put(
    // assignAction({ action: ACTIONS.update, entity: 'Area' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    areaController.update
  )
  .delete(
    // assignAction({ action: ACTIONS.delete, entity: 'Area' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    areaController.remove
  );

export default router;
