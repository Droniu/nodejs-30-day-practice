import { performance } from "node:perf_hooks";
import { Worker } from "node:worker_threads";
import { fork } from "node:child_process";
import { fibonacci } from "./fibonacci.js";

const n = 40;

console.log("================================");
console.log("FIBONACCI BENCHMARK");
console.log(`Computing fibonacci(${n})`);
console.log("================================\n");

// Main Thread Benchmark
console.log("--------------------------------");
console.log("Executing fibonacci in main thread...");

const mainStart = performance.now();
const mainResult = fibonacci(n);
const mainEnd = performance.now();

console.log(`Result: ${mainResult}`);
console.log(`Main thread time: ${(mainEnd - mainStart).toFixed(2)} ms`);
console.log("--------------------------------");
console.log("\n");

// Helpers to run benchmarks without nesting
const runWorker = (n) =>
  new Promise((resolve, reject) => {
    const start = performance.now();
    const worker = new Worker("./worker.js", { workerData: { n } });
    worker.once("message", ({ result, time }) => {
      const totalMs = performance.now() - start;
      worker.terminate();
      resolve({ result, internalMs: Number(time), totalMs });
    });
    worker.once("error", reject);
  });

const runCluster = (n) =>
  new Promise((resolve, reject) => {
    const start = performance.now();
    const child = fork("./cluster.js");
    child.send(n);
    child.once("message", ({ result, time }) => {
      const totalMs = performance.now() - start;
      try {
        child.kill();
      } catch {}
      resolve({ result, internalMs: Number(time), totalMs });
    });
    child.once("error", reject);
  });

// Worker Thread Benchmark
console.log("--------------------------------");
console.log("Executing fibonacci in worker thread...");
const workerRes = await runWorker(n);
console.log(`Result: ${workerRes.result}`);
console.log(`Worker internal time: ${workerRes.internalMs.toFixed(2)} ms`);
console.log(
  `Total wall time (including thread overhead): ${workerRes.totalMs.toFixed(
    2
  )} ms`
);
console.log("--------------------------------");
console.log("\n");

// Cluster Benchmark
console.log("--------------------------------");
console.log("Executing fibonacci in cluster (forked process)...");
const clusterRes = await runCluster(n);
console.log(`Result: ${clusterRes.result}`);
console.log(`Cluster internal time: ${clusterRes.internalMs.toFixed(2)} ms`);
console.log(
  `Total wall time (including process overhead): ${clusterRes.totalMs.toFixed(
    2
  )} ms`
);
console.log("--------------------------------");
console.log("\n");

console.log("================================");
console.log("BENCHMARK SUMMARY");
console.log("================================");
console.log(`Main thread:    ${(mainEnd - mainStart).toFixed(2)} ms`);
console.log(
  `Worker thread:  ${workerRes.totalMs.toFixed(2)} ms (overhead: ${(
    workerRes.totalMs - workerRes.internalMs
  ).toFixed(2)} ms)`
);
console.log(
  `Cluster:        ${clusterRes.totalMs.toFixed(2)} ms (overhead: ${(
    clusterRes.totalMs - clusterRes.internalMs
  ).toFixed(2)} ms)`
);
console.log("================================\n");
