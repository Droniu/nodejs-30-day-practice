# 🤞 Deep-Dive into Promises, Polyfills & Async Wizardry

## ⚙️ Polyfills, Shims & Transpiling — Know the Difference

| Term            | 💬 What It Does                                                                 | ⚡ Typical Example                                           |
| --------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **Polyfill**    | Adds a _missing_ feature to a runtime.                                          | Implementing `Promise.allSettled` when Node doesn’t have it. |
| **Shim**        | Same idea as polyfill, but can also _modify_ existing behavior to match a spec. | `es-shim` packages like `array-includes/shim.js`.            |
| **Transpiling** | Converts _new syntax_ → _old syntax_ at build time.                             | Babel turns `async/await` → generator + `Promise` code.      |

🧠 **Interview gold:**

- Polyfill = _runtime patch_.
- Transpile = _build-time rewrite_.
- Shim = _patch, possibly override existing behavior_.

## 🧩 The Script — Custom `Promise.allSettled` Polyfill

```js
if (!Promise.allSettled) {
  Promise.allSettled = function (promises) {
    const results = promises.map((promise) =>
      Promise.resolve(promise)
        .then((value) => ({ status: "fulfilled", value }))
        .catch((reason) => ({ status: "rejected", reason }))
    );
    return Promise.all(results);
  };
}
```

### 🔍 What It Does

- Checks if `Promise.allSettled` exists; if not, defines it.
- Converts **any input** (value, promise, or thenable) into a real Promise via `Promise.resolve()`.
- Returns an array of results like:

  ```js
  [
    { status: "fulfilled", value: ... },
    { status: "rejected", reason: ... }
  ]
  ```

- Waits for _all_ promises to settle — never rejects as a whole.

✅ **Spec-correct**
✅ **Handles plain values, thenables, and mixed arrays**
✅ **Preserves order of input promises**

Run your test suite with:

```bash
npm run test
```

## 💡 Key Promise Tips & Interview Triggers

### 🧱 Promise Basics

- A Promise represents a value that may resolve in the **future**.
- `.then()` and `.catch()` callbacks run in the **microtask queue** (after sync code).
- `.finally()` runs after either resolve or reject.

### ⏱️ Microtasks vs Macrotasks

| Type          | Example                           | Runs                                 |
| ------------- | --------------------------------- | ------------------------------------ |
| **Microtask** | `Promise.then`, `queueMicrotask`  | After current stack, before timeouts |
| **Macrotask** | `setTimeout`, I/O, `setImmediate` | After microtasks finish              |

```js
setTimeout(() => console.log("timeout"));
Promise.resolve().then(() => console.log("promise"));
console.log("sync");
// sync → promise → timeout
```

### 🧩 Async Function Mechanics

| Form                             | Returns                      | Notes                                |
| -------------------------------- | ---------------------------- | ------------------------------------ |
| `return new Promise()`           | Custom async logic           | Used when you _build_ async manually |
| `return Promise.resolve(x)`      | Immediately resolved Promise | Normalizes sync to async             |
| `return somePromise()`           | Forward result               | ✅ No extra microtask                |
| `return await somePromise()`     | Waits inside, adds microtask | Useful for `try/catch`               |
| `return await Promise.resolve()` | 🤡 redundant                 | Double-wrapped nonsense              |

**Golden rule 🧠:**

> Use `await` only when you need to _do something after_ the Promise resolves.
> Otherwise, just return it.

### ⏳ Microtask Delay in Practice

```js
let done = false;
Promise.resolve().then(() => (done = true));
console.log(done); // false (callback runs later)
```

But:

```js
Promise.resolve((done = true));
console.log(done); // true (assignment runs before promise creation)
```

> Promises are async only in _resolution_, not in _creation_.

### 🔥 Advanced Promise Tricks

- **Promise.all** → fails fast if any reject.
- **Promise.allSettled** → waits for all, never rejects.
- **Promise.any** → resolves with the _first success_, ignores rejects.
- **Promise.race** → resolves/rejects with the _first settled_ promise.

| Feature      | Rejects early?           | Waits for all? |
| ------------ | ------------------------ | -------------- |
| `all`        | ✅ yes                   | ❌ no          |
| `allSettled` | ❌ no                    | ✅ yes         |
| `race`       | ✅ yes                   | ❌ no          |
| `any`        | ❌ no (until all reject) | ❌ no          |

### 🧠 Common Gotchas

- `Promise.resolve()` evaluates its argument _immediately_.
- `await` always yields control back to the event loop (adds a microtask tick).
- Multiple `await`s can reorder logs even in synchronous-looking code.
- `Promise.resolve(promise)` = _idempotent_ (returns same promise, doesn’t wrap twice).

### ⚙️ Debugging Tips

- Use `Promise.allSettled()` when debugging async chains → no “unhandled rejection” spam.
- If async test fails randomly → missing `await` or microtask timing.
- To flush microtasks manually:

  ```js
  await Promise.resolve();
  ```

## 🏁 Quick Recap (Interview Checklist)

✅ What’s a polyfill / shim / transpiler?
✅ What’s the event loop order (sync → microtasks → macrotasks)?
✅ What does `Promise.resolve()` really do?
✅ When to use `await` vs direct return?
✅ Difference between `Promise.all`, `.allSettled`, `.race`, `.any`?
✅ Why is this polyfill correct?

If you can answer all that — you’re officially async-certified, bro 😎⚡

> 💬 _“Promises don’t make code faster — they make it predictable.”_
> Now go melt interviewers’ brains.
