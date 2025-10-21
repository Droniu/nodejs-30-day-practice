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
