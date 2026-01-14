import { Effect, Queue } from 'effect';
import type { Shipment } from '../Shipping';
import { markAsShipped } from '../Shipping';
import type { OrderShippedEvent } from '../publicTypes';
import { ShippingEventQueue } from '../../queues';
import type { ParseError } from 'effect/ParseResult';
import { toOrderShippedEvent } from '../toDTO';
import { type ShipOrderDTO } from '../fromDTO';
import { fromDTO } from '../fromDTO';

type ShipOrderResult = {
  readonly shipment: Shipment;
  readonly events: readonly OrderShippedEvent[];
};

/**
 * ShipOrder Workflow
 *
 * - Ship Order Command → Ship Order Workflow → Order Shipped Event
 */
export const shipOrderWorkflow = (
  command: ShipOrderDTO,
): Effect.Effect<ShipOrderResult, ParseError, ShippingEventQueue> =>
  Effect.gen(function* () {
    // ワークフロー実行
    const result = yield* shipOrderCore(command);

    // イベントをキューに送信
    const queue = yield* ShippingEventQueue;
    yield* Effect.all(result.events.map(e => Queue.offer(queue, e)));

    yield* Effect.log(
      `Order shipped: ${result.shipment.orderReference} → ${result.shipment.trackingNumber}`,
    );

    return result;
  });

/**
 * ShipOrder Core Workflow
 */
const shipOrderCore = (command: ShipOrderDTO) =>
  Effect.gen(function* () {
    // コマンド → ドメインオブジェクト変換
    const pendingShipment = yield* fromDTO(command);

    // ビジネスロジック: 発送処理
    const shippedShipment = markAsShipped(pendingShipment);

    // イベント生成
    const event = toOrderShippedEvent(shippedShipment);
    const events = event ? [event] : [];

    return {
      shipment: shippedShipment,
      events,
    };
  });
