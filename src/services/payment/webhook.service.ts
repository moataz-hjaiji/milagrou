import { BadRequestError } from '../../core/ApiError';
import { PaymentStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';

export const webhook = async (req: any) => {
  const data = req.body;
  if (data.EventType === 1) {
    if (data.Data.TransactionStatus === 'SUCCESS') {
      const order = await OrderRepo.findByObj({
        invoiceId: data.Data.InvoiceId,
      });
      if (!order) throw new BadRequestError('order not found for webhook');
      order.paymentStatus = PaymentStatus.PAID;
      await order.save();
    }
  }
};
