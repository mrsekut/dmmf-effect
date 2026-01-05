import type { OrderPlacedEvent } from '../events';
import type { ValidatedOrder } from './domain';

/**
 * Domain Object → DTO
 * - 外部に漏らすべきない情報を落とすなど
 */
export const toDTO = (order: ValidatedOrder) =>
  ({
    type: 'OrderPlaced',
    orderId: order.id,
    customerId: order.customerId,
    shippingAddress: order.shippingAddress,
    orderLines: order.orderLines.map(l => ({
      productId: l.productCode,
      quantity: l.quantity,
    })),
  }) as const satisfies OrderPlacedEvent;
