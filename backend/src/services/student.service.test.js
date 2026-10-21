import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { toNameKey } from "./student.service.js";

describe("toNameKey", () => {
  it("recognises the same student whatever the case and the spaces", () => {
    assert.equal(toNameKey("Ana Torres"), "ana torres");
    assert.equal(toNameKey("  ana   torres "), "ana torres");
    assert.equal(toNameKey("ANA TORRES"), "ana torres");
  });

  it("keeps different names apart", () => {
    assert.notEqual(toNameKey("Ana"), toNameKey("Ana Torres"));
  });
});
