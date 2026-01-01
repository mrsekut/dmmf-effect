import type { OrderPlacedEvent } from '../../events';
import { OrderEventQueue } from '../../queues';
import type { ShipOrderDTO } from '../fromDTO';
import { shipOrderWorkflow } from './workflow';
import { Effect, Queue } from 'effect';

/**
 * OrderEventQueue からイベントを取得して処理する
 */
export const startShippingEventListener = Effect.gen(function* () {
  const orderQueue = yield* OrderEventQueue;

  yield* Effect.log('Shipping context: listening for OrderPlaced events...');

  yield* Effect.forever(
    Effect.gen(function* () {
      const event = yield* Queue.take(orderQueue);
      yield* handleOrderPlacedEvent(event);
    }),
  );
});

/**
 * OrderPlacedEvent をリッスンして ShipOrder ワークフローを起動
 */
const handleOrderPlacedEvent = (event: OrderPlacedEvent) =>
  Effect.gen(function* () {
    yield* Effect.log(`Received OrderPlaced event: ${event.orderId}`);

    // 腐敗防止層: イベント → コマンド変換
    const command = fromOrderPlacedEvent(event);

    // ワークフロー実行
    return yield* shipOrderWorkflow(command);
  });

/**
 * OrderPlacedEvent を ShipOrderCommand に変換
 *
 * - これが腐敗防止層の役割を果たす
 * - 受注コンテキストの語彙を発送コンテキストの語彙に翻訳
 */
const fromOrderPlacedEvent = (event: OrderPlacedEvent) =>
  ({
    orderReference: event.orderId,
    customerId: event.customerId,
    shippingAddress: event.shippingAddress,
    items: event.orderLines.map(line => ({
      productId: line.productId,
      productName: line.productName,
      quantity: line.quantity,
    })),
  }) as const satisfies ShipOrderDTO;
