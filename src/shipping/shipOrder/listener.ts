import type { OrderPlacedEvent } from '../../order';
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
      if (event.type === 'OrderPlaced') {
        yield* handleOrderPlacedEvent(event);
      }
    }),
  );
});

/**
 * OrderPlacedEvent をリッスンして ShipOrder ワークフローを起動
 */
const handleOrderPlacedEvent = (event: OrderPlacedEvent) =>
  Effect.gen(function* () {
    yield* Effect.log(`Received OrderPlaced event: ${event.id}`);

    // 腐敗防止層: イベント → コマンド変換（ドメイン型 → DTO）
    const command = fromOrderPlacedEvent(event);

    // ワークフロー実行
    return yield* shipOrderWorkflow(command);
  });

/**
 * OrderPlacedEvent を ShipOrderCommand に変換
 *
 * - これが腐敗防止層の役割を果たす
 * - 受注コンテキストの語彙を発送コンテキストの語彙に翻訳
 * - ドメイン型からプリミティブ型（DTO）への変換
 */
const fromOrderPlacedEvent = (event: OrderPlacedEvent): ShipOrderDTO => ({
  orderReference: event.id,
  customerInfo: {
    firstName: event.customerInfo.name.firstName,
    lastName: event.customerInfo.name.lastName,
    emailAddress: event.customerInfo.emailAddress,
  },
  shippingAddress: event.shippingAddress,
  items: event.orderLines.map(line => ({
    productId: line.productCode.code,
    quantity: line.quantity,
  })),
});
