import { parentPort, workerData } from "node:worker_threads";
import { performance } from "node:perf_hooks";
import { fibonacci } from "./fibonacci.js";

const start = performance.now();
const result = fibonacci(workerData.n);
const end = performance.now();

parentPort.postMessage({
  result,
  time: (end - start).toFixed(2),
});
