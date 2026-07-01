import { describe, it, expect, beforeEach } from "vitest";
import { cacheService } from "@/services/cache.service";

describe("CacheService", () => {
  beforeEach(() => {
    cacheService.del("test:key");
  });

  it("stores and retrieves a value", () => {
    cacheService.set("test:key", { name: "bitcoin" }, 60);
    const result = cacheService.get<{ name: string }>("test:key");
    expect(result).toEqual({ name: "bitcoin" });
  });

  it("returns undefined for missing keys", () => {
    const result = cacheService.get("nonexistent");
    expect(result).toBeUndefined();
  });

  it("correctly reports has()", () => {
    expect(cacheService.has("test:key")).toBe(false);
    cacheService.set("test:key", "value", 60);
    expect(cacheService.has("test:key")).toBe(true);
  });

  it("deletes a key", () => {
    cacheService.set("test:key", "value", 60);
    cacheService.del("test:key");
    expect(cacheService.has("test:key")).toBe(false);
  });

  it("returns stats", () => {
    const stats = cacheService.stats();
    expect(stats).toHaveProperty("hits");
    expect(stats).toHaveProperty("misses");
    expect(stats).toHaveProperty("keys");
  });
});
