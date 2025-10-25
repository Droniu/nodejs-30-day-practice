if (!Promise.allSettled) {
  Promise.allSettled = function (promises) {
    const results = promises.map((promise) =>
      Promise.resolve(promise)
        .then((value) => {
          return { status: "fulfilled", value };
        })
        .catch((reason) => {
          return { status: "rejected", reason };
        })
    );
    return Promise.all(results);
  };
}
