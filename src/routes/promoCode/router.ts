import express from 'express';
import authentication from '../../authUtils/authentication';
import * as promoCodeController from '../../controllers/promoCode.controller';
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
    // assignAction({ action: ACTIONS.create, entity: 'PromoCode' }),
    // authorization,
    validator(schema.create),
    promoCodeController.create
  )
  .get(
    // assignAction({ action: ACTIONS.list, entity: 'PromoCode' }),
    // authorization,
    promoCodeController.getAll
  );

router
  .route('/verify')
  .post(validator(schema.verifyPromoCode), promoCodeController.verifyPromoCode);

router
  .route('/:id')
  .get(
    // assignAction({ action: ACTIONS.read, entity: 'PromoCode' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    promoCodeController.getOne
  )
  .put(
    // assignAction({ action: ACTIONS.update, entity: 'PromoCode' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    validator(schema.update),
    promoCodeController.update
  )
  .delete(
    // assignAction({ action: ACTIONS.delete, entity: 'PromoCode' }),
    // authorization,
    validator(schema.param, ValidationSource.PARAM),
    promoCodeController.remove
  );

export default router;
