import type { OrderPlacedEvent } from '../../../events';
import type { ValidatedOrder } from '../../Order';

/**
 * CreateOrderPlacedEvent
 * - ValidatedOrder → OrderPlacedEvent
 * - ワークフローの出力としてイベントを生成
 */
export const createOrderPlacedEvent = (order: ValidatedOrder) =>
  ({
    type: 'OrderPlaced',
    orderId: order.id,
    customerInfo: {
      firstName: order.customerInfo.name.firstName,
      lastName: order.customerInfo.name.lastName,
      emailAddress: order.customerInfo.emailAddress,
    },
    shippingAddress: order.shippingAddress,
    orderLines: order.orderLines.map(l => ({
      productId: l.productCode,
      quantity: l.quantity,
    })),
  }) as const satisfies OrderPlacedEvent;
