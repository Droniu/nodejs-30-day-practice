console.log("1. script start");

// A fake async "I/O operation" (simulated with fs)
const fs = require("fs");
fs.readFile(__filename, () => {
  console.log("5. I/O callback (fs.readFile)");

  setTimeout(() => console.log("7. setTimeout inside I/O (timers phase)"), 0);
  setImmediate(() => console.log("6. setImmediate inside I/O (check phase)"));
});

setTimeout(() => console.log("4. setTimeout 0ms (timers phase)"), 0);
setImmediate(() => console.log("3. setImmediate (check phase)"));

process.nextTick(() => console.log("2. process.nextTick (microtask)"));
Promise.resolve().then(() =>
  console.log("2b. Promise.resolve.then (microtask)")
);

console.log("1b. script end");
