import express from 'express';
import authentication from '../../authUtils/authentication';
import * as feedbackController from '../../controllers/feedback.controller';
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
    // assignAction({ action: ACTIONS.create, entity: 'Feedback' }),
    // authorization,
    validator(schema.create),
    feedbackController.create
  )
  .get(
    // assignAction({ action: ACTIONS.list, entity: 'Feedback' }),
    // authorization,
    feedbackController.getAll
  );

router
  .route('/:id')
  .get(
    // assignAction({ action: ACTIONS.read, entity: 'Feedback' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    feedbackController.getOne
  )
  .put(
    // assignAction({ action: ACTIONS.update, entity: 'Feedback' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    feedbackController.update
  )
  .delete(
    // assignAction({ action: ACTIONS.delete, entity: 'Feedback' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    feedbackController.remove
  );

export default router;
