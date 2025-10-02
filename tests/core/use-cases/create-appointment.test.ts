import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { CreateAppointmentUseCase } from "../../../src/core/use-cases/create-appointment.use-case";
import type { AppointmentRepository } from "../../../src/core/ports/appointment-repository.interface";
import type { MessagePublisher } from "../../../src/core/ports/message-publisher.interface";

describe("CreateAppointmentUseCase", () => {
  let mockRepository: jest.Mocked<AppointmentRepository>;
  let mockPublisher: jest.Mocked<MessagePublisher>;
  let useCase: CreateAppointmentUseCase;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByInsuredId: jest.fn(),
      update: jest.fn(),
    } as any;

    mockPublisher = {
      publish: jest.fn(),
    } as any;

    useCase = new CreateAppointmentUseCase(mockRepository, mockPublisher);
  });

  it("should create appointment and publish message", async () => {
    const input = {
      insuredId: "00123",
      scheduleId: 100,
      countryISO: "PE",
    };

    const result = await useCase.execute(input);

    expect(result.appointmentId).toBeDefined();
    expect(result.status).toBe("pending");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockPublisher.publish).toHaveBeenCalledTimes(1);
    expect(mockPublisher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        appointmentId: result.appointmentId,
        insuredId: "00123",
        scheduleId: 100,
        countryISO: "PE",
      }),
      expect.objectContaining({
        countryISO: "PE",
      })
    );
  });

  it("should throw error with invalid insuredId", async () => {
    const input = {
      insuredId: "123",
      scheduleId: 100,
      countryISO: "PE",
    };

    await expect(useCase.execute(input)).rejects.toThrow();
    expect(mockRepository.save).not.toHaveBeenCalled();
    expect(mockPublisher.publish).not.toHaveBeenCalled();
  });

  it("should throw error when repository fails", async () => {
    mockRepository.save.mockRejectedValue(new Error("DynamoDB error"));

    const input = {
      insuredId: "00123",
      scheduleId: 100,
      countryISO: "CL",
    };

    await expect(useCase.execute(input)).rejects.toThrow("DynamoDB error");
    expect(mockPublisher.publish).not.toHaveBeenCalled();
  });
});
