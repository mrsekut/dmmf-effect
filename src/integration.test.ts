import { it } from '@effect/vitest';
import { expect } from 'vitest';
import { Effect, Fiber, Logger, Queue, Chunk, TestClock } from 'effect';
import { QueuesLive, ShippingEventQueue } from './queues';
import { placeOrderWorkflow } from './order';
import { startShippingEventListener } from './shipping';

/**
 * Bounded Context 統合テスト
 *
 * - 受注コンテキストの PlaceOrder workflow は OrderPlaced event を発行する
 * - OrderPlaced event はキューに入れられる
 * - 発送コンテキストは OrderPlaced event をリッスンする
 * - イベントを受信すると、 ShipOrder workflow が起動される
 */

it.effect(
  'PlaceOrderがOrderPlacedイベントを発行し、発送コンテキストが処理する',
  () =>
    Effect.gen(function* () {
      const shippingFiber = yield* Effect.fork(startShippingEventListener);
      yield* TestClock.adjust('100 millis');

      const orderResult = yield* placeOrderWorkflow({
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
            productId: 'W1234',
            productName: 'TypeScript入門',
            quantity: 2,
            unitPrice: 3000,
          },
          {
            productId: 'G123',
            productName: 'Effect入門',
            quantity: 1,
            unitPrice: 4500,
          },
        ],
        amountToBill: 10500,
      });

      yield* TestClock.adjust('100 millis');

      const shippingQueue = yield* ShippingEventQueue;
      const events = yield* Queue.takeAll(shippingQueue).pipe(
        Effect.map(Chunk.toArray),
      );

      yield* Fiber.interrupt(shippingFiber);

      expect(orderResult.order.id).toBeDefined();
      expect(events).toHaveLength(1);
      expect(events[0]!.orderId).toBe(orderResult.order.id);
      expect(events[0]!.trackingNumber).toBeDefined();
    }).pipe(Effect.provide(QueuesLive), Effect.provide(Logger.pretty)),
);

it.effect('複数の注文を順次処理できる', () =>
  Effect.gen(function* () {
    const shippingFiber = yield* Effect.fork(startShippingEventListener);
    yield* TestClock.adjust('100 millis');

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
          productId: 'W1234',
          productName: 'TypeScript入門',
          quantity: 2,
          unitPrice: 3000,
        },
      ],
      amountToBill: 6000,
    });

    yield* TestClock.adjust('100 millis');

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
          productId: 'G456',
          productName: '関数型プログラミング',
          quantity: 1,
          unitPrice: 5000,
        },
      ],
      amountToBill: 5000,
    });

    yield* TestClock.adjust('100 millis');

    const shippingQueue = yield* ShippingEventQueue;
    const events = yield* Queue.takeAll(shippingQueue).pipe(
      Effect.map(Chunk.toArray),
    );

    yield* Fiber.interrupt(shippingFiber);

    expect(events).toHaveLength(2);

    const orderIds = events.map(e => e.orderId);
    expect(orderIds).toContain(order1Result.order.id);
    expect(orderIds).toContain(order2Result.order.id);

    events.forEach(e => expect(e.trackingNumber).toBeDefined());
  }).pipe(Effect.provide(QueuesLive), Effect.provide(Logger.pretty)),
);
