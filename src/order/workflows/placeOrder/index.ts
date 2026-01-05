import { Effect, Queue } from 'effect';
import type { ParseError } from 'effect/ParseResult';
import { OrderEventQueue } from '../../../queues';
import { fromDTO } from '../../fromDTO';
import type { ValidatedOrder } from '../../Order';
import { toDTO } from '../../toDTO';
import type { PlaceOrderCommand } from './command';
import type { OrderPlacedEvent } from '../../../events';

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

    // 入力ゲート: 検証（UnvalidatedOrder → ValidatedOrder）
    const order = yield* fromDTO({
      customerId: unvalidatedOrder.customerInfo.customerId,
      shippingAddress: unvalidatedOrder.shippingAddress,
      billingAddress: unvalidatedOrder.billingAddress,
      orderLines: unvalidatedOrder.orderLines.map(l => ({
        productCode: l.productCode,
        quantity: l.quantity,
        price: l.price,
      })),
      amountToBill: unvalidatedOrder.orderLines.reduce(
        (sum, l) => sum + l.quantity * l.price,
        0,
      ),
    });

    // ワークフロー実行
    const result = yield* placeOrderCore(order);

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
    const orderPlacedEvent = toDTO(order);

    return {
      order,
      events: [orderPlacedEvent],
    } as const satisfies PlaceOrderResult;
  });
