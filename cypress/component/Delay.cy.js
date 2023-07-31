import React from "react";
// Synchronous wait to prevent browser time out
// in CI tests (github actions)
// Should be the first component test (alphabetical order)
const syncWait = (ms) => {
  const end = Date.now() + ms;
  while (Date.now() < end) continue;
};

syncWait(10000);
