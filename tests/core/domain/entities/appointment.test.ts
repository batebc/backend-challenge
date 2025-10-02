import { describe, it, expect } from "@jest/globals";
import { Appointment } from "../../../../src/core/domain/entities/appointment";

describe("Appointment Entity", () => {
  describe("Factory method - create", () => {
    it("should create a new appointment with pending status", () => {
      const appointment = Appointment.create({
        appointmentId: "test-123",
        insuredId: "00123",
        scheduleId: 100,
        countryISO: "PE",
      });

      expect(appointment.appointmentId).toBe("test-123");
      expect(appointment.insuredId.getValue()).toBe("00123");
      expect(appointment.scheduleId).toBe(100);
      expect(appointment.countryISO.getValue()).toBe("PE");
      expect(appointment.status.isPending()).toBe(true);
      expect(appointment.createdAt).toBeInstanceOf(Date);
      expect(appointment.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error with invalid insuredId", () => {
      expect(() =>
        Appointment.create({
          appointmentId: "test-123",
          insuredId: "123",
          scheduleId: 100,
          countryISO: "PE",
        })
      ).toThrow();
    });

    it("should throw error with invalid countryISO", () => {
      expect(() =>
        Appointment.create({
          appointmentId: "test-123",
          insuredId: "00123",
          scheduleId: 100,
          countryISO: "US",
        })
      ).toThrow();
    });

    it("should throw error with invalid scheduleId", () => {
      expect(() =>
        Appointment.create({
          appointmentId: "test-123",
          insuredId: "00123",
          scheduleId: -1,
          countryISO: "PE",
        })
      ).toThrow();
    });
  });

  describe("Business logic - markAsCompleted", () => {
    it("should mark appointment as completed", () => {
      const appointment = Appointment.create({
        appointmentId: "test-123",
        insuredId: "00123",
        scheduleId: 100,
        countryISO: "PE",
      });

      const completedAppointment = appointment.markAsCompleted();

      expect(completedAppointment.isCompleted()).toBe(true);
      expect(completedAppointment.isPending()).toBe(false);
      expect(completedAppointment.updatedAt.getTime()).toBeGreaterThanOrEqual(
        appointment.updatedAt.getTime()
      );
    });

    it("should throw error when marking already completed appointment", () => {
      const appointment = Appointment.create({
        appointmentId: "test-123",
        insuredId: "00123",
        scheduleId: 100,
        countryISO: "PE",
      });

      const completedAppointment = appointment.markAsCompleted();

      expect(() => completedAppointment.markAsCompleted()).toThrow(
        "Appointment is already completed"
      );
    });
  });

  describe("Serialization", () => {
    it("should serialize to plain object", () => {
      const appointment = Appointment.create({
        appointmentId: "test-123",
        insuredId: "00123",
        scheduleId: 100,
        countryISO: "CL",
      });

      const obj = appointment.toObject();

      expect(obj).toEqual({
        appointmentId: "test-123",
        insuredId: "00123",
        scheduleId: 100,
        countryISO: "CL",
        status: "pending",
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it("should reconstitute from persistence data", () => {
      const data = {
        appointmentId: "test-123",
        insuredId: "00123",
        scheduleId: 100,
        countryISO: "PE",
        status: "completed",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-02"),
      };

      const appointment = Appointment.fromPersistence(data);

      expect(appointment.appointmentId).toBe("test-123");
      expect(appointment.isCompleted()).toBe(true);
      expect(appointment.createdAt).toEqual(new Date("2024-01-01"));
    });
  });
});
