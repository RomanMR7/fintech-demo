import assert from "node:assert/strict";
import {
  ApiRequestError,
  apiErrorStatus,
  apiForbidden,
  apiJsonError,
  apiNotFound,
  getOptionalQueryString,
  getSafeQueryLimit,
  readJsonBody
} from "../lib/api-guards";

async function main() {
  const parsed = await readJsonBody(
    new Request("http://localhost/api/test", {
      method: "POST",
      body: JSON.stringify({ amount: 1000, currency: "RUB" })
    })
  );
  assert.deepEqual(parsed, { amount: 1000, currency: "RUB" });

  const empty = await readJsonBody(new Request("http://localhost/api/test", { method: "POST" }));
  assert.deepEqual(empty, {});

  await assert.rejects(
    () => readJsonBody(new Request("http://localhost/api/test", { method: "POST", body: "not-json" })),
    (error) => error instanceof ApiRequestError && error.status === 400
  );

  await assert.rejects(
    () => readJsonBody(new Request("http://localhost/api/test", { method: "POST", body: JSON.stringify(["bad"]) })),
    (error) => error instanceof ApiRequestError && error.status === 400
  );

  await assert.rejects(
    () => readJsonBody(new Request("http://localhost/api/test", { method: "POST", body: JSON.stringify({ text: "x".repeat(128) }) }), 32),
    (error) => error instanceof ApiRequestError && error.status === 413
  );

  assert.equal(apiErrorStatus(new ApiRequestError("too large", 413)), 413);
  assert.equal(apiErrorStatus(new Error("regular"), 422), 422);
  assert.equal(getSafeQueryLimit(new Request("http://localhost/api/events?limit=25")), 25);
  assert.equal(getSafeQueryLimit(new Request("http://localhost/api/events?limit=9999"), { maxLimit: 300 }), 300);
  assert.equal(getSafeQueryLimit(new Request("http://localhost/api/events?limit=-1"), { defaultLimit: 50 }), 50);
  assert.equal(getOptionalQueryString(new Request("http://localhost/api/orders?merchantId=merchant-orbita"), "merchantId"), "merchant-orbita");
  assert.equal(getOptionalQueryString(new Request("http://localhost/api/orders?merchantId=+"), "merchantId"), undefined);

  const genericError = await apiJsonError("Ошибка", 409, "CONFLICT").json();
  assert.deepEqual(genericError, { ok: false, error: "Ошибка", code: "CONFLICT" });

  const forbidden = apiForbidden("Нет доступа");
  assert.equal(forbidden.status, 403);
  assert.equal((await forbidden.json()).code, "FORBIDDEN");

  const notFound = apiNotFound("Не найдено");
  assert.equal(notFound.status, 404);
  assert.equal((await notFound.json()).code, "NOT_FOUND");

  console.log("API guard tests passed");
}

void main();
