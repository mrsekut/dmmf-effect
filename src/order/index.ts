/**
 * 受注コンテキスト （Bounded Context）
 */

export * from './Order';
export * from './Customer';
export * from './ProductCode';
export * from './OrderQuantity';
export { handleOrderTakingCommand } from './workflows/workflow';
export { placeOrderWorkflow } from './workflows/placeOrder';
export type { PlaceOrderCommand } from './workflows/placeOrder/command';
