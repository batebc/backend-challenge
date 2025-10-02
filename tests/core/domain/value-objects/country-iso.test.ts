import { describe, it, expect } from "@jest/globals";
import { CountryISO } from "../../../../src/core/domain/value-objects/country-iso";

describe("CountryISO Value Object", () => {
  describe("Valid countries", () => {
    it("should create a valid CountryISO for Peru", () => {
      const country = new CountryISO("PE");
      expect(country.getValue()).toBe("PE");
      expect(country.isPeru()).toBe(true);
      expect(country.isChile()).toBe(false);
    });

    it("should create a valid CountryISO for Chile", () => {
      const country = new CountryISO("CL");
      expect(country.getValue()).toBe("CL");
      expect(country.isChile()).toBe(true);
      expect(country.isPeru()).toBe(false);
    });
  });

  describe("Normalization", () => {
    it("should normalize lowercase to uppercase", () => {
      const country = new CountryISO("pe");
      expect(country.getValue()).toBe("PE");
    });

    it("should normalize mixed case to uppercase", () => {
      const country = new CountryISO("pE");
      expect(country.getValue()).toBe("PE");
    });

    it("should trim whitespace", () => {
      const country = new CountryISO("  CL  ");
      expect(country.getValue()).toBe("CL");
    });
  });

  describe("Validation errors", () => {
    it("should throw error if countryISO is empty", () => {
      expect(() => new CountryISO("")).toThrow("CountryISO cannot be empty");
    });

    it("should throw error for invalid country code", () => {
      expect(() => new CountryISO("US")).toThrow(
        "CountryISO must be either PE or CL"
      );
      expect(() => new CountryISO("BR")).toThrow(
        "CountryISO must be either PE or CL"
      );
      expect(() => new CountryISO("XX")).toThrow(
        "CountryISO must be either PE or CL"
      );
    });

    it("should throw error for invalid format", () => {
      expect(() => new CountryISO("PER")).toThrow();
      expect(() => new CountryISO("P")).toThrow();
      expect(() => new CountryISO("123")).toThrow();
    });
  });

  describe("Equality", () => {
    it("should correctly compare two CountryISO objects", () => {
      const country1 = new CountryISO("PE");
      const country2 = new CountryISO("PE");
      const country3 = new CountryISO("CL");

      expect(country1.equals(country2)).toBe(true);
      expect(country1.equals(country3)).toBe(false);
    });

    it("should handle case-insensitive comparison", () => {
      const country1 = new CountryISO("pe");
      const country2 = new CountryISO("PE");

      expect(country1.equals(country2)).toBe(true);
    });
  });

  describe("String conversion", () => {
    it("should convert to string", () => {
      const country = new CountryISO("CL");
      expect(country.toString()).toBe("CL");
    });
  });
});
