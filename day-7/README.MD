# 🧩 Extending Node.js with C++ – Native Addons 101

Welcome to the underground of Node.js, where **JavaScript meets raw C++ power**.  
If you ever wanted to make Node _blazingly fast_, integrate C/C++ libraries, or write performance-critical logic beyond V8’s reach — you’re in the right gym. 🏋️‍♂️

## 🚀 What Are Node.js Native Addons?

Node.js runs on **V8**, a C++ engine that executes JavaScript.  
But sometimes JS alone isn't enough — maybe you need to crunch numbers, work with files at lightning speed, or integrate native C++ libraries (like OpenCV, libcurl, zlib, etc).

👉 **Native addons** are compiled shared libraries (`.node` files) written in C++ that you can `require()` directly in your JS code.

They act as **bridges** between JavaScript and native code using an API called **N-API** (Node API).

## 🧠 How It Works (High-Level)

1. You write C++ code that defines exported functions via `NAPI` or `node-addon-api`.
2. A build file called `binding.gyp` tells Node how to compile your C++ source.
3. You compile using **`node-gyp`**, which generates a `.node` binary.
4. You `require()` that binary just like a normal JS module.

Example:

```js
const hello = require("./build/Release/hello.node");
console.log(hello.hello()); // "Hello from C++ addon!"
```

## ⚙️ The Build Flow

### 1️⃣ `binding.gyp`

This JSON-like file tells **node-gyp** how to build your addon.
It lists your C++ source files, include paths, and build flags.

Example:

```json
{
  "targets": [
    {
      "target_name": "hello",
      "sources": ["hello.cc"],
      "include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"],
      "dependencies": ["<!(node -p \"require('node-addon-api').gyp\")"]
    }
  ]
}
```

Think of this as your **Makefile** for Node addons.

### 2️⃣ `node-gyp`

`node-gyp` is a cross-platform build tool maintained by the Node.js team.
Under the hood it wraps **Python + GYP** (Google’s project generator) to build native modules for Node.

💡 GYP uses **`binding.gyp`** to generate platform-specific project files:

- `.vcxproj` on Windows (Visual Studio)
- `Makefile` on Linux/macOS

Then it compiles the code using your system’s C++ toolchain into a `.node` binary.

### 3️⃣ `napi.h`

`napi.h` is the **C++ header** that exposes the Node API — a stable interface between JavaScript and C++.
It defines types like `Napi::Env`, `Napi::Object`, and `Napi::Function` that make working with JS values safe and clean.

Without N-API, you’d need to hook directly into **V8 internals** (which change between Node versions).
With N-API, your addon stays **binary-compatible** across Node releases. 🧱

## 🧠 Difference Between `napi.h` and `node-addon-api`

These two often confuse devs because they’re closely related — one is the _core interface_, the other is the _C++ abstraction layer_.

| Feature              | **N-API (`napi.h`)**                                            | **node-addon-api**             |
| -------------------- | --------------------------------------------------------------- | ------------------------------ |
| Language             | C (pure C API)                                                  | C++ (OOP wrapper)              |
| Provided by          | Node.js core                                                    | npm package (`node-addon-api`) |
| Stability            | Stable, versioned interface maintained by Node core             | Built _on top_ of N-API        |
| Memory safety        | Manual                                                          | Uses RAII & exceptions         |
| Code style           | Verbose function calls                                          | Modern C++ classes & methods   |
| Example              | `napi_create_string_utf8(env, "hi", NAPI_AUTO_LENGTH, &result)` | `Napi::String::New(env, "hi")` |
| Binary compatibility | ✅ Yes                                                          | ✅ Yes (via N-API underneath)  |

## 👋 Hello World Example

### C++ (`hello.cc`)

```cpp
#include <napi.h>
#include <iostream>

Napi::String HelloMethod(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  std::cout << "C++ says hi from native land!" << std::endl;
  return Napi::String::New(env, "Hello from C++ addon!");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("hello", Napi::Function::New(env, HelloMethod));
  return exports;
}

NODE_API_MODULE(hello, Init)
```

### JS (`index.js`)

```js
const hello = require("./build/Release/hello.node");
console.log(hello.hello());
```

### Build Command

```bash
npm i
npx node-gyp configure build
node index.js
```

Output:

```
C++ says hi from native land!
Hello from C++ addon!
```

## 💼 Common Use Cases

| Use Case               | Example                                |
| ---------------------- | -------------------------------------- |
| 🧮 Heavy computation   | Math libraries, image/voice processing |
| ⚙️ Wrapping C/C++ libs | OpenCV, zlib, SQLite, TensorRT         |
| 🔌 Hardware access     | Serial ports, Bluetooth, USB           |
| 💬 Native APIs         | Win32, POSIX, macOS system calls       |
| 🧠 Security / crypto   | Hashing, encryption, compression       |

## 🧩 Patterns & Best Practices

- Use **`node-addon-api`** to simplify your life (it wraps N-API in modern C++).
- Always clean up resources properly (RAII patterns help).
- Avoid blocking the event loop — use **`Napi::AsyncWorker`** for heavy tasks.
- Return JS objects instead of plain values when dealing with complex data.
- Version your `.node` binaries or rebuild on install (`npm rebuild`).

## ❓ Common Interview Questions

> 🧠 These come up surprisingly often when interviewing for backend, infra, or Node performance roles.

1. **What are Node.js native addons and why would you use them?**
   → Native addons let you call C/C++ code from Node.js for performance or system integration.

2. **What is N-API and why is it important?**
   → It’s a stable interface between JS and C++ so addons don’t break between Node versions.

3. **What does `NODE_API_MODULE` do?**
   → It registers your module’s entry point so Node knows what to export.

4. **What’s the difference between V8 API and N-API?**
   → V8 API ties you to a specific engine version; N-API stays stable across Node versions.

5. **What’s `node-gyp`?**
   → The build tool that compiles C/C++ code into `.node` binaries usable by Node.js.

6. **Can you use other languages like Rust or C for addons?**
   → Yes — Rust via `neon` or `napi-rs`, and plain C via N-API C bindings.

7. **When should you _not_ use a native addon?**
   → For simple logic or I/O-bound tasks — the overhead of compilation and maintenance isn’t worth it.

## 🏁 TL;DR

| Tool                            | Role                               |
| ------------------------------- | ---------------------------------- |
| **`node-gyp`**                  | Compiles your C++ code             |
| **`binding.gyp`**               | Build configuration                |
| **`napi.h` / `node-addon-api`** | Interface to Node & V8             |
| **`.node` file**                | Compiled shared binary             |
| **`require()`**                 | Loads native addon like any module |

```

```
