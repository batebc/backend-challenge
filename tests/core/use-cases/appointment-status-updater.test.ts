import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { UpdateAppointmentStatusUseCase } from "../../../src/core/use-cases/update-appointment-status.use-case";
import { Appointment } from "../../../src/core/domain/entities/appointment";
import { NotFoundError } from "../../../src/shared/errors/custom-errors";
import type { AppointmentRepository } from "../../../src/core/ports/appointment-repository.interface";

describe("UpdateAppointmentStatusUseCase", () => {
  let mockRepository: jest.Mocked<AppointmentRepository>;
  let useCase: UpdateAppointmentStatusUseCase;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByInsuredId: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new UpdateAppointmentStatusUseCase(mockRepository);
  });

  describe("Successful updates", () => {
    it("should update appointment status from pending to completed", async () => {
      const appointment = Appointment.create({
        appointmentId: "test-123",
        insuredId: "00123",
        scheduleId: 100,
        countryISO: "PE",
      });

      mockRepository.findById.mockResolvedValue(appointment);

      await useCase.execute({ appointmentId: "test-123" });

      expect(mockRepository.findById).toHaveBeenCalledWith("test-123");
      expect(mockRepository.update).toHaveBeenCalledTimes(1);

      const updatedAppointment = mockRepository.update.mock.calls[0][0];
      expect(updatedAppointment.isCompleted()).toBe(true);
      expect(updatedAppointment.isPending()).toBe(false);
    });

    it("should update the updatedAt timestamp", async () => {
      const appointment = Appointment.create({
        appointmentId: "test-456",
        insuredId: "00456",
        scheduleId: 200,
        countryISO: "CL",
      });

      const originalUpdatedAt = appointment.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      mockRepository.findById.mockResolvedValue(appointment);

      await useCase.execute({ appointmentId: "test-456" });

      const updatedAppointment = mockRepository.update.mock.calls[0][0];
      expect(updatedAppointment.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Error handling", () => {
    it("should throw NotFoundError when appointment does not exist", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute({ appointmentId: "non-existent" })
      ).rejects.toThrow(NotFoundError);

      await expect(
        useCase.execute({ appointmentId: "non-existent" })
      ).rejects.toThrow("Appointment not found: non-existent");

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when trying to complete already completed appointment", async () => {
      const appointment = Appointment.create({
        appointmentId: "test-789",
        insuredId: "00789",
        scheduleId: 300,
        countryISO: "PE",
      });

      const completedAppointment = appointment.markAsCompleted();
      mockRepository.findById.mockResolvedValue(completedAppointment);

      await expect(
        useCase.execute({ appointmentId: "test-789" })
      ).rejects.toThrow("Appointment is already completed");

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should propagate repository errors", async () => {
      const appointment = Appointment.create({
        appointmentId: "test-999",
        insuredId: "00999",
        scheduleId: 400,
        countryISO: "CL",
      });

      mockRepository.findById.mockResolvedValue(appointment);
      mockRepository.update.mockRejectedValue(
        new Error("DynamoDB connection error")
      );

      await expect(
        useCase.execute({ appointmentId: "test-999" })
      ).rejects.toThrow("DynamoDB connection error");
    });
  });

  describe("Edge cases", () => {
    it("should handle appointments from different countries", async () => {
      const peAppointment = Appointment.create({
        appointmentId: "pe-001",
        insuredId: "00001",
        scheduleId: 100,
        countryISO: "PE",
      });

      mockRepository.findById.mockResolvedValue(peAppointment);

      await useCase.execute({ appointmentId: "pe-001" });

      const updated = mockRepository.update.mock.calls[0][0];
      expect(updated.countryISO.getValue()).toBe("PE");
      expect(updated.isCompleted()).toBe(true);
    });

    it("should preserve all appointment data except status and updatedAt", async () => {
      const appointment = Appointment.create({
        appointmentId: "preserve-test",
        insuredId: "12345",
        scheduleId: 999,
        countryISO: "CL",
      });

      mockRepository.findById.mockResolvedValue(appointment);

      await useCase.execute({ appointmentId: "preserve-test" });

      const updated = mockRepository.update.mock.calls[0][0];
      expect(updated.appointmentId).toBe("preserve-test");
      expect(updated.insuredId.getValue()).toBe("12345");
      expect(updated.scheduleId).toBe(999);
      expect(updated.countryISO.getValue()).toBe("CL");
      expect(updated.createdAt).toEqual(appointment.createdAt);
    });
  });
});
