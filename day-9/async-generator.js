// Read lines from a file one by one
import fs from "fs";
import readline from "readline";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function* readLines(file, delay = 20) {
  const rl = readline.createInterface({
    input: fs.createReadStream(file, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    await sleep(delay);
    yield line;
  }
}

for await (const line of readLines("unigram_freq.csv")) {
  console.log(line);
}
