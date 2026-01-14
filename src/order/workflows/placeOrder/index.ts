import { Array, Effect, Layer, Option, pipe, Queue } from 'effect';
import { OrderEventQueue } from '../../../queues';
import { CheckAddressExists, validateOrder } from './validateOrder';
import type { PricedOrder, UnvalidatedOrder } from '../../Order';
import type { PlaceOrderCommand } from './command';
import {
  PlaceOrderError,
  type PlaceOrderEvent,
  type BillableOrderPlacedEvent,
  type OrderAcknowledgmentSentEvent,
} from './publicTypes';
import {
  acknowledgeOrder,
  CreateOrderAcknowledgementLetter,
  SendOrderAcknowledgement,
} from './acknowledgeOrder';
import { priceOrder } from './priceOrder';
import { createOrderPlacedEvent } from './createOrderPlacedEvent';
import { CheckProductCodeExists } from './CheckProductCodeExists';
import { GetProductPrice } from './GetProductPrice';

/**
 * PlaceOrder Workflow
 *
 * - Place Order Command → Place Order Workflow → Order Placed Event
 *
 * - 処理の流れ:
 *  1. 入力: コマンド（UnvalidatedOrderを含む）を受け取る
 *  2. 検証: UnvalidatedOrderをValidatedOrderに変換
 *  3. ワークフロー実行: ビジネスロジック（Validate → Price → Acknowledge）
 *  4. 出力: イベントを生成してキューに送信
 */
export const placeOrderWorkflow = (command: PlaceOrderCommand) =>
  // ): Effect.Effect<PlaceOrderResult, ParseError, OrderEventQueue> =>
  Effect.gen(function* () {
    // コマンドからUnvalidatedOrderを取り出す
    const unvalidatedOrder = command.data;

    const events = yield* placeOrder(unvalidatedOrder).pipe(
      Effect.provide(PlaceOrderLive),
    );

    // イベントをキューに送信
    const queue = yield* OrderEventQueue;
    yield* Effect.all(events.map(e => Queue.offer(queue, e)));

    yield* Effect.log(
      `Order placed: ${unvalidatedOrder.orderId} by user: ${command.userId}`,
    );

    return events;
  });

const PlaceOrderLive = Layer.mergeAll(
  CheckAddressExists.Default,
  CheckProductCodeExists.Default,
  GetProductPrice.Default,
  CreateOrderAcknowledgementLetter.Default,
  SendOrderAcknowledgement.Default,
);

/**
 * PlaceOrder ワークフロー
 * - 「注文確定」プロセス
 */
const placeOrder = (unvalidatedOrder: UnvalidatedOrder) => {
  return Effect.gen(function* () {
    const validatedOrder = yield* pipe(
      validateOrder(unvalidatedOrder),
      Effect.mapError(error => PlaceOrderError.Validation({ error })),
    );
    const pricedOrder = yield* pipe(
      priceOrder(validatedOrder),
      Effect.mapError(error => PlaceOrderError.Pricing({ error })),
    );
    const acknowledgementOption = yield* acknowledgeOrder(pricedOrder);

    return createEvents(pricedOrder, acknowledgementOption);
  });
};

type CreateEvents = (
  po: PricedOrder,
  e: Option.Option<OrderAcknowledgmentSentEvent>,
) => PlaceOrderEvent[];

const createEvents: CreateEvents = (po, acknowledgmentEventOpt) => {
  const acknowledgmentEvents = pipe(acknowledgmentEventOpt, Option.toArray);
  const orderPlacedEvents = pipe(po, createOrderPlacedEvent, Array.make);
  const billingEvents = pipe(po, createBillingEvent, Option.toArray);

  return [...acknowledgmentEvents, ...orderPlacedEvents, ...billingEvents];
};

function createBillingEvent(
  po: PricedOrder,
): Option.Option<BillableOrderPlacedEvent> {
  if (po.amountToBill === 0) {
    return Option.none();
  }
  return Option.some({
    type: 'BillableOrderPlaced',
    orderId: po.id,
    billingAddress: po.billingAddress,
    amountToBill: po.amountToBill,
  });
}
