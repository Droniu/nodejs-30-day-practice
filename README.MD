# 30-day Node.js Deep Dive

This is a repository for 30-day Node.js Deep Dive challenge.
Challenges should be possible to complete in 30 minutes.
Aim of this challenge is to practice advanced Node.js concepts.

## Week 1 – Core Internals & Event Loop

### Event Loop Phases

Challenge: Write a script with setTimeout, setImmediate, process.nextTick, Promise.resolve().then() and log order. Explain why.

### Timers & Microtasks

Challenge: Create a function that schedules 100k microtasks and measure latency drift of timers.

### EventEmitter Deep Dive

Challenge: Extend EventEmitter, add once-with-timeout, and test it.

### Process & OS Integration

Challenge: Use process.memoryUsage(), process.cpuUsage(), and os.loadavg() to log system stats every second.

### Cluster & Worker Threads

Challenge: Build a CPU-bound Fibonacci function. Run it once in the main thread, once via Worker Threads, once via cluster, and compare performance.

### Signals & Child Processes

Challenge: Spawn a child process that pings google.com and pipe stdout into parent process. Gracefully kill it with SIGTERM.

### Native Addons (Intro)

Challenge: Use node-gyp to build a trivial C++ addon returning “Hello from C++”.

## Week 2 – Async Patterns & Data Handling

### Advanced Promises

Challenge: Implement your own Promise.allSettled() polyfill.

### Async Iterators & Generators

Challenge: Build an async generator that reads lines from a file one by one.

### Streams – Basics

Challenge: Create a transform stream that uppercases all input. Pipe stdin → transform → stdout.

### Streams – Backpressure

Challenge: Simulate writing a 1GB file using streams and measure backpressure handling.

### Buffers & Binary Data

Challenge: Parse a PNG file header manually using fs.read + Buffer. Print width & height.

### Compression & Zlib

Challenge: Pipe a file through zlib.createGzip() and compare original vs compressed size.

### Crypto Module

Challenge: Hash a string with SHA-256, then encrypt/decrypt text using AES.

## Week 3 – Networking & APIs

### HTTP Internals

Challenge: Build a barebones HTTP server with http.createServer(), no frameworks. Parse query string manually.

### HTTPS & TLS

Challenge: Spin up an HTTPS server with a self-signed cert. Handle request logging.

### WebSockets

Challenge: Implement a chat server using ws. Broadcast messages to all connected clients.

### HTTP2

Challenge: Create a server using http2 that serves one HTML file + preloads CSS/JS.

### gRPC in Node

Challenge: Define a proto with a sayHello service, generate stubs, and call it.

### DNS & Networking

Challenge: Use dns.resolve4 vs dns.lookup to resolve a domain. Log differences.

### REST API Performance

Challenge: Benchmark a Node REST endpoint under 100 RPS using autocannon. Log latency.

## Week 4 – Production Skills

### Error Handling

Challenge: Build a script that catches sync, async, and promise rejections. Gracefully exit on uncaughtException.

### Logging & Monitoring

Challenge: Implement structured logging with pino. Add request IDs via middleware.

### Testing & Mocks

Challenge: Write Jest tests mocking an external API call with nock.

### Performance Profiling

Challenge: Profile a CPU-intensive loop with node --prof and identify hotspots.

### Security

Challenge: Implement rate limiting and input validation in a small Express/Koa app.

### Scalability – Load Balancing

Challenge: Run a clustered HTTP server (4 workers). Test round-robin load balancing with curl.

### CI/CD Basics

Challenge: Write a GitHub Action that runs npm test on every PR.

### Dockerize Node App

Challenge: Write a Dockerfile for a Node server with multi-stage builds.

### Design Interview Simulation

Challenge: Whiteboard (or doc) a URL shortener service in Node.js. Think: API design, database choice, scaling, cache, monitoring.
