import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ProcessAppointmentUseCase } from "../../../src/core/use-cases/process-appointment.use-case";
import type { RDSAppointmentRepository } from "../../../src/core/ports/rds-repository.interface";
import type { EventPublisher } from "../../../src/core/ports/event-publisher.interface";

describe("ProcessAppointmentUseCase", () => {
  let mockRDSRepository: jest.Mocked<RDSAppointmentRepository>;
  let mockEventPublisher: jest.Mocked<EventPublisher>;
  let useCase: ProcessAppointmentUseCase;

  beforeEach(() => {
    mockRDSRepository = {
      save: jest.fn(),
    } as any;

    mockEventPublisher = {
      publishAppointmentCompleted: jest.fn(),
    } as any;

    useCase = new ProcessAppointmentUseCase(
      mockRDSRepository,
      mockEventPublisher
    );
  });

  describe("Successful processing", () => {
    it("should save appointment to RDS and publish completion event", async () => {
      const input = {
        appointmentId: "test-123",
        insuredId: "00123",
        scheduleId: 100,
        countryISO: "PE",
      };

      await useCase.execute(input);

      expect(mockRDSRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRDSRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentId: "test-123",
          insuredId: "00123",
          scheduleId: 100,
          countryISO: "PE",
          createdAt: expect.any(Date),
        })
      );

      expect(
        mockEventPublisher.publishAppointmentCompleted
      ).toHaveBeenCalledTimes(1);
      expect(
        mockEventPublisher.publishAppointmentCompleted
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          appointmentId: "test-123",
          insuredId: "00123",
          scheduleId: 100,
          countryISO: "PE",
          completedAt: expect.any(String),
        })
      );
    });

    it("should process Peru appointment", async () => {
      const input = {
        appointmentId: "pe-001",
        insuredId: "00001",
        scheduleId: 100,
        countryISO: "PE",
      };

      await useCase.execute(input);

      expect(mockRDSRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ countryISO: "PE" })
      );
    });

    it("should process Chile appointment", async () => {
      const input = {
        appointmentId: "cl-001",
        insuredId: "00002",
        scheduleId: 200,
        countryISO: "CL",
      };

      await useCase.execute(input);

      expect(mockRDSRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ countryISO: "CL" })
      );
    });
  });

  describe("Error handling", () => {
    it("should throw error when RDS save fails", async () => {
      mockRDSRepository.save.mockRejectedValue(
        new Error("MySQL connection error")
      );

      const input = {
        appointmentId: "test-456",
        insuredId: "00456",
        scheduleId: 300,
        countryISO: "PE",
      };

      await expect(useCase.execute(input)).rejects.toThrow(
        "MySQL connection error"
      );

      expect(
        mockEventPublisher.publishAppointmentCompleted
      ).not.toHaveBeenCalled();
    });

    it("should throw error when event publishing fails", async () => {
      mockEventPublisher.publishAppointmentCompleted.mockRejectedValue(
        new Error("EventBridge error")
      );

      const input = {
        appointmentId: "test-789",
        insuredId: "00789",
        scheduleId: 400,
        countryISO: "CL",
      };

      await expect(useCase.execute(input)).rejects.toThrow("EventBridge error");

      expect(mockRDSRepository.save).toHaveBeenCalled();
    });
  });

  describe("Data integrity", () => {
    it("should generate ISO timestamp for completedAt event", async () => {
      const beforeExecution = new Date().toISOString();

      await useCase.execute({
        appointmentId: "test-time",
        insuredId: "00999",
        scheduleId: 500,
        countryISO: "PE",
      });

      const afterExecution = new Date().toISOString();
      const eventCall =
        mockEventPublisher.publishAppointmentCompleted.mock.calls[0][0];

      expect(eventCall.completedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      expect(eventCall.completedAt >= beforeExecution).toBe(true);
      expect(eventCall.completedAt <= afterExecution).toBe(true);
    });

    it("should preserve all input data in RDS", async () => {
      const input = {
        appointmentId: "full-data-test",
        insuredId: "12345",
        scheduleId: 999,
        countryISO: "CL",
      };

      await useCase.execute(input);

      const savedData = mockRDSRepository.save.mock.calls[0][0];
      expect(savedData.appointmentId).toBe(input.appointmentId);
      expect(savedData.insuredId).toBe(input.insuredId);
      expect(savedData.scheduleId).toBe(input.scheduleId);
      expect(savedData.countryISO).toBe(input.countryISO);
    });

    it("should preserve all input data in completion event", async () => {
      const input = {
        appointmentId: "event-data-test",
        insuredId: "54321",
        scheduleId: 888,
        countryISO: "PE",
      };

      await useCase.execute(input);

      const eventData =
        mockEventPublisher.publishAppointmentCompleted.mock.calls[0][0];
      expect(eventData.appointmentId).toBe(input.appointmentId);
      expect(eventData.insuredId).toBe(input.insuredId);
      expect(eventData.scheduleId).toBe(input.scheduleId);
      expect(eventData.countryISO).toBe(input.countryISO);
    });
  });

  describe("Execution order", () => {
    it("should save to RDS before publishing event", async () => {
      const executionOrder: string[] = [];

      mockRDSRepository.save.mockImplementation(async () => {
        executionOrder.push("RDS_SAVE");
      });

      mockEventPublisher.publishAppointmentCompleted.mockImplementation(
        async () => {
          executionOrder.push("EVENT_PUBLISH");
        }
      );

      await useCase.execute({
        appointmentId: "order-test",
        insuredId: "00111",
        scheduleId: 111,
        countryISO: "PE",
      });

      expect(executionOrder).toEqual(["RDS_SAVE", "EVENT_PUBLISH"]);
    });
  });
});
