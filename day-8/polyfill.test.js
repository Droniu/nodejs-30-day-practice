import { describe, it, expect, beforeAll } from "vitest";

beforeAll(async () => {
  delete Promise.allSettled;
  await import("./polyfill.js");
});

describe("Promise.allSettled polyfill", () => {
  it("resolves immediately for empty array", async () => {
    const result = await Promise.allSettled([]);
    expect(result).toEqual([]);
  });

  it("resolves all fulfilled promises", async () => {
    const promises = [Promise.resolve(1), Promise.resolve("ok"), 42];
    const result = await Promise.allSettled(promises);
    expect(result).toEqual([
      { status: "fulfilled", value: 1 },
      { status: "fulfilled", value: "ok" },
      { status: "fulfilled", value: 42 },
    ]);
  });

  it("handles rejections properly", async () => {
    const promises = [Promise.reject("err"), Promise.resolve("yo")];
    const result = await Promise.allSettled(promises);
    expect(result).toEqual([
      { status: "rejected", reason: "err" },
      { status: "fulfilled", value: "yo" },
    ]);
  });

  it("waits for all promises to settle", async () => {
    let settled = false;
    const slow = new Promise((resolve) =>
      setTimeout(() => {
        settled = true;
        resolve("done");
      }, 50)
    );

    const result = await Promise.allSettled([slow]);
    expect(settled).toBe(true);
    expect(result).toEqual([{ status: "fulfilled", value: "done" }]);
  });

  it("preserves order of results", async () => {
    const promises = [
      new Promise((resolve) => setTimeout(() => resolve("first"), 30)),
      new Promise((_, reject) => setTimeout(() => reject("second"), 10)),
    ];
    const result = await Promise.allSettled(promises);
    expect(result).toEqual([
      { status: "fulfilled", value: "first" },
      { status: "rejected", reason: "second" },
    ]);
  });
});
