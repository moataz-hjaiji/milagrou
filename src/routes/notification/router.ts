import express from 'express';
import authentication from '../../authUtils/authentication';
import * as notificationController from '../../controllers/notification.controller';
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
    assignAction({ action: ACTIONS.list, entity: 'Notification' }),
    authorization,
    notificationController.getAll
  );

router.route('/seen').put(notificationController.markAllAsSeen);

router
  .route('/subscribe')
  .post(
    validator(schema.subscribeOrUnsubscribe),
    notificationController.subscribeToTopic
  );
router
  .route('/unsubscribe')
  .post(
    validator(schema.subscribeOrUnsubscribe),
    notificationController.unsubscribeFromTopic
  );

router
  .route('/:id')
  .get(
    assignAction({ action: ACTIONS.read, entity: 'Notification' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    notificationController.getOne
  )
  .put(
    assignAction({ action: ACTIONS.update, entity: 'Notification' }),
    authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    notificationController.update
  );

export default router;
