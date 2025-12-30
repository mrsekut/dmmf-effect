import { Effect, Layer, Queue } from 'effect';
import type { OrderPlacedEvent, OrderShippedEvent } from './events';

const QUEUE_CAPACITY = 100;

/**
 * 受注イベントを発送コンテキストへ送るキュー
 */
export class OrderEventQueue extends Effect.Service<OrderEventQueue>()(
  'app/OrderEventQueue',
  {
    effect: Queue.bounded<OrderPlacedEvent>(QUEUE_CAPACITY),
  },
) {}

/**
 * 発送イベントを外部へ送るキュー
 */
export class ShippingEventQueue extends Effect.Service<ShippingEventQueue>()(
  'app/ShippingEventQueue',
  {
    effect: Queue.bounded<OrderShippedEvent>(QUEUE_CAPACITY),
  },
) {}

export const QueuesLive = Layer.merge(
  OrderEventQueue.Default,
  ShippingEventQueue.Default,
);
