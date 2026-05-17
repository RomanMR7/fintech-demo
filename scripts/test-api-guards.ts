import assert from "node:assert/strict";
import { ApiRequestError, apiErrorStatus, readJsonBody } from "../lib/api-guards";

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

  console.log("API guard tests passed");
}

void main();
