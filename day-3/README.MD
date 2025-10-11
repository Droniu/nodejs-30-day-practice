## EventEmitter in Node.js ✨

JavaScript in Node.js is event-driven. The built-in `EventEmitter` lets you broadcast named events and subscribe to them with listeners. It’s the foundation behind many Node APIs (HTTP servers, streams, process signals, etc.).

### What is an EventEmitter? 🧠

- **`emit(eventName, ...args)`**: Broadcast an event with optional payload.
- **`on(eventName, listener)`**: Listen every time the event fires.
- **`once(eventName, listener)`**: Listen only for the next occurrence, then auto-remove.
- **`off(eventName, listener)`** (aka `removeListener`): Stop listening.
- **`listenerCount(eventName)`**: How many listeners are registered.

### Real‑world use cases 🌐

- **Request lifecycle hooks**: Emit `request:received`, `response:sent`, or `request:error` so logging, tracing, and metrics run in separate, decoupled listeners.
- **WebSocket/SSE fan‑out**: Emit domain events like `user:updated` or `order:shipped`. A broadcaster listens and pushes updates to connected clients over WebSockets or Server‑Sent Events.
- **Background jobs and queues**: After an HTTP POST creates an order, emit `order:created`. A worker listens and performs email sending, invoicing, or PDF generation. In multi‑process setups, bridge these events to a message broker (e.g., RabbitMQ, NATS, Kafka).
- **External webhooks with deadlines**: Start a checkout flow, then wait for `payment:confirmed` which is emitted when the payment gateway webhook lands. Use `onceWithTimeout` to fail gracefully if the webhook never arrives.
- **Streaming and uploads**: Streams (file uploads, response bodies) are EventEmitters that emit `data`, `end`, and `error`. Compose pipeline stages as listeners for clear back‑pressure and error paths.
- **Cache invalidation**: When data changes, emit `cache:invalidate:{key}`. Listeners purge Redis/memory caches without coupling the mutation path to cache logic.
- **Rate limiting and security**: Emit `auth:failed` or `rate:throttled` and let security/auditing modules react (e.g., counters, alerts, temporary bans) without cluttering request handlers.
- **Service orchestration**: In modular monoliths, propagate `user:created`, `email:verified`, etc., across modules via events. For distributed systems, mirror internal events to an external event bus for other services to consume.
- **Graceful shutdown**: Listen to `process` signals (e.g., `SIGTERM`) and internally emit `shutdown` so DB pools, queues, and HTTP servers can close in order—optionally with timeouts.
- **Plugin/extension hooks**: Expose events like `plugin:loaded` or `route:registered` so plugins extend behavior without touching core code.

### What we built 🚀

In `event-emitter.js` we created a small utility class `SpecialEmitter` that extends Node’s `EventEmitter` and adds a convenience method:

**`onceWithTimeout(event, timeout)`**

- Returns a Promise that:
  - ✅ **Resolves** with the event payload when `event` fires in time.
  - ⏰ **Rejects** if `timeout` milliseconds pass with no event.
- Cleans up the listener and the timer in both success and timeout paths to avoid leaks.

Under the hood:

- Starts a `setTimeout` that will reject the Promise if the event doesn’t arrive in time.
- Registers a one-time listener with `this.once(event, onEvent)`.
- If the event fires first, it clears the timer, removes the listener, and resolves.
- If the timer fires first, it removes the listener and rejects with a helpful error message.

Why this is useful 💡

- Prevents waiting forever for events that may never come.
- Ensures listeners are removed in all cases, reducing the risk of memory leaks.
- Gives a simple Promise-based API that’s easy to `await`.

### Quick demo 🧪

Running the script once will show the happy-path behavior:

```bash
npm start
```

You should see:

```text
event logged
```

That comes from `event-emitter.js`, which calls `onceWithTimeout("event", 1000)` and then immediately emits `"event"`.

### Tests included ✅

We use `vitest` to verify behavior in `event-emitter.test.js`:

- **Resolves before timeout**: Emits `"ping"` within the timeout and expects the Promise to resolve with the payload.
- **Rejects on timeout**: Doesn’t emit; expects a timeout error.
- **Listener cleanup on success**: After a successful resolve, `listenerCount("ping") === 0`.
- **Listener cleanup on timeout**: After a timeout, `listenerCount("ping") === 0`.
- **Late events don’t resurrect**: Emitting after timeout doesn’t resolve anything and no listeners remain.

Run the test suite:

```bash
npm test
```
