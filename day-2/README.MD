# ⏱️ Node.js Microtasks vs Timers Benchmark

This note explains **what this script demonstrates**, why `setInterval` **doesn’t “catch up”** after the event loop is blocked, and why the **3-second `setTimeout`** fires when it does. It’s concise, practical, and slightly emoji-flavored. 🙂

## 1) What this script does 🧪

Two repeating timers (`setInterval(..., 100)`) run concurrently:

- One floods the **microtask queue** with `queueMicrotask` callbacks that do tiny CPU work.
- The other floods the **microtask queue** via `Promise.then` callbacks doing the same.
  A single-shot `setTimeout(..., 3000)` is armed to stop both.

Each interval logs **“drift”** = _actual firing time − previous firing time − 100 ms_. Under heavy microtask load, the single thread is busy for long stretches, so the “100 ms” cadence slips by seconds — the large drift values you observed. (Node/HTML explicitly warn that timer timing is **not guaranteed** under load.) ([Node.js][1])

### Example output

```text
--------------------------------
Starting benchmark...
Microtask drift: 1.22 ms
Promise drift: 10578.79 ms
Microtask drift: 21045.90 ms
Promise drift: 21218.27 ms
Benchmark done.
--------------------------------
```

## 2) Why microtasks can explode timer latency 💥

Microtasks (both `queueMicrotask` and Promise jobs) are drained **before** the event loop proceeds to the next phase. If a run enqueues hundreds of thousands of busy microtasks, the loop **cannot** advance to timers or I/O until they finish, so timers that become due during that period only run **after** the drain completes — hence the huge drift. (This ordering is part of the event loop/microtask model described in standard references.) ([Builder.io][2])

## 3) Why `setInterval` doesn’t “catch up” 🧭

Repeating timers in **libuv** (which powers Node’s timers) are **re-armed relative to “now”** when they run. They do **not** backfill missed ticks. In practice:

- If the loop is blocked for 10 s, the interval will not fire 100 times in a burst afterward.
- It fires **once** when the loop reaches the timers phase, then its next due time becomes **now + interval**.
  Authoritative wording: “**Repeating timers do not adjust for overhead but are rearmed relative to the event loop’s idea of ‘now’.**” ([docs.libuv.org][3])

The Web platform mirrors the same intent for `setInterval`: _a single delayed execution must not schedule multiple immediate follow-ups_ (i.e., no catch-up). ([GitHub][4])

## 4) Why the 3-second timeout fires when it does ⏳

Two mechanics explain the ordering you saw:

1. **Timers-phase snapshot.**
   When the loop enters the timers phase, libuv updates its notion of “now” and runs callbacks for **expired timers** — those with `due_at ≤ now`. Anything with `due_at > now` at that instant waits for the **next** loop iteration, even if wall-clock time advances during long callbacks. ([Stack Overflow][5])

2. **Rearm vs fixed due time.**

- Each interval, once it _finally_ runs, is pushed to **(callback_start_time + interval)** — i.e., into the **future** from that moment.
- The one-shot `setTimeout(..., 3000)` keeps its original **due_at = t0 + 3000 ms**. As soon as a timers phase begins with `now ≥ due_at`, that timeout is eligible and will run (subject to the normal “earliest due first” processing of expired timers). ([docs.libuv.org][3])

This is why after a brutal pair of interval callbacks, the **next** timers phase often finds the 3-second timeout **overdue** (eligible), while the intervals’ _next_ fires are **not yet due** (they were just re-armed to “now + 100 ms”). Result: the timeout finally runs and clears things. 🎯

## 5) Practical takeaways ✅

- **Measure with monotonic time** (`performance.now()`), not by counting intervals. Expect drift under load; it’s by design. ([html.spec.whatwg.org][6])
- If fixed cadence matters, implement a **zero-drift scheduler** by manually scheduling the next run relative to a fixed epoch (i.e., align to `t0 + n·period`) rather than relying on `setInterval`’s rearm-from-now semantics. (This contrasts deliberately with libuv’s repeating-timer behavior.) ([docs.libuv.org][3])
- In general, Promise-based microtasks add **more overhead** than `queueMicrotask` due to allocation/continuation costs. Because this script runs both intervals concurrently, observed drift differences reflect combined contention; to compare intrinsic overhead, run each variant in isolation. ([GitHub][7])

## Sources 🔍

- **libuv timers (authoritative):** repeating timers re-armed relative to “now”; time is updated before executing timer callbacks. ([docs.libuv.org][3])
- **libuv / Node timers phase mechanics:** expired timers are chosen based on the updated loop time at phase start. ([Stack Overflow][5])
- **Node.js timers API:** timer timing is **not guaranteed**; load can delay execution. ([Node.js][1])
- **WHATWG HTML / `setInterval`:** do **not** schedule multiple follow-ups after a delayed execution (no catch-up semantics). ([GitHub][4])
- **HTML Standard (timers):** general caveats on timer accuracy and minimum-delay behavior. ([html.spec.whatwg.org][6])

[1]: https://nodejs.org/api/timers.html "Timers | Node.js v24.9.0 Documentation"
[2]: https://www.builder.io/blog/visual-guide-to-nodejs-event-loop "A Complete Visual Guide to Understanding the Node.js ..."
[3]: https://docs.libuv.org/en/v1.x/timer.html "uv_timer_t — Timer handle"
[4]: https://github.com/whatwg/html/issues/3151 "Should setInterval account for execution delays to prevent ..."
[5]: https://stackoverflow.com/questions/26849542/how-does-libuv-and-node-js-actually-schedule-timers "How does libuv and Node.js actually schedule timers?"
[6]: https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html "8.6 Timers - HTML Standard - whatwg"
[7]: https://github.com/nodejs/node/issues/21822 "setInterval keeps drifting over time · Issue #21822 · nodejs ..."
