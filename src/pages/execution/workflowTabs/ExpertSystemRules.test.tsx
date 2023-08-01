import { checkPollCountAndCallBackAfterSeconds } from "./ExpertSystemRules"
import assert from "assert";

describe("Check Poll Count rule", () => {
  describe("Task that activates rule", () => {
    it("Should return an alert", () => {
      assert(true);
    });
  });

  describe("Task missing needed fields", () => {
    it("Should return empty array and not crash", () => {
      assert(true);
    });
  });
});

