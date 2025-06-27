import {BaseException, GenericException} from "../src/exceptions";

describe("GenericException.toString() & responseData", () => {
  it("always includes the class name and message, and never prints Data: when empty", () => {
    const ex = new GenericException("all good");
    const str = ex.toString();

    expect(ex).toBeInstanceOf(GenericException);
    expect(ex).toBeInstanceOf(BaseException);
    expect(str).toContain("all good");
    expect(str).not.toContain("Data:");
    expect(ex.responseData).toEqual({});
  });

  it("records one key/value and includes them in toString()", () => {
    const ex = new GenericException("something went wrong");
    ex.withData("code", "E1001");

    const str = ex.toString();

    expect(ex.responseData).toHaveProperty("code", ["E1001"]);
    expect(str).toContain("something went wrong");
    expect(str).toContain("code");
    expect(str).toContain('["E1001"]');
  });

  it("accumulates multiple values under the same key", () => {
    const ex = new GenericException("multi-value");
    ex.withData("tag", "alpha")
        .withData("tag", "beta")
        .withData("tag", "gamma");

    const str = ex.toString();
    expect(ex.responseData.tag).toEqual(["alpha", "beta", "gamma"]);
    expect(str).toContain("tag");
    expect(str).toContain('["alpha", "beta", "gamma"]');
  });

  it("handles multiple distinct keys", () => {
    const ex = new GenericException("multi-key");
    ex.withData("first", "1")
        .withData("second", "2")
        .withData("first", "3");

    const str = ex.toString();

    expect(ex.responseData).toHaveProperty("first", ["1", "3"]);
    expect(ex.responseData).toHaveProperty("second", ["2"]);
    expect(str).toContain("first");
    expect(str).toContain('["1", "3"]');
    expect(str).toContain("second");
    expect(str).toContain('["2"]');
  });
});
