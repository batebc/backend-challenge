import { describe, it, expect } from "@jest/globals";
import { AppointmentStatus } from "../../../../src/core/domain/value-objects/appointment-status";

describe("AppointmentStatus Value Object", () => {
  describe("Factory methods", () => {
    it("should create pending status", () => {
      const status = AppointmentStatus.pending();
      expect(status.getValue()).toBe("pending");
      expect(status.isPending()).toBe(true);
      expect(status.isCompleted()).toBe(false);
    });

    it("should create completed status", () => {
      const status = AppointmentStatus.completed();
      expect(status.getValue()).toBe("completed");
      expect(status.isCompleted()).toBe(true);
      expect(status.isPending()).toBe(false);
    });
  });

  describe("Constructor validation", () => {
    it("should accept valid pending status", () => {
      const status = new AppointmentStatus("pending");
      expect(status.getValue()).toBe("pending");
    });

    it("should accept valid completed status", () => {
      const status = new AppointmentStatus("completed");
      expect(status.getValue()).toBe("completed");
    });

    it("should throw error for empty status", () => {
      expect(() => new AppointmentStatus("")).toThrow(
        "AppointmentStatus cannot be empty"
      );
    });

    it("should throw error for invalid status", () => {
      expect(() => new AppointmentStatus("invalid")).toThrow(
        "AppointmentStatus must be either pending or completed"
      );
      expect(() => new AppointmentStatus("cancelled")).toThrow();
      expect(() => new AppointmentStatus("processing")).toThrow();
    });
  });

  describe("Normalization", () => {
    it("should normalize to lowercase", () => {
      const status1 = new AppointmentStatus("PENDING");
      const status2 = new AppointmentStatus("Completed");

      expect(status1.getValue()).toBe("pending");
      expect(status2.getValue()).toBe("completed");
    });

    it("should trim whitespace", () => {
      const status = new AppointmentStatus("  pending  ");
      expect(status.getValue()).toBe("pending");
    });
  });

  describe("Equality", () => {
    it("should correctly compare two status objects", () => {
      const status1 = AppointmentStatus.pending();
      const status2 = AppointmentStatus.pending();
      const status3 = AppointmentStatus.completed();

      expect(status1.equals(status2)).toBe(true);
      expect(status1.equals(status3)).toBe(false);
    });

    it("should handle case-insensitive comparison", () => {
      const status1 = new AppointmentStatus("pending");
      const status2 = new AppointmentStatus("PENDING");

      expect(status1.equals(status2)).toBe(true);
    });
  });

  describe("String conversion", () => {
    it("should convert to string", () => {
      const status = AppointmentStatus.completed();
      expect(status.toString()).toBe("completed");
    });
  });

  describe("State checking methods", () => {
    it("isPending should return true only for pending status", () => {
      const pending = AppointmentStatus.pending();
      const completed = AppointmentStatus.completed();

      expect(pending.isPending()).toBe(true);
      expect(completed.isPending()).toBe(false);
    });

    it("isCompleted should return true only for completed status", () => {
      const pending = AppointmentStatus.pending();
      const completed = AppointmentStatus.completed();

      expect(pending.isCompleted()).toBe(false);
      expect(completed.isCompleted()).toBe(true);
    });
  });
});
