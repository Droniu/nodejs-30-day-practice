# ⚙️ Node.js Child Processes — Complete Guide

Node.js may be single-threaded, but it’s not weak.
When your API needs to crunch numbers, generate PDFs, or run external commands without blocking the main thread — that’s where **child processes** step in. 🧠

## 🧩 Why Spawn a Child Process?

Child processes let your app:

- 🚀 Run **CPU-heavy** or **blocking** tasks outside the event loop
- 🧵 Perform **parallel operations** safely
- ⚙️ Use **native executables** (Python, FFmpeg, wkhtmltopdf, etc.)
- 🧰 Keep your **main API responsive** — even under heavy load

Think of your API as the manager and each child process as a temp worker doing specialized jobs.

## 🔧 The Core Players

| Method                            | Description                                 | Use Case                           |
| --------------------------------- | ------------------------------------------- | ---------------------------------- |
| `spawn(command, args, options)`   | Starts a new process with **streaming I/O** | Long-running tasks, streaming logs |
| `exec(command, callback)`         | Runs a command and buffers output           | Quick shell commands               |
| `fork(modulePath, args, options)` | Spawns another Node script with IPC         | Background workers, micro-tasks    |

## 🚀 Example: `spawn()` in Action

```js
import { spawn } from "child_process";

const child = spawn("ping", ["-c", "5", "google.com"]);

child.stdout.on("data", (data) => {
  console.log(`stdout: ${data}`);
});

child.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

// exit gracefully with SIGTERM
process.on("SIGTERM", () => {
  child.kill("SIGTERM");
  process.exit(0);
});
```

### 🧠 What’s Going On

1. **`spawn()`** runs the `ping` command as a new process.
2. The **stdout** and **stderr** streams are read in real time.
3. When the parent receives **SIGTERM**, it kills the child too, preventing zombie processes 🧟‍♂️.

## ☠️ Common System Signals

| Signal      | Meaning                          | Typical Source       |
| ----------- | -------------------------------- | -------------------- |
| `SIGINT`    | Interrupt (Ctrl + C)             | User                 |
| `SIGTERM`   | Graceful stop                    | Docker, PM2, systemd |
| `SIGKILL`   | Immediate kill (can’t be caught) | OS forced shutdown   |
| `SIGHUP`    | Terminal hang-up                 | SSH disconnect       |
| `SIGUSR1/2` | Custom signals                   | App-specific hooks   |

Handling them prevents resource leaks and half-dead child processes.

## 🧱 Useful Spawn Options

```js
spawn("node", ["worker.js"], {
  stdio: "inherit", // stream logs directly
  cwd: "./scripts", // run from subdirectory
  env: { ...process.env, NODE_ENV: "production" },
});
```

## 🧩 Real-World Patterns in Web APIs & CRUD Apps

Let’s connect this to what you actually do in backend dev — no bullshit, just patterns that show up in real production code 👇

### 🧾 1. Generating Reports or PDFs (Offloading Heavy Work)

Instead of freezing your API while generating PDFs or Excel files:

```js
// api/reports.js
import { spawn } from "child_process";

export const generateReport = async (req, res) => {
  const child = spawn("node", ["scripts/generateReport.js", req.query.id]);

  let output = "";
  child.stdout.on("data", (chunk) => (output += chunk));
  child.on("close", (code) => {
    if (code !== 0) return res.status(500).send("Report failed");
    res.type("application/pdf").send(output);
  });
};
```

🧩 **Why it matters:** keeps the request loop fast, lets the child crunch data or render charts independently.

### 🖼️ 2. Image / Video Processing Pipelines

```js
const ffmpeg = spawn("ffmpeg", [
  "-i",
  "input.mp4",
  "-vf",
  "scale=1280:-1",
  "output.mp4",
]);

ffmpeg.stdout.on("data", (d) => console.log(`ffmpeg: ${d}`));
ffmpeg.stderr.on("data", (d) => console.error(`ffmpeg err: ${d}`));
```

Used for:

- Creating thumbnails
- Transcoding uploads
- Watermarking media

In a CRUD app, this could be triggered on a “new upload” event.

### 📬 3. Background Email / Queue Workers

When your API endpoint should respond fast and let a background job handle side effects:

```js
// POST /users
const child = fork("./workers/sendWelcomeEmail.js");
child.send({ email: user.email });
```

```js
// workers/sendWelcomeEmail.js
process.on("message", async (data) => {
  await sendEmail(data.email);
  process.exit(0);
});
```

💡 Pattern often combined with queues like **BullMQ**, **SQS**, or **RabbitMQ**, but forked child workers work great for small apps.

### 💾 4. Database Migrations or Batch Scripts

In admin APIs, you may trigger schema migrations or cleanups as subprocesses:

```js
app.post("/admin/run-migration", (req, res) => {
  const child = spawn("npm", ["run", "migrate"], { stdio: "inherit" });
  res.json({ status: "Migration started" });
});
```

This avoids blocking your Node API while a migration runs for minutes.

### 📡 5. Chaining Processes Together (Piping)

Example: `ps aux | grep node`

```js
const ps = spawn("ps", ["aux"]);
const grep = spawn("grep", ["node"]);

ps.stdout.pipe(grep.stdin);
grep.stdout.on("data", (data) => console.log(`Processes:\n${data}`));
```

🧩 Handy for log filtering, analytics, or chaining CLI tools.

## 💬 Communication with Child Processes

When you need structured data back (not stdout parsing), use `fork()`:

```js
// parent.js
const child = fork("./childWorker.js");

child.on("message", (msg) => console.log("Result:", msg));
child.send({ task: "sum", a: 5, b: 8 });
```

```js
// childWorker.js
process.on("message", (msg) => {
  if (msg.task === "sum") process.send({ result: msg.a + msg.b });
});
```

Perfect for CPU-bound calculations in web APIs like price recalculations or AI inference jobs.

## 🔥 Common Questions

### ⚙️ What’s the difference between `spawn` and `exec`?

- `spawn`: streams output → better for long-running processes
- `exec`: buffers output → better for short commands

### 🧠 What happens if the parent exits first?

The child keeps running — a **zombie** process.
Always clean up via signals or `child.kill()`.

### 💣 How to kill a child process manually?

```js
child.kill("SIGTERM"); // graceful
child.kill("SIGKILL"); // instant death
```

### 🧩 How to check if the process finished?

```js
child.on("close", (code) => console.log(`Exited with code ${code}`));
```

## 🧰 Bonus: Graceful Shutdown Pattern (for APIs & Workers)

```js
const children = [];

process.on("SIGTERM", () => {
  console.log("Shutting down gracefully...");
  children.forEach((c) => c.kill("SIGTERM"));
  process.exit(0);
});

function spawnTask() {
  const child = spawn("node", ["scripts/task.js"], { stdio: "inherit" });
  children.push(child);
}
```

Used in:

- 🐳 Docker containers
- 🧑‍💻 PM2-managed Node apps
- ☁️ AWS ECS / Lambda (graceful pre-stop hooks)

## 🧩 TL;DR

- 🧵 Use `spawn()` for long-running tasks (e.g., ffmpeg, ping, reports)
- 💾 Use `exec()` for simple shell commands
- 🧠 Use `fork()` for Node-to-Node background workers
- ⚰️ Always handle `SIGTERM` to avoid zombies
- 🚀 Child processes make APIs scalable and responsive by offloading blocking work

Would you like me to add **Docker-friendly patterns** next (e.g., how to propagate `SIGTERM` correctly inside containers and handle `process.on('SIGINT')` for ECS/Compose environments)?
That’s a super common real-world issue with child processes in APIs.
