## ⚙️ Event Loop Phases Recap

The Node.js event loop has **macro phases** it cycles through:

1. **Timers phase**
   Executes expired `setTimeout` and `setInterval` callbacks.

2. **Pending callbacks**
   Executes some system-level callbacks (not your typical JS stuff).

3. **Idle, prepare**
   Internal Node machinery.

4. **Poll phase**

   - Retrieves new I/O events (like fs, sockets).
   - If no timers are ready, Node _can block here waiting for I/O_.

5. **Check phase**
   Executes all `setImmediate` callbacks.

6. **Close callbacks**
   Executes close events (e.g. socket.on("close")).

**Microtasks** (`process.nextTick`, Promises) run _between_ phases — after the current operation, before the loop continues.

- `process.nextTick` is prioritized: it always runs **before** Promises.

---

## 🌀 Order of Execution in Our Script

Let’s reason step by step:

1. **Synchronous start**

   ```txt
   1. script start
   1b. script end
   ```

   (The main script runs top to bottom, logging as it goes.)

2. **Microtasks queue (after sync code, before timers/immediates)**

   - `process.nextTick` → always first.
   - Then Promises.

   ```txt
   2. process.nextTick (microtask)
   2b. Promise.resolve.then (microtask)
   ```

3. **Timers phase**

   - Your top-level `setTimeout 0ms` fires here.

   ```txt
   4. setTimeout 0ms (timers phase)
   ```

4. **Check phase**

   - `setImmediate` scheduled at top-level runs here.

   ```txt
   3. setImmediate (check phase)
   ```

   (⚠️ Between `setTimeout(0)` and `setImmediate` at top level, the order is _not guaranteed_. On most systems `setTimeout` wins first, but inside I/O it flips.)

5. **Poll phase / I/O callbacks**

   - After `fs.readFile` finishes reading the file, its callback is queued.

   ```txt
   5. I/O callback (fs.readFile)
   ```

   Inside that callback we schedule more timers and immediates.

6. **Check phase again**

   - The `setImmediate` inside I/O runs **before** the new timeout, because check comes before timers in this cycle.

   ```txt
   6. setImmediate inside I/O (check phase)
   ```

7. **Timers phase (next iteration)**

   - Finally, the `setTimeout` inside I/O executes.

   ```txt
   7. setTimeout inside I/O (timers phase)
   ```

---

## ✅ Final Log Order

On most Node setups, the console will show:

```txt
1. script start
1b. script end
2. process.nextTick (microtask)
2b. Promise.resolve.then (microtask)
4. setTimeout 0ms (timers phase)
3. setImmediate (check phase)
5. I/O callback (fs.readFile)
6. setImmediate inside I/O (check phase)
7. setTimeout inside I/O (timers phase)
```

---

👉 This shows you **all the major scheduling mechanisms** in action: sync logs, microtasks, timers, immediates, and I/O.
