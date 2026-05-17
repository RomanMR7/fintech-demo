const SUCCESSFUL_ORDER_STATUSES = new Set(["COMPLETED"]);

export function calculateOrderSuccessRate(statuses: string[]) {
  if (!statuses.length) return 0;

  const successfulOrders = statuses.filter((status) => SUCCESSFUL_ORDER_STATUSES.has(status)).length;
  return Number(((successfulOrders / statuses.length) * 100).toFixed(1));
}
