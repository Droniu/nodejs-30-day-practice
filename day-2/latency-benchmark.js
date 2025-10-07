const MICRO_COUNT = 1_000_000;
const INTERVAL = 100; // ms

function hammerMicrotasks(n = MICRO_COUNT) {
  for (let i = 0; i < n; i++) {
    queueMicrotask(() => {
      // small CPU load (~10 µs)
      const start = performance.now();
      while (performance.now() - start < 0.01) {}
    });
  }
}

function hammerPromises(n = MICRO_COUNT) {
  for (let i = 0; i < n; i++) {
    Promise.resolve().then(() => {
      // small CPU load (~10 µs)
      const start = performance.now();
      while (performance.now() - start < 0.01) {}
    });
  }
}
// Run interval and measure drift
console.log("--------------------------------");
console.log("Starting benchmark...");

const benchmarkLatency = (hammerFn, benchmarkName) => {
  let last = performance.now();
  return setInterval(() => {
    const now = performance.now();
    const drift = now - last - INTERVAL;
    last = now;

    console.log(`${benchmarkName} drift: ${drift.toFixed(2)} ms`);

    // Every few ticks, hammer the event loop
    hammerFn();
  }, INTERVAL);
};

const microtaskInterval = benchmarkLatency(hammerMicrotasks, "Microtask");
const promiseInterval = benchmarkLatency(hammerPromises, "Promise");

setTimeout(() => {
  clearInterval(microtaskInterval);
  clearInterval(promiseInterval);
  console.log("Benchmark done.");
  console.log("--------------------------------");
}, 3000);
