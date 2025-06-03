import express from 'express';
import authentication from '../../authUtils/authentication';
import * as cartController from '../../controllers/cart.controller';
import validator from '../../helpers/utils/validator';
import schema from './schema';

const router = express.Router();

router.get('/me', authentication, cartController.getMyCart);

router.post(
  '/add',
  authentication,
  validator(schema.addToCart),
  cartController.addToCart
);

router.delete(
  '/remove',
  authentication,
  validator(schema.removeFromCart),
  cartController.removeFromCart
);

router.put(
  '/quantity',
  authentication,
  validator(schema.incrementOrDecrement),
  cartController.incrementOrDecrement
);

router.put(
  '/edit',
  authentication,
  validator(schema.editItem),
  cartController.editItem
);

export default router;
