# 🧩 Node.js OS & Process Integration (Practical Backend Patterns)

## Overview

Node.js isn’t just JavaScript on a server — it’s a bridge between **your code and the operating system**.
Through modules like `process`, `fs`, `path`, `os`, and `perf_hooks`, Node lets your backend:

- Interact with the environment (env vars, CPU/memory info)
- Manage its lifecycle (graceful shutdowns)
- Work with the filesystem
- Invoke system tools
- Measure and monitor performance

These tools are the backbone of production-grade APIs that live inside Docker containers, auto-scale on Kubernetes, and handle complex workloads without falling apart.

## ⚙️ 1. Process Management

The `process` module is your direct handle to the Node runtime and OS-level process metadata.
It’s available globally — no import needed — but understanding its power separates hobby code from production code.

### 🧠 Core Concepts

| API                                         | Purpose                                |
| ------------------------------------------- | -------------------------------------- |
| `process.env`                               | Environment variables                  |
| `process.cwd()`                             | Current working directory              |
| `process.pid` / `process.ppid`              | Process and parent process IDs         |
| `process.memoryUsage()`                     | Memory breakdown (heap, RSS, external) |
| `process.cpuUsage()`                        | CPU time used by user/system           |
| `process.uptime()`                          | Lifetime since start                   |
| `process.exit([code])`                      | Graceful or forced termination         |
| `process.on('exit' / 'SIGTERM' / 'SIGINT')` | Lifecycle events                       |

### 🧩 Practical Patterns

#### **a. Environment Configuration Pattern**

Centralized, validated config for environment-dependent behavior.

```ts
import dotenv from "dotenv";
dotenv.config();

function getEnv(key: string, required = true) {
  const value = process.env[key];
  if (!value && required) throw new Error(`Missing required env var: ${key}`);
  return value!;
}

export const config = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  DATABASE_URL: getEnv("DATABASE_URL"),
};
```

**Why it matters:** prevents undefined runtime errors, enforces configuration hygiene, and enables 12-factor app compliance.

#### **b. Graceful Shutdown Pattern**

Cleanly handle process termination (important for Docker/K8s).

```ts
import http from "http";

const server = http.createServer(app);
server.listen(3000);

const shutdown = async () => {
  console.log("Gracefully shutting down...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

**Why it matters:** prevents dropped requests or corrupted state during scaling, redeploys, or crashes.

#### **c. Resource Monitoring Pattern**

Track memory and CPU usage periodically.

```ts
setInterval(() => {
  const mem = process.memoryUsage();
  const cpu = process.cpuUsage();
  console.log({
    rssMB: (mem.rss / 1024 / 1024).toFixed(2),
    heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
    cpuUserMS: cpu.user / 1000,
  });
}, 10_000);
```

**Why it matters:** allows lightweight self-diagnostics, alerting, or auto-restarts on resource leaks.

## 📂 2. Filesystem & Path Integration

The `fs`, `path`, and `os` modules expose system-level file I/O, path resolution, and platform information.

### 🧠 Core Concepts

| Module | Key APIs                                                       | Purpose                           |
| ------ | -------------------------------------------------------------- | --------------------------------- |
| `fs`   | `readFile`, `writeFile`, `mkdir`, `existsSync`, `promises`     | Read/write files, directories     |
| `path` | `join`, `resolve`, `dirname`, `basename`                       | Cross-platform path normalization |
| `os`   | `tmpdir`, `cpus`, `totalmem`, `freemem`, `platform`, `homedir` | OS environment info               |

### 🧩 Practical Patterns

#### **a. Persistent Config & Cache Pattern**

Store small bits of structured state between runs.

```ts
import fs from "fs";
import path from "path";

const cachePath = path.resolve(process.cwd(), "cache/state.json");

export function loadCache() {
  if (!fs.existsSync(cachePath)) return {};
  return JSON.parse(fs.readFileSync(cachePath, "utf8"));
}

export function saveCache(data: any) {
  fs.mkdirSync(path.dirname(cachePath), { recursive: true });
  fs.writeFileSync(cachePath, JSON.stringify(data, null, 2));
}
```

**Used for:**
Feature flags, migration checkpoints, local caching, static builds.

#### **b. File Upload Temp Storage Pattern**

Handle file uploads via temporary directories.

```ts
import os from "os";
import fs from "fs";
import path from "path";
import multer from "multer";

const tempDir = path.join(os.tmpdir(), "uploads");
fs.mkdirSync(tempDir, { recursive: true });

const upload = multer({ dest: tempDir });

app.post("/upload", upload.single("file"), async (req, res) => {
  // Process req.file.path before moving to S3
  res.json({ ok: true });
});
```

**Used for:** image upload endpoints, data imports, user-generated content.

#### **c. Temporary File Lifecycle Pattern**

Ensure temp files don’t linger after process exit.

```ts
import fs from "fs";
import path from "path";

const tmpFiles: string[] = [];

export function createTempFile(content: string) {
  const file = path.resolve("tmp", `${Date.now()}.txt`);
  fs.mkdirSync("tmp", { recursive: true });
  fs.writeFileSync(file, content);
  tmpFiles.push(file);
  return file;
}

process.on("exit", () => {
  tmpFiles.forEach((f) => fs.existsSync(f) && fs.unlinkSync(f));
});
```

**Used for:** report generation, CSV/PDF exports, transient artifacts.

#### **d. Health & Diagnostics Pattern**

Expose system-level stats via HTTP endpoint.

```ts
import os from "os";
import process from "process";

app.get("/health", (_, res) => {
  res.json({
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    load: os.loadavg(),
    cpus: os.cpus().length,
    platform: os.platform(),
  });
});
```

**Used for:** readiness probes, monitoring dashboards, Prometheus metrics.

## ⚡ 3. System Command Integration

Node can invoke external binaries — essential when delegating tasks to optimized system tools (e.g., ffmpeg, git, imagemagick).

### 🧠 Core Concepts

| API                     | Description                                              |
| ----------------------- | -------------------------------------------------------- |
| `child_process.exec()`  | Executes a command in a shell, buffers output            |
| `child_process.spawn()` | Streams output (for long processes)                      |
| `execa`                 | Modern wrapper: async/await, auto error handling, secure |
| `process.exitCode`      | Captures child exit status                               |

### 🧩 Practical Patterns

#### **a. Safe External Tool Invocation**

```ts
import { execa } from "execa";

async function createThumbnail(file: string) {
  const output = file.replace(".mp4", ".jpg");
  await execa("ffmpeg", [
    "-i",
    file,
    "-ss",
    "00:00:01",
    "-vframes",
    "1",
    output,
  ]);
  return output;
}
```

**Used for:** media processing, analytics pipelines, versioning with Git.

#### **b. Command-based Automation**

```ts
import { execa } from "execa";

export async function buildStaticSite() {
  await execa("npm", ["run", "build"], { stdio: "inherit" });
}
```

**Used for:** CI/CD tasks, deployment scripts, post-build hooks.

**Security Notes**

- Never concatenate user input directly — sanitize arguments.
- Prefer `execFile`/`execa` to avoid shell injection.
- Run commands in restricted containers or limited permissions.

## 🧮 4. Performance Hooks & Resource Monitoring

The `perf_hooks` module and `process` APIs allow detailed timing, event loop, and memory metrics — useful for profiling and performance baselines.

### 🧠 Core Concepts

| API                                | Purpose                         |
| ---------------------------------- | ------------------------------- |
| `performance.mark()` / `measure()` | Create named timing intervals   |
| `PerformanceObserver`              | Subscribe to performance events |
| `performance.now()`                | High-resolution timestamp       |
| `process.memoryUsage()`            | Memory profiling                |
| `process.cpuUsage()`               | CPU time profiling              |

### 🧩 Practical Patterns

#### **a. Request Latency Profiling**

```ts
import { performance, PerformanceObserver } from "perf_hooks";

const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration.toFixed(2)} ms`);
  });
});
obs.observe({ entryTypes: ["measure"], buffered: true });

app.use(async (req, res, next) => {
  const label = `Request ${req.method} ${req.path}`;
  performance.mark(`${label}-start`);
  await next();
  performance.mark(`${label}-end`);
  performance.measure(label, `${label}-start`, `${label}-end`);
});
```

**Used for:** route-level profiling, slow endpoint detection, custom telemetry.

#### **b. Memory & CPU Health Dashboard**

```ts
import os from "os";
import process from "process";

app.get("/metrics", (req, res) => {
  const mem = process.memoryUsage();
  res.json({
    heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(1),
    rssMB: (mem.rss / 1024 / 1024).toFixed(1),
    load: os.loadavg(),
    uptime: process.uptime().toFixed(0),
  });
});
```

**Used for:** lightweight observability endpoints or self-diagnostic APIs.

## 🧱 Summary: The Backbone of System-Aware Node Backends

| Category                 | Module                        | Purpose / Use Case                            |
| ------------------------ | ----------------------------- | --------------------------------------------- |
| Process Management       | `process`                     | Config, graceful shutdowns, resource usage    |
| File System              | `fs`, `path`, `os`            | Caching, uploads, health checks, temp storage |
| System Commands          | `execa`, `child_process`      | Running native tools & scripts                |
| Performance & Monitoring | `perf_hooks`, `process`, `os` | Profiling and runtime telemetry               |
