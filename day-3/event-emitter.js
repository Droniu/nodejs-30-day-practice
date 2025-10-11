import { EventEmitter } from "node:events";

class SpecialEmitter extends EventEmitter {
  onceWithTimeout(event, timeout) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off(event, onEvent);
        reject(
          new Error(`Timeout waiting for event '${event}' after ${timeout}ms`)
        );
      }, timeout);

      const onEvent = (...args) => {
        clearTimeout(timer);
        this.off(event, onEvent);
        resolve(...args);
      };

      this.once(event, onEvent);
    });
  }
}

const specialEmitter = new SpecialEmitter();

specialEmitter.onceWithTimeout("event", 1000).then(() => {
  console.log("event logged");
});

specialEmitter.emit("event");

export { SpecialEmitter };
