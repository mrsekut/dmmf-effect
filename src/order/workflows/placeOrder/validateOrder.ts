import { Schema } from 'effect';
import { ValidatedOrder, type UnvalidatedOrder } from '../../Order';

/**
 * ValidateOrder
 * - UnvalidatedOrder → ValidatedOrder
 * - ワークフローの最初のステップ
 */
export const validateOrder = (unvalidatedOrder: UnvalidatedOrder) => {
  const orderId = crypto.randomUUID();

  return Schema.decodeUnknown(ValidatedOrder)({
    type: 'ValidatedOrder',
    id: orderId,
    customerInfo: {
      name: {
        firstName: unvalidatedOrder.customerInfo.firstName,
        lastName: unvalidatedOrder.customerInfo.lastName,
      },
      emailAddress: unvalidatedOrder.customerInfo.emailAddress,
    },
    shippingAddress: unvalidatedOrder.shippingAddress,
    billingAddress: unvalidatedOrder.billingAddress,
    orderLines: unvalidatedOrder.orderLines.map((line, index) => ({
      id: `${orderId}-line-${index}`,
      productCode: line.productCode,
      quantity: line.quantity,
      price: line.price,
    })),
  });
};
