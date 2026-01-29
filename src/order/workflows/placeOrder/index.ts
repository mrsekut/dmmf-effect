import { Array, Effect, Either, Layer, Match, Option, pipe, Queue } from 'effect';
import { OrderEventQueue } from '../../../queues';
import { CheckAddressExists, validateOrder } from './validateOrder';
import type { PricedOrder, UnvalidatedOrder } from '../../models/Order';
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
import { fromPlaceOrderError, fromPlaceOrderEvent, type OrderFormDto, type PlaceOrderEventDto, type PlaceOrderErrorDto, toUnvalidatedOrder } from '../../models/dto';

/**
 * PlaceOrder API
 */
export const placeOrderApi = (
  request: HttpRequest,
): Effect.Effect<HttpResponse, never, never> =>
  Effect.gen(function* () {
    // 1. JSON → DTO
    const orderFormDto: OrderFormDto = JSON.parse(request.body);

    // 2. DTO → Domain
    const unvalidatedOrder = toUnvalidatedOrder(orderFormDto);

    // 3. Workflow実行
    const result = yield* pipe(
      placeOrder(unvalidatedOrder),
      Effect.provide(PlaceOrderLive),
      Effect.either,
    );

    // 4. Domain → DTO → JSON
    return workflowResultToHttpResponse(result);
  });

type JsonString = string;

type HttpRequest = {
  action: string;
  uri: string;
  body: JsonString;
};

type HttpResponse = {
  httpStatusCode: number;
  body: JsonString;
};

type WorkflowResult = Either.Either<PlaceOrderEvent[], PlaceOrderError>;

/**
 * ワークフロー結果 → HTTPレスポンス
 */
const workflowResultToHttpResponse = (result: WorkflowResult): HttpResponse =>
  Either.match(result, {
    onRight: events => {
      // Domain → DTO → JSON
      const dtos: PlaceOrderEventDto[] = events.map(fromPlaceOrderEvent);
      const json = JSON.stringify(dtos);
      return {
        httpStatusCode: 200,
        body: json,
      };
    },
    onLeft: err => {
      // Domain Error → DTO → JSON
      const dto: PlaceOrderErrorDto = fromPlaceOrderError(err);
      const json = JSON.stringify(dto);
      return {
        httpStatusCode: 400,
        body: json,
      };
    },
  });

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
export const placeOrderWorkflow = (
  command: PlaceOrderCommand
): Effect.Effect<PlaceOrderEvent[], PlaceOrderError, OrderEventQueue> =>
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
      Effect.mapError(error =>
        Match.value(error).pipe(
          Match.discriminatorsExhaustive('_tag')({
            RemoteServiceError: (error) => PlaceOrderError.RemoteService({ error }),
            ParseError: (error) => PlaceOrderError.Validation({ error }),
          }),
        )
      ),
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
