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
  console.log("child process killed with SIGTERM");
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});
