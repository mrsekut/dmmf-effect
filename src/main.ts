/**
 * Bounded Context Demo
 *
 * - 受注コンテキストの PlaceOrder workflow は OrderPlaced event を発行する
 * - OrderPlaced event はキューに入れられるか、またはその他の方法で発行される
 * - 発送コンテキストは OrderPlaced event をリッスンする
 * - イベントを受信すると、 ShipOrder workflow が起動される
 *
 * 実行: bun src/main.ts
 */

import { Effect, Fiber, Queue, Logger } from 'effect';
import { QueuesLive, ShippingEventQueue } from './queues';
import { placeOrderWorkflow } from './order';
import { startShippingEventListener } from './shipping';

const program = Effect.gen(function* () {
  // 発送コンテキストのイベントリスナーをバックグラウンドで起動
  const shippingFiber = yield* Effect.fork(startShippingEventListener);
  yield* Effect.sleep('100 millis'); // 少し待機してリスナーが起動するのを待つ

  yield* Effect.log('\n--- 注文1を確定 ---');
  const order1Result = yield* placeOrderWorkflow({
    customerId: '1234567890',
    shippingAddress: {
      street: '東京都渋谷区1-2-3',
      city: '渋谷区',
      zipCode: '150-0001',
    },
    billingAddress: {
      street: '東京都渋谷区1-2-3',
      city: '渋谷区',
      zipCode: '150-0001',
    },
    orderLines: [
      {
        productId: 'PROD-001',
        productName: 'TypeScript入門',
        quantity: 2,
        unitPrice: 3000,
      },
      {
        productId: 'PROD-002',
        productName: 'Effect入門',
        quantity: 1,
        unitPrice: 4500,
      },
    ],
    amountToBill: 10000,
  });

  yield* Effect.log(`注文ID: ${order1Result.order.id}`);

  yield* Effect.sleep('100 millis'); // 発送処理が完了するのを待つ

  yield* Effect.log('\n--- 注文2を確定 ---');
  const order2Result = yield* placeOrderWorkflow({
    customerId: '1234567890',
    shippingAddress: {
      street: '大阪府大阪市北区4-5-6',
      city: '大阪市',
      zipCode: '530-0001',
    },
    billingAddress: {
      street: '大阪府大阪市北区4-5-6',
      city: '大阪市',
      zipCode: '530-0001',
    },
    orderLines: [
      {
        productId: 'PROD-003',
        productName: '関数型プログラミング',
        quantity: 1,
        unitPrice: 5000,
      },
    ],
    amountToBill: 10000,
  });

  yield* Effect.log(`注文ID: ${order2Result.order.id}`);

  yield* Effect.sleep('100 millis'); // 発送処理が完了するのを待つ

  // 発送イベントキューの状態を確認
  const shippingQueue = yield* ShippingEventQueue;
  const queueSize = yield* Queue.size(shippingQueue);
  yield* Effect.log(`\n発送完了イベント数: ${queueSize}`);

  // 発送イベントを取り出して表示
  yield* Effect.log('\n--- 発送完了イベント一覧 ---');

  const events = yield* Queue.takeAll(shippingQueue);
  yield* Effect.forEach(events, e =>
    Effect.log(`- 注文 ${e.orderId} → 追跡番号: ${e.trackingNumber}`),
  );

  // クリーンアップ
  yield* Fiber.interrupt(shippingFiber);
});

Effect.runPromise(
  program.pipe(Effect.provide(QueuesLive), Effect.provide(Logger.pretty)),
).catch(console.error);
