import os from "os";
import process from "process";

// ---------------------------
// CONFIG
// ---------------------------
const DURATION_MS = 15_000; // total test duration
const CPU_LOAD_LEVEL = 0.7; // 0-1 (fraction of busy time per cycle)
const MEMORY_BLOCKS = 50; // number of 1MB allocations (simulate memory load)
const LOG_INTERVAL_MS = 1000; // metrics logging interval

// ---------------------------
// MEMORY LOAD
// ---------------------------
const blocks = [];
for (let i = 0; i < MEMORY_BLOCKS; i++) {
  // allocate ~1 MB each
  blocks.push(Buffer.alloc(1_000_000, "x"));
}

// ---------------------------
// METRICS LOGGING
// ---------------------------
let lastCPU = process.cpuUsage();
let elapsed = 0;

const logStats = () => {
  const cpu = process.cpuUsage(lastCPU);
  lastCPU = process.cpuUsage();

  const mem = process.memoryUsage();
  const load = os.loadavg();

  console.log(
    `\n[${(elapsed / 1000).toFixed(1)}s] --- System Metrics ---`,
    `\nRSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
    `\nHeap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
    `\nExternal: ${(mem.external / 1024 / 1024).toFixed(2)} MB`,
    `\nCPU (user+system): ${(cpu.user + cpu.system) / 1000} ms`,
    `\nLoad avg (1/5/15m): ${load.map((v) => v.toFixed(2)).join(", ")}`
  );

  elapsed += LOG_INTERVAL_MS;
};

// ---------------------------
// CPU LOAD FUNCTION
// ---------------------------
const startTime = Date.now();
const cycleTime = 100; // ms

const runLoad = () => {
  const now = Date.now();
  if (now - startTime > DURATION_MS) return;

  const busyTime = CPU_LOAD_LEVEL * cycleTime;
  const idleTime = cycleTime - busyTime;

  const end = performance.now() + busyTime;
  while (performance.now() < end) {
    // busy loop - burn CPU
    Math.sqrt(Math.random() * Math.random());
  }

  setTimeout(runLoad, idleTime);
};

// ---------------------------
// MAIN
// ---------------------------
console.log("Starting load test...");
setInterval(logStats, LOG_INTERVAL_MS);
runLoad();

setTimeout(() => {
  console.log("\nTest complete. Cleaning up...");
  blocks.length = 0;
  process.exit(0);
}, DURATION_MS + 500);
