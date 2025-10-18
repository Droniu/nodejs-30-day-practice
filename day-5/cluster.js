import { performance } from "node:perf_hooks";

process.on("message", async (n) => {
  const { fibonacci } = await import("./fibonacci.js");
  const start = performance.now();
  const result = fibonacci(n);
  const end = performance.now();

  process.send({
    result,
    time: (end - start).toFixed(2),
  });
});
