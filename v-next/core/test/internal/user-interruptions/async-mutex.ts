import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { AsyncMutex } from "../../../src/internal/async-mutex.js";

describe("AsyncMutex", () => {
  it("should run a function exclusively", async () => {
    const mutex = new AsyncMutex();

    let running = 0;
    let maxRunning = 0;

    async function run() {
      running++;
      maxRunning = Math.max(maxRunning, running);
      await new Promise((resolve) => setTimeout(resolve, 10));
      running--;
    }

    await Promise.all([
      mutex.excluiveRun(run),
      mutex.excluiveRun(run),
      mutex.excluiveRun(run),
    ]);

    assert.strictEqual(maxRunning, 1);
  });
});
