# 🚀 Node.js Concurrency: Main Thread vs Worker Threads vs Cluster

A practical guide to running CPU-heavy work in Node.js using the **main thread**, **Worker Threads**, and **Cluster/child processes**. Includes a runnable benchmark (`npm run benchmark`) that compares real-world overheads and explains what the numbers actually mean.

## 🧭 What this repo does

This project benchmarks a CPU-bound **Fibonacci** (naive recursive) three ways:

- **Main thread** — baseline, single event loop
- **Worker Thread** — in-process multithreading
- **Cluster / forked process** — multi-process parallelism

For each approach, it prints:

- **Internal compute time** (pure CPU for the task)
- **Total wall time** (includes startup + IPC overhead)

## 🧪 How to run

```bash
npm run benchmark
```

Example console output (your numbers will differ):

```
================================
FIBONACCI BENCHMARK
Computing fibonacci(40)
================================

-----------------------------Executing fibonacci in main thread...
Result: 102334155
Main thread time: 420.17 ms
-----------------------------
-----------------------------Executing fibonacci in worker thread...
Result: 102334155
Worker internal time: 416.82 ms
Total wall time (including thread overhead): 470.51 ms
-----------------------------
-----------------------------Executing fibonacci in cluster (forked process)...
Result: 102334155
Cluster internal time: 418.39 ms
Total wall time (including process overhead): 508.23 ms
-----------------------------
================================
BENCHMARK SUMMARY
================================
Main thread:    420.17 ms
Worker thread:  470.51 ms (overhead: 53.69 ms)
Cluster:        508.23 ms (overhead: 89.84 ms)
================================
```

> The **pattern** matters: main ≈ pure compute; workers/processes add creation + messaging overhead. Under concurrency, workers and clusters let you utilize multiple CPU cores.

## 🧠 Concepts in 60 seconds

### Main Thread (Event Loop)

- Single thread running V8 + libuv event loop.
- Excellent for **I/O-bound** tasks (HTTP, DB, files).
- **Synchronous CPU** work blocks the event loop and delays all requests.

### Worker Threads (Multithreading in one process)

- Real OS threads inside the same process; each has its own V8 instance and event loop.
- Communicate via **message passing**, **transferables** (e.g., `ArrayBuffer`), or **`SharedArrayBuffer` + `Atomics`** for shared memory.
- Ideal for **CPU-heavy** tasks where you want lower overhead than processes.

### Cluster / Child Process (Multi-process)

- Spawns **separate Node processes** (often 1 per core).
- Strong **isolation** (one crash doesn’t kill the rest).
- Great for **I/O scale** across cores; IPC is heavier than worker messaging and there’s no shared memory by default.

## 🧱 When to choose what

| Scenario                                          | Choose                            | Why                                                        |
| ------------------------------------------------- | --------------------------------- | ---------------------------------------------------------- |
| Pure I/O server, need all cores                   | **Cluster** (or PM2 / containers) | Multi-process parallelism; process isolation               |
| CPU-heavy tasks (hashing, image/PDF, compression) | **Worker Threads**                | In-process threads, lower overhead, optional shared memory |
| Need strong isolation / per-process limits        | **Cluster**                       | Fault containment; separate heaps                          |
| Need both I/O scale and CPU offload               | **Cluster + Worker pool**         | One process per core, each with worker threads             |

**Rule of thumb:** Workers for **CPU**, Cluster for **I/O + isolation**. Combine for serious systems.

## 🧩 What the benchmark demonstrates

- **Main**: Measures the blocking cost directly on the event loop (baseline).
- **Worker**: Captures **internal compute** vs **total wall** time (spawn + IPC).
- **Cluster**: Same comparison, typically with **higher** overhead than workers due to process creation + IPC.

This highlights where overhead comes from and why pooling matters.

## 🛠️ Production tips

- **Pool workers** (e.g., **Piscina**) instead of spawning per task; compare cold vs warm runs.
- Prefer **transferables** or **`SharedArrayBuffer`** to avoid large JSON serialization costs.
- For Cluster:

  - Implement **graceful shutdown** (`SIGTERM`, drain connections, close server).
  - Use **sticky sessions** for WebSockets or any stateful connection.
  - Many teams scale processes via **PM2** or **Kubernetes** rather than the raw `cluster` API.

- **Backpressure**: wrap CPU jobs in a queue (BullMQ, SQS, Kinesis, etc.) and cap concurrency.
- **Observability**: track **event-loop lag** (`perf_hooks.monitorEventLoopDelay()`), worker queue depth, and latency percentiles.
- **Safety**: set per-process memory limits; auto-restart on crash (PM2/K8s).

## 📁 Code layout

```
.
├─ fibonacci.js    # naive CPU-bound Fibonacci
├─ worker.js       # Worker Thread: computes & postMessage({ result, time })
├─ cluster.js      # Forked process: computes & process.send({ result, time })
└─ benchmark.js    # Orchestrates main, worker, cluster & prints summary
```

**package.json** (ESM):

```json
{
  "type": "module",
  "scripts": {
    "benchmark": "node benchmark.js"
  }
}
```

> If you’re not using ESM, convert `import` → `require` or enable `"type": "module"`.

## 🔬 Benchmark methodology notes

- Use `performance.now()` for high-resolution timing.
- Consider **warming up** functions before timing (JIT effects).
- Run multiple iterations and compute **averages** / percentiles.
- `fibonacci(n=40)` is intentionally exponential; it’s illustrative but not representative of linear CPU tasks like hashing/compression.

**Alternative CPU tasks to test**

- `crypto.pbkdf2` / `scrypt` / Argon2
- `zlib.deflate` / `gzip`
- Image resizing / PDF generation
- Matrix multiply or vectorized loops

## ❓ Interview Q&A (quick reference)

- **Why do Worker Threads exist in Node?**
  Node’s JS runs on a single event loop thread; Workers enable **parallel CPU execution** without blocking the event loop.

- **Workers vs Cluster — key difference?**
  Workers are **threads** in one process (lower overhead, optional shared memory). Cluster uses **processes** (strong isolation, heavier IPC, higher RAM).

- **When avoid Workers?**
  When you need **hard isolation**, per-process memory caps, or your dependencies aren’t thread-safe / use native addons poorly in multithreaded contexts.

- **How to make IPC fast?**
  Use **transferables** (`ArrayBuffer`) or **`SharedArrayBuffer` + `Atomics`**; avoid serializing large objects; pre-allocate buffers.

- **Do I need sticky sessions?**
  For **WebSockets/long-lived stateful** connections, yes. Stateless HTTP can hit any process.

- **How to avoid blocking the event loop in APIs?**
  Offload CPU to a **worker pool**, apply **backpressure**, and monitor **event-loop lag**.

- **Why use Cluster if I can scale containers?**
  Cluster gives multi-core scale **within** a container/VM. Containers/PM2 handle **orchestration** and **restarts** at a higher level.

## ➕ Next steps

- Add a **warm worker pool** run to show reduced overhead.
- Launch **N concurrent jobs** to demonstrate throughput scaling.
- Swap Fibonacci for a **realistic CPU task** (hashing, compression, imaging).
- Record **p50/p95/p99** for more meaningful latency analysis.

## 🧾 Notes

This code is for educational benchmarking. The naive Fibonacci is intentionally costly (exponential) to make differences obvious. Always benchmark on **your** hardware with **your** payloads and concurrency patterns.
