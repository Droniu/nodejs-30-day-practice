import { describe, test, expect } from "vitest";
import { SpecialEmitter } from "./event-emitter.js";

describe("SpecialEmitter", () => {
  test("resolves when event fires before timeout", async () => {
    const emitter = new SpecialEmitter();

    const promise = emitter.onceWithTimeout("ping", 500);
    setTimeout(() => emitter.emit("ping", "pong"), 100);

    const result = await promise;
    expect(result).toBe("pong");
  });

  test("rejects with error when timeout passes", async () => {
    const emitter = new SpecialEmitter();

    await expect(emitter.onceWithTimeout("ping", 100)).rejects.toThrow(
      /timeout/i
    );
  });

  test("removes listener after successful event", async () => {
    const emitter = new SpecialEmitter();

    const promise = emitter.onceWithTimeout("ping", 500);
    emitter.emit("ping", "ok");
    await promise;

    expect(emitter.listenerCount("ping")).toBe(0);
  });

  test("removes listener after timeout", async () => {
    const emitter = new SpecialEmitter();

    try {
      await emitter.onceWithTimeout("ping", 50);
    } catch {}

    expect(emitter.listenerCount("ping")).toBe(0);
  });

  test("does not resolve if event fires after timeout", async () => {
    const emitter = new SpecialEmitter();

    const promise = emitter.onceWithTimeout("ping", 50);
    await expect(promise).rejects.toThrow();

    // Fire event too late
    emitter.emit("ping", "too late");

    // Wait a bit to confirm no weird side effects
    await new Promise((res) => setTimeout(res, 100));
    expect(emitter.listenerCount("ping")).toBe(0);
  });
});
