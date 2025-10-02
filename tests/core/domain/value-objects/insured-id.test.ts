import { describe, it, expect } from "@jest/globals";
import { InsuredId } from "../../../../src/core/domain/value-objects/insured-id";

describe("InsuredId Value Object", () => {
  it("should create a valid InsuredId with 5 digits", () => {
    const insuredId = new InsuredId("00123");
    expect(insuredId.getValue()).toBe("00123");
  });

  it("should accept insuredId with leading zeros", () => {
    const insuredId = new InsuredId("00001");
    expect(insuredId.getValue()).toBe("00001");
  });

  it("should throw error if insuredId is empty", () => {
    expect(() => new InsuredId("")).toThrow("InsuredId cannot be empty");
  });

  it("should throw error if insuredId is not 5 digits", () => {
    expect(() => new InsuredId("123")).toThrow(
      "InsuredId must be exactly 5 digits"
    );
    expect(() => new InsuredId("123456")).toThrow(
      "InsuredId must be exactly 5 digits"
    );
  });

  it("should throw error if insuredId contains non-digits", () => {
    expect(() => new InsuredId("abc12")).toThrow(
      "InsuredId must be exactly 5 digits"
    );
    expect(() => new InsuredId("12-34")).toThrow(
      "InsuredId must be exactly 5 digits"
    );
  });

  it("should trim whitespace", () => {
    const insuredId = new InsuredId("  12345  ");
    expect(insuredId.getValue()).toBe("12345");
  });

  it("should correctly compare two InsuredIds", () => {
    const id1 = new InsuredId("00123");
    const id2 = new InsuredId("00123");
    const id3 = new InsuredId("00124");

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
  });

  it("should convert to string", () => {
    const insuredId = new InsuredId("12345");
    expect(insuredId.toString()).toBe("12345");
  });
});
