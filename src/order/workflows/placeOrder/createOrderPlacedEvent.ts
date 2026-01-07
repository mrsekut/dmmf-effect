import type { OrderPlacedEvent } from '../../../events';
import type { PricedOrder } from '../../Order';

/**
 * CreateOrderPlacedEvent
 * - ValidatedOrder → OrderPlacedEvent
 * - ワークフローの出力としてイベントを生成
 */
export const createOrderPlacedEvent = (
  order: PricedOrder,
): OrderPlacedEvent => {
  const { type, ...rest } = order;
  return {
    type: 'OrderPlaced',
    ...rest,
  };
};
