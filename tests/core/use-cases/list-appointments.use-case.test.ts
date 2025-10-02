import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ListAppointmentsByInsuredUseCase } from "../../../src/core/use-cases/list-appointments.use-case";
import { Appointment } from "../../../src/core/domain/entities/appointment";
import type { AppointmentRepository } from "../../../src/core/ports/appointment-repository.interface";

describe("ListAppointmentsByInsuredUseCase", () => {
  let mockRepository: jest.Mocked<AppointmentRepository>;
  let useCase: ListAppointmentsByInsuredUseCase;

  beforeEach(() => {
    mockRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByInsuredId: jest.fn(),
      update: jest.fn(),
    } as any;

    useCase = new ListAppointmentsByInsuredUseCase(mockRepository);
  });

  it("should list all appointments for an insured person", async () => {
    const appointment1 = Appointment.create({
      appointmentId: "test-123",
      insuredId: "00123",
      scheduleId: 100,
      countryISO: "PE",
    });

    const appointment2 = Appointment.create({
      appointmentId: "test-456",
      insuredId: "00123",
      scheduleId: 200,
      countryISO: "CL",
    });

    mockRepository.findByInsuredId.mockResolvedValue([
      appointment1,
      appointment2,
    ]);

    const result = await useCase.execute({ insuredId: "00123" });

    expect(result.insuredId).toBe("00123");
    expect(result.appointments).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.appointments[0].appointmentId).toBe("test-123");
    expect(result.appointments[0].countryISO).toBe("PE");
    expect(result.appointments[1].appointmentId).toBe("test-456");
    expect(mockRepository.findByInsuredId).toHaveBeenCalledWith("00123");
  });

  it("should return empty array when no appointments found", async () => {
    mockRepository.findByInsuredId.mockResolvedValue([]);

    const result = await useCase.execute({ insuredId: "99999" });

    expect(result.insuredId).toBe("99999");
    expect(result.appointments).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it("should throw error with invalid insuredId", async () => {
    await expect(useCase.execute({ insuredId: "123" })).rejects.toThrow(
      "InsuredId must be exactly 5 digits"
    );

    expect(mockRepository.findByInsuredId).not.toHaveBeenCalled();
  });

  it("should include appointment status and timestamps", async () => {
    const appointment = Appointment.create({
      appointmentId: "test-789",
      insuredId: "00456",
      scheduleId: 300,
      countryISO: "PE",
    });

    mockRepository.findByInsuredId.mockResolvedValue([appointment]);

    const result = await useCase.execute({ insuredId: "00456" });

    expect(result.appointments[0].status).toBe("pending");
    expect(result.appointments[0].createdAt).toBeDefined();
    expect(result.appointments[0].updatedAt).toBeDefined();
  });
});
