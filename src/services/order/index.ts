import { checkout } from './checkout.service';
import { checkoutAdmin } from './checkoutAdmin.service';
import { acceptOrder } from './acceptOrder.service';
import { getAll } from './getAll.service';
import { getOne } from './getOne.service';
import { update } from './update.service';
import { remove } from './delete.service';
import { exportData } from './exportData.service';

export default {
  checkout,
  checkoutAdmin,
  acceptOrder,
  getAll,
  getOne,
  update,
  remove,
  exportData,
};
