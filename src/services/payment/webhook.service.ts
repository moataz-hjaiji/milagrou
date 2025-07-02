import { BadRequestError } from '../../core/ApiError';
import { PaymentStatus } from '../../database/model/Order';
import OrderRepo from '../../database/repository/OrderRepo';

export const webhook = async (req: any) => {
  console.log(req.body);

  const data = req.body;
  if (data.EventType === 1) {
    if (data.Data.TransactionStatus === 'SUCCESS') {
      const order = await OrderRepo.findByObj({
        invoiceId: data.Data.InvoiceId,
      });
      if (!order) throw new BadRequestError('order not found for webhook');
      order.paymentStatus = PaymentStatus.PAID;
      order.paymentMethod = data.Data.PaymentMethod;
      await order.save();
    }
  }

  if (data.EventType === 2) {
    if (data.Data.RefundStatus === 'REFUNDED') {
      const order = await OrderRepo.findByObj({
        invoiceId: data.Data.InvoiceId,
      });
      if (!order) throw new BadRequestError('order not found for webhook');
      order.paymentStatus = PaymentStatus.REFUNDED;
      await order.save();
    }
  }
};
