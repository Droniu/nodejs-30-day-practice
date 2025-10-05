# 🚀 30-Day Node.js Deep Dive

This is a repository for the **30-day Node.js Deep Dive challenge**.
Each challenge is designed to be completed in **~30 minutes**.
The goal is to practice **advanced Node.js concepts** step by step.

## 📅 Week 1 – Core Internals & Event Loop

- **Day 1 – Event Loop Phases 🔄**
  Challenge: Write a script with `setTimeout`, `setImmediate`, `process.nextTick`, `Promise.resolve().then()` and log order. Explain why.

- **Day 2 – Timers & Microtasks ⏱️**
  Challenge: Create a function that schedules 100k microtasks and measure latency drift of timers.

- **Day 3 – EventEmitter Deep Dive 📡**
  Challenge: Extend EventEmitter, add `once-with-timeout`, and test it.

- **Day 4 – Process & OS Integration 🖥️**
  Challenge: Use `process.memoryUsage()`, `process.cpuUsage()`, and `os.loadavg()` to log system stats every second.

- **Day 5 – Cluster & Worker Threads 🧵**
  Challenge: Build a CPU-bound Fibonacci function. Run it once in the main thread, once via Worker Threads, once via cluster, and compare performance.

- **Day 6 – Signals & Child Processes ⚡**
  Challenge: Spawn a child process that pings google.com and pipe stdout into the parent process. Gracefully kill it with `SIGTERM`.

- **Day 7 – Native Addons (Intro) 🛠️**
  Challenge: Use `node-gyp` to build a trivial C++ addon returning “Hello from C++”.

## 📅 Week 2 – Async Patterns & Data Handling

- **Day 8 – Advanced Promises 🤝**
  Challenge: Implement your own `Promise.allSettled()` polyfill.

- **Day 9 – Async Iterators & Generators 🔄**
  Challenge: Build an async generator that reads lines from a file one by one.

- **Day 10 – Streams Basics 🌊**
  Challenge: Create a transform stream that uppercases all input. Pipe `stdin → transform → stdout`.

- **Day 11 – Streams Backpressure 🚰**
  Challenge: Simulate writing a 1GB file using streams and measure backpressure handling.

- **Day 12 – Buffers & Binary Data 📦**
  Challenge: Parse a PNG file header manually using `fs.read + Buffer`. Print width & height.

- **Day 13 – Compression & Zlib 🗜️**
  Challenge: Pipe a file through `zlib.createGzip()` and compare original vs compressed size.

- **Day 14 – Crypto Module 🔐**
  Challenge: Hash a string with SHA-256, then encrypt/decrypt text using AES.

## 📅 Week 3 – Networking & APIs

- **Day 15 – HTTP Internals 🌐**
  Challenge: Build a barebones HTTP server with `http.createServer()`. Parse query string manually.

- **Day 16 – HTTPS & TLS 🔒**
  Challenge: Spin up an HTTPS server with a self-signed cert. Handle request logging.

- **Day 17 – WebSockets 💬**
  Challenge: Implement a chat server using `ws`. Broadcast messages to all connected clients.

- **Day 18 – HTTP2 ⚡**
  Challenge: Create a server using `http2` that serves one HTML file + preloads CSS/JS.

- **Day 19 – gRPC in Node 📡**
  Challenge: Define a proto with a `sayHello` service, generate stubs, and call it.

- **Day 20 – DNS & Networking 🌍**
  Challenge: Use `dns.resolve4` vs `dns.lookup` to resolve a domain. Log differences.

- **Day 21 – REST API Performance 🏎️**
  Challenge: Benchmark a Node REST endpoint under 100 RPS using `autocannon`. Log latency.

## 📅 Week 4 – Production Skills

- **Day 22 – Error Handling 🚨**
  Challenge: Build a script that catches sync, async, and promise rejections. Gracefully exit on `uncaughtException`.

- **Day 23 – Logging & Monitoring 📊**
  Challenge: Implement structured logging with `pino`. Add request IDs via middleware.

- **Day 24 – Testing & Mocks 🧪**
  Challenge: Write Jest tests mocking an external API call with `nock`.

- **Day 25 – Performance Profiling 🔍**
  Challenge: Profile a CPU-intensive loop with `node --prof` and identify hotspots.

- **Day 26 – Security 🛡️**
  Challenge: Implement rate limiting and input validation in a small Express/Koa app.

- **Day 27 – Scalability & Load Balancing ⚖️**
  Challenge: Run a clustered HTTP server (4 workers). Test round-robin load balancing with `curl`.

- **Day 28 – CI/CD Basics 🤖**
  Challenge: Write a GitHub Action that runs `npm test` on every PR.

- **Day 29 – Dockerize Node App 🐳**
  Challenge: Write a Dockerfile for a Node server with multi-stage builds.

- **Day 30 – Design Interview Simulation 🏗️**
  Challenge: Whiteboard (or doc) a URL shortener service in Node.js. Think: API design, database choice, scaling, cache, monitoring.
