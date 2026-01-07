import { Effect, Queue } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import { OrderEventQueue } from '../../../queues';
import { validateOrder } from './validateOrder';
import type { UnvalidatedOrder, ValidatedOrder } from '../../Order';
import type { PlaceOrderCommand } from './command';
import type {
  OrderPlacedEvent,
  PlaceOrderError,
  PlaceOrderEvent,
} from '../../../events';

/**
 * PlaceOrder ワークフロー
 * - 「注文確定」プロセス
 */
export type PlaceOrder = (
  uo: UnvalidatedOrder,
) => Effect.Effect<PlaceOrderEvent, PlaceOrderError>;

type PlaceOrderResult = {
  readonly order: ValidatedOrder;
  readonly events: readonly OrderPlacedEvent[];
};

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
  command: PlaceOrderCommand,
): Effect.Effect<PlaceOrderResult, ParseError, OrderEventQueue> =>
  Effect.gen(function* () {
    // コマンドからUnvalidatedOrderを取り出す
    const unvalidatedOrder = command.data;

    // Step 1: バリデーション（UnvalidatedOrder → ValidatedOrder）
    const validatedOrder = yield* validateOrder(unvalidatedOrder);

    // Step 2: ワークフロー実行（将来的に Price → Acknowledge を追加）
    const result = yield* placeOrderCore(validatedOrder);

    // イベントをキューに送信
    const queue = yield* OrderEventQueue;
    yield* Effect.all(result.events.map(e => Queue.offer(queue, e)));

    yield* Effect.log(
      `Order placed: ${result.order.id} by user: ${command.userId}`,
    );

    return result;
  });

/**
 * PlaceOrder Core Workflow
 * - パイプラインの各ステップはステートレスで副作用がないように設計
 * - 各ステップは独立してテストし、理解できる
 */
const placeOrderCore = (order: ValidatedOrder) =>
  Effect.gen(function* () {
    // Step 3: イベント生成
    // const orderPlacedEvent = createOrderPlacedEvent(order);

    return {
      order,
      events: [],
    } as const satisfies PlaceOrderResult;
  });
