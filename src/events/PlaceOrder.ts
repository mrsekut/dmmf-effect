/**
 * AcknowledgmentSent（確認送信済み）イベント
 */
type AcknowledgmentSentEvent = {
  type: 'AcknowledgmentSent';
  orderId: string;
  emailAddress: string;
};

/**
 * OrderPlaced（注文確定）イベント
 */
export type OrderPlacedEvent = {
  type: 'OrderPlaced';
  orderId: string;
  customerId: string;
  shippingAddress: {
    street: string;
    city: string;
    zipCode: string;
  };
  orderLines: {
    productId: string;
    quantity: number;
  }[];
};

/**
 * BillableOrderPlaced（請求可能な注文確定）イベント
 */
type BillableOrderPlacedEvent = {
  type: 'BillableOrderPlaced';
  orderId: string;
  billingAmount: number;
};

/**
 * PlaceOrderEvents（注文確定イベント）
 * - ワークフローが成功したときのイベント型
 * - ワークフローが複数の出力を持つ場合、レコード型でまとめる
 */
export type PlaceOrderEvents = {
  acknowledgmentSent: AcknowledgmentSentEvent;
  orderPlaced: OrderPlacedEvent;
  billableOrderPlaced: BillableOrderPlacedEvent;
};

/**
 * ValidationError（検証エラー）
 * - エラーの説明とどのフィールドに適用されるかを含む
 */
type ValidationError = {
  type: 'ValidationError';
  fieldName: string;
  errorDescription: string;
};

/**
 * PlaceOrderError（注文確定エラー）
 * - ワークフローが失敗したときのエラー型
 */
export type PlaceOrderError = ValidationError[]; // | TODO:;
