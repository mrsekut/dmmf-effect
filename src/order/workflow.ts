import { Effect, Queue } from 'effect';
import type { Order } from './domain';
import { fromDTO, type PlaceOrderDTO } from './fromDTO';
import { toDTO } from './toDTO';
import { OrderEventQueue } from '../queues';
import type { OrderPlacedEvent } from '../events';
import type { ParseError } from 'effect/ParseResult';

type PlaceOrderResult = {
  readonly order: Order;
  readonly events: readonly OrderPlacedEvent[];
};

/**
 * PlaceOrder Workflow
 *
 * - Place Order Command → Place Order Workflow → Order Placed Event
 *
 * - 処理の流れ:
 *  1. 入力ゲート: DTOを検証・ドメインオブジェクトに変換
 *  2. ワークフロー実行: ビジネスロジック
 *  3. 出力ゲート: イベントDTOに変換
 *  4. イベントをキューに送信
 */
export const placeOrderWorkflow = (
  command: PlaceOrderDTO,
): Effect.Effect<PlaceOrderResult, ParseError, OrderEventQueue> =>
  Effect.gen(function* () {
    // 入力ゲート: 検証
    const order = yield* fromDTO(command);

    // ワークフロー実行
    const result = yield* placeOrderCore(order);

    // イベントをキューに送信
    const queue = yield* OrderEventQueue;
    yield* Effect.all(result.events.map(e => Queue.offer(queue, e)));

    yield* Effect.log(`Order placed: ${result.order.orderId}`);

    return result;
  });

/**
 * PlaceOrder Core Workflow
 */
const placeOrderCore = (order: Order) =>
  Effect.gen(function* () {
    const orderPlacedEvent = toDTO(order);

    return {
      order,
      events: [orderPlacedEvent],
    } as const satisfies PlaceOrderResult;
  });
