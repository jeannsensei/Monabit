import { describe, it, expect } from "vitest";
import { sleep, withRetry } from "@/utils/retry";

describe("Retry Utils", () => {
  it("sleeps for specified duration", async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(45);
  });

  it("withRetry succeeds on first attempt", async () => {
    let calls = 0;
    const result = await withRetry(async () => {
      calls++;
      return "success";
    });
    expect(result).toBe("success");
    expect(calls).toBe(1);
  });

  it("withRetry retries on failure and succeeds", async () => {
    let calls = 0;
    const result = await withRetry(
      async () => {
        calls++;
        if (calls < 3) throw new Error("fail");
        return "eventual success";
      },
      { retries: 3, baseDelay: 10 },
    );
    expect(result).toBe("eventual success");
    expect(calls).toBe(3);
  });

  it("withRetry throws after max retries", async () => {
    let calls = 0;
    await expect(
      withRetry(
        async () => {
          calls++;
          throw new Error("always fail");
        },
        { retries: 2, baseDelay: 10 },
      ),
    ).rejects.toThrow("always fail");
    expect(calls).toBe(3);
  });
});
