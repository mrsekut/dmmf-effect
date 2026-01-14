/**
 * Shipping Context の公開型
 * - ワークフローの入出力として公開される型を定義
 */

/**
 * OrderShipped Event
 * - 発送コンテキストが発行するイベント
 */
export type OrderShippedEvent = {
  orderId: string;
  shipmentId: string;
  shippedAt: Date;
  trackingNumber: string;
};
